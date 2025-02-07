const express = require('express');
const connectDB = require('./config/db');
require('dotenv').config()
const app = express();

//connect Database
connectDB();

//initlise middleware
app.use(express.json({ extended: false }));

app.get('/',(req,res) => res.send('API Running'));

//define routes
app.use('/api/user', require('./routes/api/users'));
app.use('/api/posts', require('./routes/api/posts'));
app.use('/api/auth', require('./routes/api/auth'));
app.use('/api/profile', require('./routes/api/profile'));

const port = process.env.PORT || 5000;
const cors = require('cors');
// Define the CORS options
const corsOptions = {
    credentials: true,
    origin: 'http://localhost:3000'
};
// Whitelist the domains you want to allow
app.use(cors(corsOptions)); // Use the cors middleware with your options

// Your route handlers and other middleware go here

app.listen(port, () => console.log(`Server running on port:${process.env.PORT} -${port}`));

