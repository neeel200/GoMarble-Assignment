const tryCatch = require("../utils/tryCatch");
const scraper = require("../utils/scraper");
const customError = require("../utils/customError");

const scrapeController = tryCatch(async (req, res, next) => {
    let { page, limit } = req.query;
    
    if(limit && !parseInt(limit)) return next(new customError("Please pass a valid limit parameter!"));
    if(!limit) limit = -1;

    const reviews = await scraper(page, parseInt(limit));

    return res.status(200).json({ reviews_count: reviews?.length, reviews })

})
module.exports = { scrapeController }