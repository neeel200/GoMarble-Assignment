const tryCatch = require("../utils/tryCatch");
const scraper = require("../utils/scraper");
const customError = require("../utils/customError");

const scrapeController = tryCatch(async (req, res, next) => {
  let { page, fetchOnly } = req.query;

  let limit = fetchOnly;

  if (limit && !parseInt(limit)) return next(new customError("Please pass a valid fetchOnly parameter!"));
  if (!limit) limit = -1;

  // stream SSE response

  res.writeHead(200, {
    'Content-Type': 'text/event-stream,charset=utf-8',
    'Connection': 'keep-alive',
    'Transfer-Encoding': 'chunked',
    'Cache-Control': 'no-cache'
  });

  res.write("data: Scrapping will be starting soon...\n\n")

  const reviews = await scraper(page, parseInt(limit), res)
  
  if (res.writable) {
    res.write(`data: Total Reviews Fetched : ${reviews?.length}\n\n`)
    res.end();
  } else {
    console.log('Response is no longer writable.');
  }

  req.on('close', () => {
    console.log('Client disconnected, stopping stream.');
    res.end();

  });

  //JSON response
  // return res.status(200).json({ reviews_count: reviews?.length, reviews })

})
module.exports = { scrapeController }