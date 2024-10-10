const express = require("express")
const errorController = require("./utils/errorController")
const customError = require("./utils/customError")
const scrapeRouter = require("./routes/scraperRoute")
const port = 8080;
const app =  express();

// main router
app.use('/api', scrapeRouter);


app.get("/", (req, res) => {
    res.send("API is running...");
  });

// handling all the non-existent apis  
app.all("*", (req, res, next) => {
    next(new customError(`cant find the ${req.originalUrl}`, 404));
  });

// Handling and reverting errors ,if any, to the client 
app.use(errorController);

app.listen(port, ()=>console.log(`Server started on ${port}`))

