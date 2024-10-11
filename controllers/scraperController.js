const tryCatch = require("../utils/tryCatch");
const scraper = require("../utils/scraper");
const customError = require("../utils/customError");

const scrapeController = tryCatch(async (req, res, next) => {
    let { page, fetchOnly } = req.query;

    let limit = fetchOnly;
    
    if(limit && !parseInt(limit)) return next(new customError("Please pass a valid limit parameter!"));
    if(!limit) limit = -1;

    // stream SSE response

      res.writeHead(200, {
        'Content-Type': 'text/event-stream,charset=utf-8',
        'Connection': 'keep-alive',
        'Transfer-Encoding': 'chunked',
         'Cache-Control': 'no-cache'
    });
    
      res.write("Scrapping will be starting soon...\n")

      const reviews = await scraper(page, parseInt(limit), res)
      res.write(`\nTotal Reviews Fetched : ${reviews?.length}`)

    res.end();
    
    //JSON response
    // return res.status(200).json({ reviews_count: reviews?.length, reviews })

})
module.exports = { scrapeController }