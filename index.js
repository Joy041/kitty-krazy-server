const express = require('express');
const app = express();
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
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
    await client.connect();

    const toyDatabase = client.db('toyDB').collection('toys') 

    app.post('/toys', async(req, res) => {
        const server = req.body;
        console.log('new user', server)
        const result = await toyDatabase.insertOne(server)
        res.send(result)  
    })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Kitty krazy server is running....')
})

app.listen(port, () => {
    console.log(`Kitty krazy server is running on port: ${port}`)
})