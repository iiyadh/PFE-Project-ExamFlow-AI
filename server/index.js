const express = require('express');
const cors = require('cors');
const connectDB = require('./libs/db');
const cookieParser = require('cookie-parser');
app = express();
require('dotenv').config();


app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: "http://localhost:5173",
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', "X-Requested-With"],
    credentials: true,
}));
connectDB();

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/password', require('./routes/passwordRoutes'));
app.use('/api/user', require('./routes/userRoutes'));
app.use('/api/class', require('./routes/classRoutes'));
app.use('/api/file', require('./routes/fileRoutes'));
app.use('/api/student', require('./routes/studentRoutes'));



app.listen(process.env.PORT, () => {
    console.log('Server is running on port 5000');
});