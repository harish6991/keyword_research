const express = require('express')
const app = express()
const path = require("path");
const fs = require('fs');
const axios = require('axios');
const cheerio = require('cheerio');
const openAI  = require('openai')


const API_KEY = process.env.GOOGLE_SEARCH_API;
const CX_TOKEN = process.env.CX_KEY;

const client = new openAI({
  apiKey: process.env.OPENAI_API_KEY
});

app.use(express.json());
app.use(express.static('public'));


app.get('/', (req, res) => {
  const fs = require('fs');
  const filePath = path.join(__dirname, 'public', 'index.html');

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.statusCode = 500;
      res.end("Error loading index.html");
    } else {
      res.setHeader("Content-Type", "text/html");
      res.end(data);
    }
  });
});



const scrapePage = async (url) => {
  const { data } = await axios.get(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0'
    }
  });

  const $ = cheerio.load(data);

  const title = $('title').text();
  const description = $('meta[name="description"]').attr('content');
  const h1 = $('h1').text();
  const h2s = $('h2').map((i, el) => $(el).text()).get();
  const paragraphs = $('p').map((i, el) => $(el).text()).get().slice(0, 5); // First 5 paragraphs

  return {
    title,
    description,
    h1,
    h2s,
    paragraphs
  };
};



const generateBlogFromTopPages = async (keyword, results) => {

  const combinedContent = results
      .map((result, i) => {
        const { h1, h2s, paragraphs } = result.websiteData;
        return `
          Source ${i + 1} - ${result.title} (${result.link})
          H1: ${h1}
          H2s: ${h2s.join(" | ")}
          Paragraphs: ${paragraphs.join(" ")}
        `;
      })
      .join("\n\n");


  const systemPrompt = `You are an expert SEO content writer. Your task is to write a detailed, engaging, and keyword-optimized blog post that ranks on Google.

        Use the content provided from top-ranking websites to create a post that delivers more value than existing articles.

        Primary keyword: "${keyword}".

      Guidelines:
      - Use proper headings (H1, H2, H3) and logical formatting.
      - Maintain a natural, reader-friendly tone while optimizing for SEO.
      - Avoid copying — rewrite content in your own words and add unique insights where needed.
      - Ensure the blog is helpful enough that a freelance writer can publish it directly.`;


  const userPrompt = `Below is the content scraped from the top 3 Google search results for the keyword: "${keyword}".
                Your task:
                1. Write a comprehensive, SEO-optimized blog post based on this content.
                2. Do not copy directly — rewrite and add unique value.
                3. Include:
                   - An SEO title (max 60 characters)
                   - A meta description (max 160 characters)
                   - A list of relevant keywords
                   - The complete blog post
                4. Return the output as a valid JSON object with the following structure:

                {
                  "seo_title": "...",
                  "meta_description": "...",
                  "keywords": ["...", "..."],
                  "blog_post": "..."
                }

                Top 3 site content:
                ${combinedContent}
                `;



    const completion = await client.chat.completions.create({model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt},
          { role: 'user', content: userPrompt},
        ],
        response_format: { type: "json_object" }
      });



      const blog = completion.choices[0].message.content;

      return blog;

}

app.get('/keyword-trend/:keyword', async(req, res) => {
  const keyword = req.params.keyword;
  const url = `https://www.googleapis.com/customsearch/v1?q=${encodeURIComponent(keyword)}&key=${API_KEY}&cx=${CX_TOKEN}`;
  try{

    const web_response = await axios.get(url, {headers: {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/122 Safari/537.36'}});


    const items = web_response.data.items || [];


    const top3 = await Promise.all(
      items.slice(0, 3).map(async (item) => {
        const websiteData = await scrapePage(item.link);
        return {
          title: item.title,
          snippet: item.snippet,
          link: item.link,
          websiteData
        };
      })
    );


    const blog = await generateBlogFromTopPages(keyword, top3);

    return res.json({ response:blog})
    // return  res.json({ response: blog});
  }
  catch(err){
    console.log(err)
    res.status(500).json({ error: 'Internal Server Error' });
  }
});



app.listen(process.env.PORT,()=>console.log(`The app is running at http://localhost:${process.env.PORT}`))
