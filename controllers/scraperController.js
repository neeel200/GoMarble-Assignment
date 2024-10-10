const tryCatch = require("../utils/tryCatch");
const scraper = require("../utils/scraper")

const scrapeController = tryCatch(async(req, res, next) =>{
    const {page} = req.query;

    const reviews = await scraper(page);
    return res.status(200).json({ reviews_count: reviews?.length, reviews})

})
module.exports = {scrapeController}