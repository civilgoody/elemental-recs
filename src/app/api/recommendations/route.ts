import { getStreamingRecommendations } from '@/lib/ai';

export async function POST(request: Request) {
  try {
    const { title1, title2, title3 } = await request.json();

    if (!title1 || !title2 || !title3) {
      return new Response('Missing required titles', { status: 400 });
    }

    const textStream = await getStreamingRecommendations(title1, title2, title3);

    const encoder = new TextEncoder();
    let accumulatedText = '';
    const sentRecommendations = new Set();
    let isInJsonBlock = false;
    let currentCardIndex = 0;

    const stream = new ReadableStream({
      async start(controller) {
        // Send initial event immediately
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({
          type: 'start',
          data: 'AI is analyzing your preferences...'
        })}\n\n`));

        try {
          for await (const chunk of textStream) {
            accumulatedText += chunk;
            
            // Check if we're entering JSON block
            if (chunk.includes('{') && !isInJsonBlock) {
              isInJsonBlock = true;
              
              // Send "thinking" state for first few cards
              for (let i = 0; i < 5; i++) {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                  type: 'card-thinking',
                  index: i,
                  data: {}
                })}\n\n`));
                await new Promise(resolve => setTimeout(resolve, 100));
              }
            }
            
            if (isInJsonBlock) {
              // We're in JSON block, try to extract and send recommendations
              const currentJson = accumulatedText.substring(accumulatedText.indexOf('{'));
              
              // Try to find complete recommendations in the accumulated JSON
              const recRegex = /"title":\s*"([^"]+)",\s*"year":\s*(\d+),\s*"type":\s*"([^"]+)",\s*"brief_reasoning":\s*"([^"]+)",\s*"country":\s*"([^"]+)",\s*"original_language":\s*"([^"]+)"/g;
              let recMatch;
              
              while ((recMatch = recRegex.exec(currentJson)) !== null) {
                const [, title, year, type, brief_reasoning, country, original_language] = recMatch;
                const recKey = `${title}-${year}`;
                
                if (!sentRecommendations.has(recKey)) {
                  // Send the card data immediately (without brief_reasoning)
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                    type: 'recommendation',
                    index: currentCardIndex,
                    data: {
                      title,
                      year: parseInt(year),
                      type,
                      country,
                      original_language,
                      isThinking: true // Start in thinking state for brief_reasoning
                    }
                  })}\n\n`));
                  
                  await new Promise(resolve => setTimeout(resolve, 300));
                  
                  // Now stream the brief_reasoning character by character
                  for (const char of brief_reasoning) {
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                      type: 'reasoning-delta',
                      index: currentCardIndex,
                      data: char
                    })}\n\n`));
                    await new Promise(resolve => setTimeout(resolve, 30));
                  }
                  
                  // Mark this card as complete
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                    type: 'card-complete',
                    index: currentCardIndex,
                    data: {}
                  })}\n\n`));
                  
                  sentRecommendations.add(recKey);
                  currentCardIndex++;
                  
                  await new Promise(resolve => setTimeout(resolve, 500));
                }
              }
              
              // Check if we have all recommendations
              if (sentRecommendations.size >= 5) {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                  type: 'complete',
                  data: 'All recommendations generated successfully!'
                })}\n\n`));
                break;
              }
            }
          }
          
          // Fallback: if stream ends but we haven't completed, try to parse final JSON
          if (sentRecommendations.size < 5) {
            try {
              const jsonStart = accumulatedText.indexOf('{');
              if (jsonStart !== -1) {
                let cleanedText = accumulatedText.substring(jsonStart);
                cleanedText = cleanedText.replace(/```json\s*/, '').replace(/```\s*$/, '').trim();
                const parsed = JSON.parse(cleanedText);
                
                if (parsed.recommendations && Array.isArray(parsed.recommendations)) {
                  for (const rec of parsed.recommendations) {
                    const recKey = `${rec.title}-${rec.year}`;
                    if (!sentRecommendations.has(recKey)) {
                      controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                        type: 'recommendation',
                        index: currentCardIndex,
                        data: {
                          ...rec,
                          brief_reasoning: rec.brief_reasoning,
                          isThinking: false
                        }
                      })}\n\n`));
                      sentRecommendations.add(recKey);
                      currentCardIndex++;
                      await new Promise(resolve => setTimeout(resolve, 200));
                    }
                  }
                }
              }
              
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                type: 'complete',
                data: 'Recommendations completed!'
              })}\n\n`));
            } catch {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                type: 'complete',
                data: `Generated ${sentRecommendations.size} recommendations`
              })}\n\n`));
            }
          }
        } catch (error) {
          console.error('Error during streaming:', error);
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({
            type: 'error',
            data: error instanceof Error ? error.message : 'Unknown error occurred'
          })}\n\n`));
        } finally {
          controller.close();
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });

  } catch (error) {
    console.error('API Route Error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        details: error instanceof Error ? error.stack : undefined
      }), 
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
} 
