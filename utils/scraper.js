const puppeteer = require("puppeteer");
const { callGeminiAPI } = require("./geminiService");
const { timeout } = require("puppeteer");
const customError = require("./customError");
const { join } = require('path');

const scraper = async (url) => {
    const browser = await puppeteer.launch({ headless: true });
    try {

        const page = await browser.newPage();

        await page.goto(url, { waitUntil: ['domcontentloaded', 'networkidle2'] });

        // Fetching and Cleaning the HTML
        const cleanedHTML = await page.evaluate(() => {

            const unwantedTags = [
                'script', 'meta', 'footer', 'iframe', 'style', 'link',
                'src', 'img', 'title', 'option', 'input', 'label',
                'header', 'noscript', 'nav', 'video', 'svg', 'form',
                'button', 'aside', 'footer', 'article', 'strong', 'product-modal', 'modal-opener', 'product-form', 'picture'
            ];
            unwantedTags.forEach(tag => {
                document?.querySelectorAll(tag)?.forEach(el => el.remove());
            });

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
        const reviews = await fetchAndPopulateDataForEachPage(page, geminiResponse)

        return reviews;
    }
    catch (error) {
        throw error;
    }
    finally {

        await Promise.race([browser.disconnect(), browser.close(), browser.close(), browser.close(), browser.close(), browser.close(), browser.close(), browser.close()])
    }

};


const fetchAndPopulateDataForEachPage = async (page, response) => {
    try {
        if(!response) throw new customError("Gemini Limit reached please try after some time!", 500)

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
        const list = [];

        //iterable breaker , LOOP till pagination gets disabled
        let isDisabled = false;

        while (!isDisabled) {

            // await page.waitForNavigation({ waitUntil: ['domcontentloaded'] })

            // get the container and fetch every review in a paginated fashion

            const reviewList = await page.$$(containerSelector);

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
                // await page.waitForNavigation({ waitUntil: ['domcontentloaded'] })

            } else {
                isDisabled = true;
            }

            if(list.length >= 20) break;

        }

        return list;
    }
    catch (error) {
        throw error;
    }
}


module.exports = scraper


