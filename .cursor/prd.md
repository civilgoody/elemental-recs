## Product Requirements Document: "Elemental Recs" - Your AI Bending Movie & TV Show Recommender

**Version:** 1.0
**Date:** May 23, 2025

**1. Project Overview**

The goal of this project is to develop "Elemental Recs," an AI-powered web application that provides personalized movie and TV show recommendations. Users will input three movies or TV shows they enjoy, and the system, leveraging the Gemini 2.0 Flash model and The Movie Database (TMDB) API, will generate tailored suggestions. The application will be built using Next.js, Shadcn UI, and Tailwind CSS, with a user interface themed around "Avatar: The Last Airbender." The initial MVP will focus on a simple, intuitive user experience, delivering high-quality recommendations with direct links to IMDb for further exploration.

**2. Goals**

* **MVP:** Launch a functional web application allowing users to input three liked movies/shows and receive relevant recommendations.
* **High-Quality Recommendations:** Utilize a robust prompt for Gemini 2.0 Flash to ensure recommendations are insightful and not generic.
* **Accurate Linking:** Provide direct IMDb links for each recommended title.
* **Engaging User Interface:** Implement an "Avatar: The Last Airbender" theme to create a unique and enjoyable user experience.
* **Scalable Foundation:** Build with modern technologies (Next.js, Gemini 2.0 Flash) to allow for future feature expansion.

**3. Target Audience**

* Individuals looking for new movies and TV shows to watch based on their existing preferences.
* Users who appreciate personalized and intelligently generated recommendations.
* Fans of "Avatar: The Last Airbender" who might be drawn in by the theme.

**4. Key Features (MVP)**

* **4.1. User Input:**
    * A single, clear input section on the homepage.
    * Three distinct text fields for users to enter the titles of movies or TV shows they like.
    * A "Generate Recommendations" (or a themed alternative, e.g., "Bend My Watchlist!") button.
* **4.2. Recommendation Engine:**
    * Integration with Gemini 2.0 Flash model.
    * A carefully crafted prompt (see section 7) to analyze user inputs and generate recommendations.
    * Logic to process the LLM's output.
* **4.3. Results Display:**
    * Recommendations rendered dynamically below the input field upon successful generation.
    * Each recommendation will display:
        * Title of the movie/show.
        * Release Year (to aid identification).
        * Type (Movie/TV Show - if reliably obtainable from LLM/TMDB).
        * A brief (1-2 sentence) explanation from the LLM on *why* this title is recommended based on the user's input (stretch goal for MVP, dependent on prompt success).
        * A direct link to the corresponding IMDb page.
* **4.4. TMDB API Integration:**
    * Fetch movie/show details (like release year, IMDb ID if available directly) to supplement LLM output and ensure accurate IMDb linking.
    * Potentially use TMDB to validate user input titles or suggest corrections (future consideration).

**5. Design and UI/UX**

* **5.1. Theme: Avatar: The Last Airbender**
    * **Color Palette:** Inspired by the four nations (Water Tribe blues and whites, Earth Kingdom greens and browns, Fire Nation reds and golds, Air Nomad yellows and oranges). Perhaps a primary theme (e.g., Air Nomad for lightness and discovery) with accents from others.
    * **Typography:** Fonts that evoke a sense of adventure, fantasy, or Asian-inspired calligraphy, while remaining highly legible (e.g., a slightly stylized sans-serif for body text, and a more thematic font for headers).
    * **Imagery/Icons:** Subtle use of elemental symbols (water, earth, fire, air) or silhouettes inspired by the show for iconography (e.g., the generate button, loading spinners). Backgrounds could feature minimalist landscapes or textures reminiscent of the show's art style.
    * **Layout:** Clean, simple, and intuitive, aligning with the MVP's focus. Shadcn UI components will be styled to fit the theme.
* **5.2. MVP Homepage:**
    * **Header:** "Elemental Recs" logo (perhaps incorporating an elemental symbol).
    * **Input Section:** Clearly labeled input fields. The section could have a subtle background texture or border themed accordingly.
    * **Generate Button:** Prominent button with a clear call to action (e.g., "Find Your Next Binge," "Unveil Recommendations," or "Show Me What To Watch!").
    * **Results Area:** Cards or list items for each recommendation, designed with the theme. Each card should be easily scannable.
    * **Footer:** Minimal, perhaps with a small credit or a link to your portfolio/GitHub.

