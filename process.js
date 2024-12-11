const express = require('express');
const { MongoClient } = require('mongodb');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000; // Use Heroku's dynamic port

// MongoDB URL
const url = "mongodb+srv://dbUser:Password@cluster0.w0aza.mongodb.net/";

// Start the server and handle database logic
async function main() {
    try {
        // Connect to the MongoDB client
        const client = await MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });
        const db = client.db("Stock");
        const collection = db.collection("PublicCompanies");

        // Serve the HTML form (index page)
        app.use(express.static('index.html'));  // Serve static files from 'public' folder

        // Middleware to parse form data
        app.use(express.urlencoded({ extended: true }));

        app.get('/', (req, res) => {
            res.sendFile(path.join(_dirname, 'stockApp.html'));
        });

        // Route for form submission
        app.get('/process.html', async (req, res) => {
            try {
                const userInput = req.query.userInput;
                const searchType = req.query.companyInput;

                let query = {};
                if (searchType === "Stock Ticker Symbol") {
                    query = { Ticker: userInput };
                } else if (searchType === "Company Name") {
                    query = { Company: userInput };
                }

                // Query MongoDB for matching records
                const results = await collection.find(query).toArray();

                // Log the results to the console
                console.log("Search Results:", results);

                // Send results to the client (extra credit: display in HTML)
                res.send(`
                    <h1>Search Results</h1>
                    <ul>
                        ${results.map(r => `<li>${r.Company} (${r.Ticker}): $${r.Price}</li>`).join('')}
                    </ul>
                `);
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
