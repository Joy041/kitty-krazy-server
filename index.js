const express = require('express');
const app = express();
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const port = process.env.PORT || 5000;


// MIDDLEWARE
app.use(cors())
app.use(express.json())


const uri = `mongodb+srv://${process.env.MD_USERNAME}:${process.env.MD_PASSWORD}@cluster0.4plofch.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        client.connect();

        const toyDatabase = client.db('toyDB').collection('toys')


        app.get('/products', async (req, res) => {
            const page = parseInt(req.query.currentPage) || 0;
            const limit = parseInt(req.query.productLimit) || 10;
            const skip = page * limit;
            const result = await toyDatabase.find().skip(skip).limit(limit).toArray()
            res.send(result)
        })

        app.get('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await toyDatabase.findOne(query)
            res.send(result)
        })

        app.get('/totalProductNumber', async (req, res) => {
            const result = await toyDatabase.estimatedDocumentCount();
            res.send({ totalProductNumber: result })
        })

        app.post('/toys', async (req, res) => {
            const toy = req.body;
            console.log('new user', toy)
            const result = await toyDatabase.insertOne(toy)
            res.send(result)
        })

        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Kitty krazy server is running....')
})

app.listen(port, () => {
    console.log(`Kitty krazy server is running on port: ${port}`)
})