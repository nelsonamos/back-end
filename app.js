const { MongoClient } = require('mongodb');
const express = require('express');
const app = express();
const cors = require('cors');

app.use(cors());
app.use(express.json()); // Middleware to parse JSON bodies

const uri = 'mongodb+srv://user:user@cluster0.cyzu5.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

// Existing route for fetching courses
app.get('/api/courses', async (req, res) => {
    try {
        await client.connect();
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
    } finally {
        await client.close();
    }
});

// New route for placing orders
app.post('/api/orders', async (req, res) => {
    try {
        await client.connect();
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
    } finally {
        await client.close();
    }
});

app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
