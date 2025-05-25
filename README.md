# 🌊 Elemental Recs 🔥

Your AI Bending Movie & TV Show Recommender

## 🎯 Overview

Elemental Recs is an AI-powered web application that provides personalized movie and TV show recommendations. Users input three movies or TV shows they enjoy, and the system leverages the Gemini 2.0 Flash model and The Movie Database (TMDB) API to generate tailored suggestions. The application features a beautiful Avatar: The Last Airbender themed interface built with Next.js, Shadcn UI, and Tailwind CSS.

## ✨ Features

- **Personalized Recommendations**: Input 3 favorite titles and get 5 tailored suggestions
- **AI-Powered Analysis**: Uses Gemini 2.0 Flash to analyze preferences and provide intelligent recommendations
- **IMDb Integration**: Direct links to IMDb pages for each recommendation
- **Avatar Theme**: Beautiful Water Tribe-inspired design with elemental animations
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Real-time Validation**: Ensures accurate movie/show data through TMDB API verification

## 🚀 Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript
- **UI Components**: Shadcn UI, Tailwind CSS 4
- **AI Model**: Google Gemini 2.0 Flash
- **Movie Data**: The Movie Database (TMDB) API
- **Icons**: Lucide React
- **Styling**: Avatar: The Last Airbender Water Tribe theme

## 📋 Prerequisites

Before running this project, you'll need:

1. **Node.js** (version 18 or higher)
2. **npm** or **yarn** package manager
3. **Gemini API Key** from Google AI Studio
4. **TMDB API Key** from The Movie Database

## 🛠️ Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/elemental-recs.git
cd elemental-recs
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Variables

Create a `.env.local` file in the root directory and add your API keys:

```bash
# Gemini AI API Key
GEMINI_API_KEY=your_gemini_api_key_here

# TMDB API Key
TMDB_API_KEY=your_tmdb_api_key_here
```

#### Getting API Keys:

**Gemini API Key:**
1. Visit [Google AI Studio](https://aistudio.google.com/)
2. Sign in with your Google account
3. Create a new API key
4. Copy the key to your `.env.local` file

**TMDB API Key:**
1. Visit [The Movie Database](https://www.themoviedb.org/)
2. Create an account or sign in
3. Go to Settings > API
4. Request an API key (choose "Developer" option)
5. Copy the API key to your `.env.local` file

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## 🎨 Avatar Theme

The application features a Water Tribe-inspired theme from Avatar: The Last Airbender:

- **Primary Colors**: Deep blues and light blues
- **Accent Colors**: Ice whites and water-inspired tones
- **Animations**: Custom water ripple and air floating effects
- **Icons**: Elemental symbols (Water, Air, Fire, Earth)
- **Typography**: Clean, readable fonts with thematic styling

## 🏗️ Project Structure

```
elemental-recs/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── recommendations/
│   │   │       └── route.ts          # API endpoint for recommendations
│   │   ├── globals.css               # Global styles and theme variables
│   │   ├── layout.tsx                # Root layout with metadata
│   │   └── page.tsx                  # Main application page
│   ├── components/
│   │   └── ui/                       # Shadcn UI components
│   └── lib/
│       └── utils.ts                  # Utility functions
├── public/                           # Static assets
├── package.json                      # Project dependencies
└── README.md                         # Project documentation
```

## 🔧 API Endpoints

### POST `/api/recommendations`

Generates movie/TV show recommendations based on user input.

**Request Body:**
```json
{
  "title1": "Avatar: The Last Airbender",
  "title2": "Studio Ghibli films",
  "title3": "The Lord of the Rings"
}
```

**Response:**
```json
{
  "recommendations": [
    {
      "title": "Princess Mononoke",
      "year": 1997,
      "type": "Movie",
      "brief_reasoning": "Like your favorites, this combines environmental themes with epic storytelling and rich world-building.",
      "imdb_id": "tt0119698",
      "imdb_url": "https://www.imdb.com/title/tt0119698/"
    }
  ]
}
```

## 🎮 Usage

1. **Input Your Favorites**: Enter three movies or TV shows you love in the input fields
2. **Generate Recommendations**: Click "Find My Next Binge" to get AI-powered suggestions
3. **Explore Results**: Browse through 5 personalized recommendations with explanations
4. **Visit IMDb**: Click "View on IMDb" to learn more about each recommendation

## 🌟 Key Features Explained

### AI Recommendation Engine

The application uses a carefully crafted prompt for Gemini 2.0 Flash that:
- Analyzes common themes, genres, and elements across your input titles
- Considers narrative style, character archetypes, tone, and pacing
- Provides diverse yet relevant suggestions
- Includes brief explanations for each recommendation

### TMDB Integration

- Validates AI-generated titles against real movie/show data
- Retrieves accurate release years and IMDb IDs
- Ensures reliable linking to IMDb pages
- Handles both movies and TV shows seamlessly

### Avatar-Themed UI

- Custom CSS animations inspired by elemental bending
- Water Tribe color palette with blues and whites
- Elemental icons that rotate through Water, Air, Fire, and Earth
- Subtle background patterns and hover effects

## 🚀 Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Visit [Vercel](https://vercel.com) and import your repository
3. Add your environment variables in the Vercel dashboard
4. Deploy!

### Deploy to Other Platforms

The application can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- Digital Ocean App Platform
- AWS Amplify

## 🛣️ Roadmap

### Potential Future Enhancements

- **User Accounts**: Save recommendation history and preferences
- **Advanced Filtering**: Filter by genre, release year, streaming availability
- **Social Features**: Share recommendations with friends
- **Streaming Integration**: Show where to watch each recommendation
- **Mobile App**: React Native version for iOS and Android
- **Theme Variants**: Other Avatar nations (Fire Nation, Earth Kingdom, Air Nomads)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Avatar: The Last Airbender** for the amazing world and aesthetic inspiration
- **Google Gemini** for the powerful AI recommendation engine
- **The Movie Database** for comprehensive movie and TV show data
- **Shadcn UI** for beautiful, accessible components
- **Next.js Team** for the excellent framework

## 📞 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/your-username/elemental-recs/issues) page
2. Create a new issue with a detailed description
3. Include error messages and steps to reproduce

---

**May the elements guide your next watch!** 🌊🔥🌪️🗻
