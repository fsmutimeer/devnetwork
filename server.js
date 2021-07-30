const express = require('express');

const app = express();

const PORT = process.env.PORT || 5000;
const HOST = 'localhost';

app.get('/', (req, res)=>res.send('Api running'))

app.listen(PORT, ()=> console.log(`Server is running on http://${HOST}:${PORT}`))