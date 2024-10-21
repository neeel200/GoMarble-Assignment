# AI-Powered Product Review Scraper
This project dynamically scrapes product reviews from any e-commerce site and streams the data back to the client in real-time using Server-Sent-Events (SSE). The scraper is powered by Node.js, Puppeteer, and the Gemini-1.5-flash model for intelligent review extraction.


Features: 
- Dynamic Review Scraping: Extracts reviews from any product page, adapting to various site structures.
- Real-Time Streaming: Streams reviews back to the client page-by-page as they are scraped.
- AI Integration: Leverages the Gemini 1.5-flash model for dynamic CSS identification and review extraction.
  
Tech Stack:
- Backend: Node.js(with SSE), Puppeteer
- AI Model: Gemini-1.5-flash
  
Install and RUN:<br>
`npm install && npx puppeteer browsers install chrome && npm run dev`


**API Details:**<br>
Endpoint (GET) https://reviewminer-ai.onrender.com/api/reviews?page={url}&fetchOnly=10

- Description:- This api is used to get all reviews for the given product’s page. This api scrapes all reviews from the given page with the help of LLM (gemini) and returns the list of reviews back in the response.

- Query_Params:-

 `page` (Required) : This is the product’s page url.

  `fetchOnly` (Optional) :This parameter states the number of reviews we want from the given product `page` url i.e if provided will fetch the first “n” reviews from the page.IF NOT provided then fetches all reviews.


WorkFlow diagram:-
https://app.eraser.io/workspace/yNRP8IRFrbY2IP5nKQoB?origin=share

Demo Ouput link :- https://drive.google.com/file/d/1OdlrUyjl0WiGewzCaXNfZ6XlnKC1YiNr/view?usp=sharing

