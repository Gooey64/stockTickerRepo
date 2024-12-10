const express = require('express');
const { MongoClient } = require('mongodb');

const app = express();
const port = 3000;

//my mongodb url
const url = "mongodb+srv://dbUser:Password@cluster0.w0aza.mongodb.net/";

async function main() {
    try {

        //connects to database
        const client = await MongoClient.connect(url);
        
        const db = client.db("Stock");
        const collection = db.collection("PublicCompanies");

        app.use(express.static('process.html'));

        app.use(express.urlencoded({ extended: true}));

        app.get('/process.html', async(req, res) => {
            try {
                const userInput = req.query.userInput;
                const searchType = req.query.companyInput;

                let query = {}
                if (searchType == "Stock Ticker Symbol") {
                    query = { Ticker: userInput };
                }
                else if (searchType == "Company Name") {
                    query = { Company: userInput };
                }

                const results = await collection.find(query).toArray();

                console.log("Search Results: ", results);

                res.send(
                    '<h1>Search Results</h1>'
                )

            }
            catch (err) {
                console.error("Error: ", err);
                res.status(500).send("Error");
            }
        });
        
        //closes database connection
        await client.close();
        }
    catch (err) {
        console.error("An error occurred:", err);
    }
    
}

//function that reads the CSV file
function readCSV(fileName) {
    
}

main();



