import { useState, useCallback, useRef } from 'react';
import { StreamingState, RecommendationInput } from '@/lib/types';

export function useStreamingRecommendations() {
  const [streamingState, setStreamingState] = useState<StreamingState>({
    recommendations: Array(5).fill(null),
    isComplete: false,
  });
  const [isInitializing, setIsInitializing] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);

  const startStreaming = useCallback(async (requestBody: RecommendationInput) => {
    setIsInitializing(true);
    setIsStreaming(false);
    
    // Don't reset streaming state immediately to prevent UI flicker
    // We'll reset it only after we successfully start the stream

    try {
      // Close any existing event source
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }

      // Make the initial POST request to start streaming
      const response = await fetch('/api/recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error('Failed to start streaming');
      }

      // Stream has started successfully - now reset the state
      setStreamingState({
        recommendations: Array(5).fill(null),
        isComplete: false,
      });
      setIsInitializing(false);
      setIsStreaming(true);

      // Create EventSource from the response stream
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }

      const decoder = new TextDecoder();
      let buffer = '';

      // Read the stream
      const processStream = async () => {
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) {
              break;
            }

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || ''; // Keep the incomplete line in buffer

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                try {
                  const eventData = JSON.parse(line.slice(6));
                  handleStreamEvent(eventData);
                } catch {
                  // Skip malformed JSON
                }
              }
            }
          }
        } catch {
          setStreamingState(prev => ({ ...prev, error: 'Streaming failed' }));
          setIsStreaming(false);
        }
      };

      processStream();

    } catch (error) {
      setStreamingState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }));
      setIsInitializing(false);
      setIsStreaming(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleStreamEvent = useCallback((event: any) => {
    setStreamingState(prev => {
      const newState = { ...prev };

      switch (event.type) {
        case 'start':
          break;

        case 'card-thinking':
          if (typeof event.index === 'number' && event.index >= 0 && event.index < 5) {
            const recommendations = [...prev.recommendations];
            recommendations[event.index] = {
              title: 'Thinking...',
              year: 0,
              type: 'Movie',
              country: '',
              original_language: '',
              isThinking: true,
              streamingText: ''
            };
            newState.recommendations = recommendations;
          }
          break;

        case 'recommendation':
          if (typeof event.index === 'number' && event.data && event.data.title) {
            const recommendations = [...prev.recommendations];
            recommendations[event.index] = {
              title: event.data.title,
              year: event.data.year,
              type: event.data.type,
              brief_reasoning: event.data.brief_reasoning || '',
              country: event.data.country || '',
              original_language: event.data.original_language || '',
              isThinking: event.data.isThinking || false,
              streamingText: '',
              enhanced: false,
            };
            newState.recommendations = recommendations;
          }
          break;

        case 'reasoning-delta':
          if (typeof event.index === 'number' && event.index >= 0 && event.index < 5) {
            const recommendations = [...prev.recommendations];
            const existingRec = recommendations[event.index];
            if (existingRec) {
              recommendations[event.index] = {
                ...existingRec,
                streamingText: (existingRec.streamingText || '') + event.data,
              };
              newState.recommendations = recommendations;
            }
          }
          break;

        case 'card-complete':
          if (typeof event.index === 'number' && event.index >= 0 && event.index < 5) {
            const recommendations = [...prev.recommendations];
            const existingRec = recommendations[event.index];
            if (existingRec) {
              recommendations[event.index] = {
                ...existingRec,
                brief_reasoning: existingRec.streamingText || existingRec.brief_reasoning,
                isThinking: false,
                streamingText: undefined,
              };
              newState.recommendations = recommendations;
            }
          }
          break;

        case 'complete':
          newState.isComplete = true;
          setIsStreaming(false);
          break;

        case 'error':
          newState.error = event.data;
          setIsStreaming(false);
          break;

        default:
          break;
      }

      return newState;
    });
  }, []);

  const stopStreaming = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    setIsInitializing(false);
    setIsStreaming(false);
  }, []);

  return {
    streamingState,
    isInitializing, // True only when starting the connection
    isStreaming,    // True while actively receiving data
    startStreaming,
    stopStreaming,
  };
} 
