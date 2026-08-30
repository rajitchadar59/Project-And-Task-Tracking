const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(express.json());
app.use(cors()); 


mongoose.connect(process.env.MONGO_URI)
    .then(() =>{
      console.log("MongoDB Connected Successfully");  
    })
    .catch((err) => {
        console.error("MongoDB Connection Error:", err.message);
        process.exit(1); 
    });


app.get('/', (req, res) => {
    res.send(" Backend API is running...");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});