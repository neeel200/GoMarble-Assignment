# AI-Powered Product Review Scraper
This project dynamically scrapes product reviews from any e-commerce site and streams the data back to the client in real-time using Server-Sent Events (SSE). The scraper is powered by Node.js, Puppeteer, and the Gemini-1.5-flash model for intelligent review extraction.

Api doc with output and workflow details:- 
https://docs.google.com/document/d/1rtlevXlGMzscG8surXUvfidWkXGrxOqGcB9tAcriMrY/edit?usp=sharing

Features: 
- Dynamic Review Scraping: Extracts reviews from any product page, adapting to various site structures.
- Real-Time Streaming: Streams reviews back to the client page-by-page as they are scraped.
- AI Integration: Leverages the Gemini 1.5-flash model for dynamic CSS identification and review extraction.
  
Tech Stack:
- Backend: Node.js, Puppeteer
- AI Model: Gemini-1.5-flash
  
Install and RUN:<br>
`npm install && npx puppeteer browsers install chrome && npm run dev`