**6. Technical Considerations**

* **6.1. Frontend:**
    * Next.js (App Router recommended for modern features).
    * React.
    * Shadcn UI for pre-built, accessible components.
    * Tailwind CSS for styling.
* **6.2. AI Model:**
    * Gemini 2.0 Flash API integration.
    * Secure handling of API keys (use environment variables).
* **6.3. Movie/Show Data API:**
    * TMDB API for fetching movie/TV show details.
    * Need to handle API rate limits.
    * Secure handling of TMDB API key.
* **6.4. Backend Logic (within Next.js API Routes or Server Actions):**
    * Receive user input.
    * Construct the prompt for Gemini 2.0 Flash.
    * Call the Gemini API.
    * Parse the LLM response (this will be critical – ensure the LLM output is structured or can be reliably parsed to extract titles, years, and potentially rationale).
    * Query TMDB API with titles from LLM to get IMDb IDs and other structured data. This step is crucial for reliable IMDb linking. Sometimes LLMs might hallucinate specific IDs or slightly misremember titles/years. TMDB acts as a verification layer.
    * Format data for frontend display.
* **6.5. Error Handling:**
    * Invalid user inputs (e.g., empty fields).
    * Gemini API errors (e.g., API down, quota exceeded).
    * TMDB API errors (e.g., movie not found, API down).
    * Network errors.
    * Display user-friendly error messages.
* **6.6. Deployment:**
    * Consider platforms like Vercel (ideal for Next.js) or Netlify.

**7. Prompt Engineering for Gemini 2.0 Flash**

This is crucial for quality recommendations. The prompt needs to guide the LLM to:
1.  Identify common themes, genres, actors, directors, plot elements, or underlying reasons for enjoyment across the three user inputs.
2.  Suggest diverse yet relevant new titles.
3.  Return information that helps in uniquely identifying the movie/show for TMDB/IMDb lookup, primarily **Title** and **Release Year**. Explicitly asking for "Movie" or "TV Show" as a type can also be beneficial.

**Initial Prompt Idea (to be refined iteratively):**

```
You are an expert movie and TV show recommendation assistant.
A user has provided three titles they enjoyed:
1.  "{movie_or_show_1}"
2.  "{movie_or_show_2}"
3.  "{movie_or_show_3}"

Your task is to:
A. Thoroughly analyze what is common across these three titles. Consider elements such as genre, subgenre, themes, narrative style, character archetypes, directors, actors, tone, pacing, and potential underlying reasons why a person might enjoy all three.
B. Based on this analysis, recommend {X_NUMBER_OF_RECOMMENDATIONS, e.g., 5} new movies or TV shows that the user would likely enjoy.
C. For each recommendation, provide the following information in a clear, parsable format (e.g., JSON, or a very structured list):
    * `title`: The full title of the recommended movie or TV show.
    * `year`: The release year of the movie or the start year for a TV show.
    * `type`: Specify if it's a "Movie" or "TV Show".
    * `brief_reasoning`: A concise (1-2 sentences) explanation of *why* this specific title is a good recommendation based on your analysis of the user's inputs.

Example of desired output format for ONE recommendation (repeat for all recommendations):
Title: [Recommended Title]
Year: [YYYY]
Type: [Movie/TV Show]
Brief Reasoning: [Your concise explanation linking it to the user's inputs]

Focus on providing diverse and high-quality recommendations that go beyond obvious surface-level similarities. Prioritize titles that are well-regarded or critically acclaimed if they fit the user's taste profile. Do not recommend the input titles themselves.
```

**Nuances for Prompt Refinement:**

* **Specificity:** The more specific you can be in the prompt about what "analysis" entails, the better.
* **Output Format:** Requesting JSON output directly from the LLM can simplify parsing. Gemini models are often capable of this.
    * Example JSON request in prompt: `"...Please format your entire response as a single JSON object with a key 'recommendations' which is an array of objects, where each object contains 'title', 'year', 'type', and 'brief_reasoning'."`
