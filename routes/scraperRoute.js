const scrapeRouter = require("express").Router()
const {scrapeController} = require("../controllers/scraperController")

scrapeRouter.get("/reviews", scrapeController)

module.exports = scrapeRouter