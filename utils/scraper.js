const puppeteer = require("puppeteer");
const { callGeminiAPI } = require("./geminiService");
const { timeout } = require("puppeteer");
const customError = require("./customError");
const { join } = require('path');

const scraper = async (url, limit) => {
    const browser = await puppeteer.launch({ headless: true });
    try {

        const page = await browser.newPage();
        try {
            await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 0 });

        } catch (err) {
            console.log("page.goto navigation timeout !");
        }


        // Fetching and Cleaning the HTML
        const cleanedHTML = await page.evaluate(() => {

            const unwantedTags = [
                'script', 'meta', 'footer', 'iframe', 'style', 'link', 'src', 'img', 'title',
                'option', 'input', 'label', 'header', 'noscript', 'nav', 'video', 'svg',
                'form', 'button', 'aside', 'footer', 'article', 'strong', 'product-modal',
                'modal-opener', 'product-form', 'picture'
            ];

            unwantedTags.forEach(tag => {
                const elements = Array.from(document.querySelectorAll(tag));

                elements.forEach(el => {
                    try {
                        el.remove(); // Attempt to remove the element
                    } catch (error) {
                        console.warn(`Could not remove element for tag ${tag}: `, error); // Catch errors
                    }
                });
            })

            const bodyHTML = document.body.innerHTML.replace(/\s+/g, ' ');
            const cleanedHTML = bodyHTML.replace(/<!--.*?-->/g, '').replace(/\\u[\dA-Fa-f]{4}/g, '');
            return cleanedHTML;
        });

        // Chunking the cleaned HTML
        const chunkSize = 700000;
        let chunks = [];

        for (let i = 0; i < cleanedHTML.length; i += chunkSize) {
            chunks.push(cleanedHTML.slice(i, i + chunkSize));

        }

        // Iterate over chunks and send them to Gemini API
        // reverse iteration because the chunks from the bottom of the page will be more relevant for us
        // can also optimize this further as for most of the sites we only need the last html block 
        for (let i = chunks.length - 1; i >= 0; i--) {
            // calling the LLM for dyanamic css selectors
            var geminiResponse = await callGeminiAPI(chunks[i]);
        }
        console.log(geminiResponse)

        // now iterate over container and populate the return obj
        const reviews = await fetchAndPopulateDataForEachPage(page, geminiResponse, limit)

        return reviews;
    }
    catch (error) {
        throw error;
    }
    finally {

        await Promise.race([browser.disconnect(), browser.close(), browser.close(), browser.close(), browser.close(), browser.close(), browser.close(), browser.close()])
    }

};


const fetchAndPopulateDataForEachPage = async (page, response, limit) => {
    try {
        if (!response) throw new customError("Gemini Limit reached please try after some time!", 500)

        const containerSelector = response.reviewContainer;
        const titleSelector = response.reviewTitle;
        const bodySelector = response.reviewBody;
        const ratingSelector = response.reviewRating;
        const nameSelector = response.reviewerName;
        const currentPageSelector = response.selectedPageNavigator;
        const seeAllReviewsSelector = response.seeAllReviews;

        //if there's a button that only after clicking that we will get paginated view of our reviews then click it first
        if (seeAllReviewsSelector) {
            await page.evaluate((seeAllReviewsSelector) => {
                document.querySelector(seeAllReviewsSelector)?.click();
            }, seeAllReviewsSelector)
        }

        //global list
        var list = [];
        let currPageNumber = 1;

        //iterable breaker , LOOP till pagination gets disabled
        let isDisabled = false;

        while (!isDisabled) {

            // get the container and fetch every review in a paginated fashion
            try {
                var reviewList = await page.$$(containerSelector);

            }
            catch (err) {
                console.log("review list didnt found!")
                return list;
            }


            for (const review of reviewList) {

                const title = await page.evaluate((review, titleSelector) => { if (!titleSelector) return; return review.querySelector(titleSelector)?.innerText }, review, titleSelector)
                const body = await page.evaluate((review, bodySelector) => { if (!bodySelector) return; return review.querySelector(bodySelector)?.innerText }, review, bodySelector)
                const rating = await page.evaluate((review, ratingSelector) => { if (!ratingSelector) return; return review.querySelector(ratingSelector)?.innerText }, review, ratingSelector)
                const name = await page.evaluate((review, nameSelector) => { if (!nameSelector) return; return review.querySelector(nameSelector)?.innerText }, review, nameSelector)

                list.push({ title: title, body: body, rating: rating, name: name })
            }

            const hasNext = await page.evaluate((selector) => {
                if (!selector) return false;
                const currentPageElement = document.querySelector(selector);

                if (!currentPageElement) return false; // If current page element not found

                const nextPageElement = currentPageElement.nextElementSibling;

                if (!nextPageElement) return false; // If no next sibling

                // Check if it's clickable (e.g., a link or button)

                nextPageElement?.click()
                return true;

            }, currentPageSelector);

            if (hasNext) {
                isDisabled = false;

                try {
                    await page.waitForNavigation({ waitUntil: ['domcontentloaded', 'networkidle2'], timeout: 1500 })
                } catch (err) {
                    console.log("naviagtion timedout!")
                }

            } else {
                isDisabled = true;
            }

            if (limit && limit >= -1 && list.length >= limit) break;
            console.log("page: ", currPageNumber++, "\n")

        }

        return list;
    }
    catch (error) {
        console.log('ERROR: ', error);
        return list;
    }
}


module.exports = scraper


