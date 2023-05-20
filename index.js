const express = require('express');
const app = express();
const cors = require('cors');
const jwt = require('jsonwebtoken');
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

const verifyUser = (req, res, next) => {
    const authorization = req.headers.authorization;
    if (!authorization) {
        return res.status(401).send({ error: true, message: 'unauthorized access' })
    }
    const token = authorization.split(' ')[1]
    jwt.verify(token, process.env.KITTY_SECRET_TOKEN, (error, decoded) => {
        if (error) {
            return res.status(403).send({ error: true, message: 'unauthorized access' })
        }
        req.decoded = decoded
        next()
    });
}

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        client.connect();

        const toyDatabase = client.db('toyDB').collection('toys')
        // const myToyDatabase = client.db('toyDB').collection('myToys')

        // JWT
        app.post('/tokens', (req, res) => {
            const user = req.body;
            console.log(user)
            const token = jwt.sign(user, process.env.KITTY_SECRET_TOKEN, { expiresIn: '10000h' });
            res.send({ token })
        })

        // PRODUCT
        app.get('/products', async (req, res) => {
            const page = parseInt(req.query.currentPage) || 0;
            const limit = parseInt(req.query.productLimit) || 20;
            const skip = page * limit;
            const result = await toyDatabase.find().skip(skip).limit(limit).toArray()
            res.send(result)
        })

        app.get('/allProducts', async (req, res) => {
            const result = await toyDatabase.find().toArray()
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

        app.get('/myToy', verifyUser, async (req, res) => {
            const decoded = req.decoded;
            console.log(decoded.email, req.email)

            if (decoded.email !== req.query.email) {
                return res.status(403).send({ error: 1, message: 'forbidden access' })
            }

            let query = []
            if (req.query?.email) {
                query = { email: req.query.email }
            }
            const result = await toyDatabase.find(query).sort({ price: 1 }).toArray();
            res.send(result)
        })

        app.post('/products', async (req, res) => {
            const toy = req.body;
            console.log('new user', toy)
            const result = await toyDatabase.insertOne(toy)
            res.send(result)
        })

        app.put('/products/:id', async (req, res) => {
            const id = req.params.id;
            const toy = req.body;
            const filter = { _id: new ObjectId(id) };
            const options = { upsert: true };
            const toyUpdate = {
                $set: {
                    price: toy.price,
                    details: toy.details,
                    quantity: toy.quantity
                },
            };

            const result = await toyDatabase.updateOne(filter, toyUpdate, options)
            res.send(result)
        })

        app.delete('/allProducts/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await toyDatabase.deleteOne(query)
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