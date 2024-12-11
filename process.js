const express = require('express');
const { MongoClient } = require('mongodb');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

const url = "mongodb+srv://dbUser:Password@cluster0.w0aza.mongodb.net/";

async function main() {
    try {
        //connect to database
        const client = await MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });
        const db = client.db("Stock");
        const collection = db.collection("PublicCompanies");

        app.use(express.urlencoded({ extended: true }));

        //get the HTML form data
        app.get('/', (req, res) => {
            res.sendFile(path.join(__dirname, 'stockApp.html'));
        });

        //process the html form data
        app.get('/process.html', async (req, res) => {
            try {
                //get user input from the form
                const userInput = req.query.userInput;
                console.log("user input: " + userInput);
                const searchType = req.query.companyInput;
                
                //determine query based on radio button values
                let query = {};
                if (searchType === "Stock Ticker Symbol") {
                    query = {Ticker: userInput};
                } else if (searchType === "Company Name") {
                    query = {Company:userInput};
                }

                //query mongodb for matching results
                const results = await collection.find(query).toArray();

                console.log("Search Results:", results);

                //send results to process.html
                if (results.length > 0) {
                    res.send(`
                        <h1>Search Results</h1>
                        <ul>
                            ${results.map(r => `<li>${r.Company} (${r.Ticker}): $${r.Price}</li>`).join('')}
                        </ul>
                    `);
                } else {
                    res.send("<h1>No Results Found</h1>");
                }
                
            }
            //catch errors
            catch (err) {
                console.error("Error:", err);
                res.status(500).send("An error occurred while processing your request.");
            }
        });

        //start server
        app.listen(port, () => {
            console.log(`Server running at http://localhost:${port}`);
        });

    } catch (err) {
        console.error("An error occurred:", err);
    }
}

//run app
main();
