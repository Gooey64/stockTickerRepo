const express = require('express');
const { MongoClient } = require('mongodb');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000; // Use Heroku's dynamic port or default to 3000

// MongoDB URL
const url = "mongodb+srv://dbUser:Password@cluster0.w0aza.mongodb.net/";

// Start the server and handle database logic
async function main() {
    try {
        // Connect to the MongoDB client
        const client = await MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });
        const db = client.db("Stock");
        const collection = db.collection("PublicCompanies");

        // Middleware to parse form data
        app.use(express.urlencoded({ extended: true }));

        // Serve the HTML form (index page)
        app.get('/', (req, res) => {
            res.sendFile(path.join(__dirname, 'stockApp.html'));
        });

        // Route for form submission
        app.get('/process.html', async (req, res) => {
            try {
                const userInput = req.query.userInput;
                const searchType = req.query.companyInput;

                let query = {};
                if (searchType === "Stock Ticker Symbol") {
                    query = {Ticker:{$eq:userInput}};
                } else if (searchType === "Company Name") {
                    query = {Company:{$eq:userInput}};
                }

                // Query MongoDB for matching records
                const results = await collection.find(query).toArray();
                // const results = await collection.find().toArray();
                // console.log(results.length);

                // Log the results to the console
                console.log("Search Results:", results);

                // Send results to the client
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
            } catch (err) {
                console.error("Error:", err);
                res.status(500).send("An error occurred while processing your request.");
            }
        });

        // Start the server
        app.listen(port, () => {
            console.log(`Server running at http://localhost:${port}`);
        });

    } catch (err) {
        console.error("An error occurred:", err);
    }
}

// Run the application
main();
