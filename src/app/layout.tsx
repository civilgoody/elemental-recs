import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Elemental Recs - Your AI Bending Movie & TV Show Recommender",
  description: "Get personalized movie and TV show recommendations using AI. Tell us three titles you love, and we'll bend the elements to find your next binge. Powered by Gemini AI and themed around Avatar: The Last Airbender.",
  keywords: ["movie recommendations", "TV show recommendations", "AI recommendations", "Avatar", "elemental", "personalized recommendations"],
  authors: [{ name: "Elemental Recs" }],
  creator: "Elemental Recs",
  publisher: "Elemental Recs",
  robots: "index, follow",
  openGraph: {
    title: "Elemental Recs - Your AI Bending Movie & TV Show Recommender",
    description: "Get personalized movie and TV show recommendations using AI. Powered by Gemini AI with an Avatar: The Last Airbender theme.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Elemental Recs - Your AI Bending Movie & TV Show Recommender",
    description: "Get personalized movie and TV show recommendations using AI. Powered by Gemini AI with an Avatar: The Last Airbender theme.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased font-sans`}>
        {children}
      </body>
    </html>
  );
}
