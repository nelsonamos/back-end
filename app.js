const { MongoClient } = require('mongodb');
const express = require('express');
const cors = require('cors');
const path = require('path');

const logger = require('./logger');

const app = express();
app.set('trust proxy', true);
app.use(logger);
app.use(cors());
app.use(express.json()); // Middleware to parse JSON bodies
app.use('/middleware_pix/lesson', express.static(path.join(__dirname, '/middleware_pix/lesson')));
app.use('/images', (req, res) => {
    res.status(404).send('Image not found');
});

const uri = 'mongodb+srv://user:user@cluster0.cyzu5.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

// Connect to MongoDB when the server starts
client.connect().then(() => {
    console.log('Connected to MongoDB');
}).catch(error => {
    console.error('MongoDB connection error:', error);
});

// Existing route for fetching courses
app.get('/api/courses', async (req, res) => {
    try {
        const database = client.db('vues');
        const collection = database.collection('courses');

        const courses = await collection.find({}).toArray();

        if (courses.length > 0) {
            res.json(courses);
        } else {
            res.status(404).send('No courses found');
        }
    } catch (error) {
        console.error('Error fetching courses:', error);
        res.status(500).send('Error retrieving courses');
    }
});

// New route for searching courses
app.get("/api/search", async (req, res) => {
    const searchQuery = req.query.query;

    if (!searchQuery) {
        return res.status(400).json({ error: "Search query is required" });
    }

    try {
        const database = client.db("vues");
        const collection = database.collection("courses");

        // Full-text search on multiple fields
        const results = await collection
            .find({
                $or: [
                    { location: { $regex: searchQuery, $options: "i" } },
                    { category: { $regex: searchQuery, $options: "i" } },
                    { subject: { $regex: searchQuery, $options: "i" } },
                ],
            })
            .toArray();

        res.json(results);
    } catch (error) {
        console.error("Error performing search:", error);
        res.status(500).send("Error performing search");
    }
});

// New route for placing orders
app.post('/api/orders', async (req, res) => {
    try {
        const database = client.db('vues');
        const collection = database.collection('orders'); // Create or use your orders collection

        const order = req.body; // Get order data from request body

        // Insert the new order into the database
        const result = await collection.insertOne(order);

        // Respond with success and the inserted order ID
        res.status(201).json({ orderId: result.insertedId });
    } catch (error) {
        console.error('Error placing order:', error);
        res.status(500).send('Error placing order');
    }
});

// Start the server
app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