* **Negative Constraints:** "Do not recommend titles released before [a certain year (e.g., 2000), if desired]" or "Avoid predominantly [genre user might dislike, if this becomes a feature later]."
* **Iterative Testing:** This prompt will require testing and refinement based on the actual outputs from Gemini 2.0 Flash.

**8. Code Implementation Nuances**

* **State Management:** For the MVP, React's built-in state (useState, useReducer) might be sufficient. For more complex features later, consider Zustand or Jotai for Next.js App Router compatibility.
* **API Route Handling:** When calling the Gemini API and TMDB API, do this from Next.js API routes (or Server Actions) to protect your API keys. Do not expose them on the client-side.
* **Loading States:** Implement clear loading indicators while recommendations are being fetched and processed. An Avatar-themed spinner (e.g., Aang's air scooter spinning) could be cool.
* **Debouncing/Throttling:** Not critical for MVP's three distinct inputs, but if you ever move to live search or more interactive inputs, consider this.
* **TMDB for IMDb ID:** TMDB API often provides IMDb IDs directly for movies and shows (`external_ids` endpoint or often included in main details). This is the most reliable way to get the correct IMDb link.
    * Workflow: LLM suggests Title + Year -> Search TMDB with Title + Year -> Get TMDB ID -> Get External IDs (including IMDb ID) from TMDB using TMDB ID -> Construct IMDb link (`https://www.imdb.com/title/{imdb_id}/`).

**9. Milestones (High-Level)**

* **Milestone 1: Core Backend & API Setup (1 week)**
    * Next.js project initialization.
    * Gemini 2.0 Flash API integration (basic call and response).
    * TMDB API integration (basic search and detail fetch).
    * Basic API route/server action for handling recommendations.
* **Milestone 2: MVP Frontend & Basic Styling (1-2 weeks)**
    * Homepage layout with input fields and results area using Next.js, Shadcn, Tailwind.
    * Connect frontend to the backend API route.
    * Display unstyled recommendations.
    * Basic error handling display.
* **Milestone 3: Prompt Refinement & Recommendation Logic (1 week)**
    * Iteratively test and refine the Gemini prompt.
    * Implement logic to parse LLM response and fetch data from TMDB.
    * Ensure accurate IMDb link generation.
* **Milestone 4: Avatar Theme Implementation (1 week)**
    * Apply Avatar: The Last Airbender theme (colors, fonts, imagery) to all UI elements.
    * Refine UI/UX for an engaging experience.
* **Milestone 5: Testing & MVP Launch (1 week)**
    * Thorough testing across different inputs and scenarios.
    * Bug fixing.
    * Deployment to Vercel.

**10. Future Enhancements (Post-MVP)**

* **User Accounts:** Save recommendation history, preferences.
* **More Input Options:**
    * Allowing users to specify genres they dislike.
    * Rating previous recommendations to refine future ones.
    * Inputting more than 3 movies/shows.
    * "Surprise Me" button with random (but good) recommendations.
* **Advanced Filtering/Sorting:** Filter recommendations by genre, release year, streaming service availability (requires another API).
* **Deeper Analysis Display:** Show more of the LLM's "reasoning" or common elements found.
* **"Why you might like this" for each recommendation:** Integrate the `brief_reasoning` from the LLM.
* **Visual Polish:** More sophisticated animations or themed elements.
* **Social Sharing:** Allow users to share their recommendations.
* **Loading Skeletons:** Use themed skeleton loaders for a better UX during data fetching.
* **Direct Streaming Links:** Integrate with APIs like JustWatch to provide links to where a movie/show can be streamed (more complex).

**11. Open Questions/Considerations**

* How many recommendations should be displayed per request for the MVP (e.g., 3, 5, 10)? (Let's assume 5 for now based on the prompt example).
* Specifics of the "Avatar" theme implementation – which nation's aesthetic will be primary? (Water Tribe).
* Fallback strategy if TMDB doesn't find a title suggested by the LLM (e.g., **skip**, or try a broader search).

**12. Cool Features**
- Streaming/skeleton loading
- Ratings for recommendations
- Consistent cards
