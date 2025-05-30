🚀 SEO Blog Generator using Google Search + GPT-4o-mini
This project is a free, AI-powered SEO blog generator that helps you automatically create SEO-optimized blog posts based on the top-ranking Google search results for any keyword.

It uses:

🌐 Google Custom Search API to fetch top-ranking URLs

🔍 Cheerio (Web Scraper) to extract headings and paragraphs from those pages

🤖 OpenAI GPT-4o-mini to generate a detailed, SEO-optimized blog post

🖥️ A lightweight HTML/CSS/JS frontend to input keywords and view results

📸 Preview
<!-- (optional image if you add one) -->

✨ Features
✅ Automatically finds top 3 Google results for a keyword

✅ Scrapes page title, meta description, H1, H2s, and main paragraphs

✅ Sends combined data to GPT-4o-mini to generate:

SEO-optimized blog post

SEO title (max 60 characters)

Meta description (max 160 characters)

Keyword suggestions

✅ Frontend interface to input keyword and view output

🌍 Fully customizable and open source

🧠 How It Works
User enters a keyword (e.g., 2 day trek in India)

Server fetches the top 3 Google search results using the Custom Search JSON API

Each page is scraped using axios + cheerio

Content is passed to GPT-4o-mini using a structured SEO writing prompt

Result is returned as a JSON with:

seo_title

meta_description

keywords

blog_post

Output is shown in the frontend

🛠️ Tech Stack
Backend: Node.js + Express

Scraping: Axios + Cheerio

AI: OpenAI GPT-4o-mini

Search API: Google Custom Search JSON API

Frontend: HTML + CSS + JavaScript (Vanilla)
