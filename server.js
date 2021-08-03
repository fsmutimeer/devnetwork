const express = require('express');
const connectDB = require('./config/db');



//importing routes 
const userRouter = require('./routes/api/userRouter');
const authRouter = require('./routes/api/authRouter');
const postsRouter = require('./routes/api/postsRouter');
const profileRouter = require('./routes/api/profileRouter');

// initialize the app

const app = express();

// Database
connectDB();

//Middleware
app.use(express.json({extended:false}));


// Routes
app.use('/api/users', userRouter);
app.use('/api/auth', authRouter);
app.use('/api/posts', postsRouter);
app.use('/api/profile', profileRouter);

const PORT = process.env.PORT || 5000;
const HOST = 'localhost';

app.get('/', (req, res)=>res.send('Api running'))

app.listen(PORT, ()=> console.log(`Server is running on http://${HOST}:${PORT}`))