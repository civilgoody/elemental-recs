# Development Plan: TV Show/Movie Recommendation App

## 1. Goal

To develop a single-page web application where users can input at least three TV shows or movies they like, and receive six personalized recommendations with links to their IMDB pages. The application will leverage the Gemini Flash model via its API.

## 2. Core Technologies

*   **Frontend:** Next.js (React framework)
*   **Backend (API Route):** Next.js API Routes
*   **LLM:** Google Gemini Flash model
*   **Deployment:** Vercel (Hobby plan)
*   **Styling:** Tailwind CSS (or your preferred CSS solution within Next.js)

## 3. Prerequisites & User Setup

Before starting development, please ensure you have the following set up:

1.  **Node.js and npm/yarn:** Ensure Node.js (LTS version recommended) and your preferred package manager are installed.
2.  **Next.js Project:** You mentioned you've already run `create-next-app`. Great!
3.  **Google AI Studio Account & API Key:**
    *   Visit [Google AI Studio](https://aistudio.google.com/).
    *   Create a new API key. This key will be used to authenticate requests to the Gemini API.
    *   **Important:** Store this API key securely. We will use it as an environment variable in your Next.js project (e.g., `GOOGLE_API_KEY`). Do NOT commit it directly into your code.
4.  **Vercel Account:** Create a free account on [Vercel](https://vercel.com) for future deployment.

## 4. Development Phases

### Phase 1: Basic UI & Input

*   **Tasks:**
    *   Create the main page component (e.g., `app/page.tsx`).
    *   Implement an input area where users can type and add movie/show titles. Consider a way to manage a list of at least three titles (e.g., tags, list items).
    *   Add a "Get Recommendations" button.
    *   Set up basic layout and styling for the input section.
*   **Files to create/modify:** `app/page.tsx`, potentially a new component for input management, global CSS/styling files.

### Phase 2: API Route for LLM Interaction

*   **Tasks:**
    *   Create a Next.js API route (e.g., `app/api/recommendations/route.ts`).
    *   This route will accept a POST request containing the list of user-liked movies/shows.
    *   Implement logic to call the Gemini Flash API using your `GOOGLE_API_KEY`.
        *   You will need to install the necessary Google AI SDK (e.g., `@google/generative-ai`).
        *   Construct the prompt carefully to request 6 recommendations *and* their IMDB page URLs (see "IMDB Link Strategy" below).
    *   Process the LLM's response and send back the recommendations (title and IMDB link) or an error message.
*   **Files to create/modify:** `app/api/recommendations/route.ts`.
*   **User Setup:** Create a `.env.local` file in your project root and add your API key:
    ```
    GOOGLE_API_KEY=your_actual_api_key_here
    ```
    Ensure `.env.local` is listed in your `.gitignore` file.

### Phase 3: Frontend Logic & Displaying Recommendations

*   **Tasks:**
    *   In `app/page.tsx`, implement the function to call your `/api/recommendations` endpoint when the "Get Recommendations" button is clicked.
    *   Manage loading states (e.g., display a spinner while fetching).
    *   Display the list of 6 recommendations received from the API.
    *   Each recommendation should show the title and be a clickable link to the IMDB page.
*   **Files to create/modify:** `app/page.tsx`.

### Phase 4: Styling, Error Handling & Refinements

*   **Tasks:**
    *   Enhance the UI/UX. Make it clean and intuitive.
    *   Implement client-side validation (e.g., ensure at least 3 inputs).
    *   Implement robust error handling on both frontend and backend (e.g., API errors, no recommendations found).
    *   Ensure the page is responsive.
*   **Files to create/modify:** `app/page.tsx`, styling files, `app/api/recommendations/route.ts`.

## 5. IMDB Link Strategy

To avoid the complexity and potential costs of a separate web scraping or search API for IMDB links, the strategy will be to **prompt the Gemini Flash model to provide the IMDB URLs directly as part of its response.**

Your prompt to the Gemini API should be structured to request this. For example:

```
Given the following movies and TV shows that a user likes: [User Movie 1], [User Movie 2], [User Movie 3], ...

Please provide 6 new TV show or movie recommendations based on these preferences.
For each recommendation, provide:
1. The title of the movie or TV show.
2. The full URL to its official IMDB page.

Format the output clearly, for example, as a list of objects or a structured text that is easy to parse.
```

This relies on the Gemini model's ability to access and provide this information. Test this thoroughly. If the model struggles to provide accurate IMDB links consistently, we might need to revisit this, but it's the most cost-effective initial approach.

## 6. Cost Considerations

*   **Gemini API:** Google's Generative AI models typically have a free tier with certain usage limits. The "Flash" model is designed for speed and efficiency, which should align well with free tier usage for a personal project. Monitor your usage in the Google AI Studio console.
*   **Next.js:** Open source, no cost.
*   **Vercel Hosting:** The Hobby plan is free and suitable for personal projects and MVPs. It includes generous limits for bandwidth and serverless function executions.
*   **Overall:** This project can be developed and hosted with no direct monetary cost if kept within the free tier limits.

## 7. Deployment

*   **Platform:** Vercel
*   **Steps:**
    1.  Push your Next.js project to a Git repository (e.g., GitHub, GitLab).
    2.  Connect your Git repository to your Vercel account.
    3.  Configure environment variables on Vercel: Add your `GOOGLE_API_KEY` in the project settings on Vercel.
    4.  Vercel will automatically build and deploy your application upon pushes to the main branch (or as configured).

## 8. Future Considerations (Out of MVP Scope)

*   User accounts and persistent storage of preferences.
*   Ability to rate recommendations.
*   More advanced filtering options.
*   Displaying more details from IMDB (e.g., ratings, posters) via a more robust API if needed (might incur costs).
*   Loading skeletons or more sophisticated UI for loading states. 
