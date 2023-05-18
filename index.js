const express = require('express');
const app = express();
const cors = require('cors');
const port = process.env.PORT || 5000;


// MIDDLEWARE
app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
    res.send('Kitty krazy server is running....')
})

app.listen(port, () => {
    console.log(`Kitty krazy server is running on port: ${port}`)
})