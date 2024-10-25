const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// mongoose.connect("mongodb://localhost:27017/warroom").then((res)=>{
mongoose.connect("mongodb+srv://warroom:warroom@cluster0.tyntx.mongodb.net/voterdata").then((res)=>{
    console.log("connect sucessfully")
}).catch((erro)=>{
    console.log("error",erro.message)
})
const userSchema = new mongoose.Schema({
    FullName: String,
    Age: Number,
    Sex: String,
    CardNo: String,
    Boot: String,
    MobileNumber: String,
});

const User = mongoose.model('User', userSchema);

// Get all users
app.get('/api/users', async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


app.put('/api/users/:id/add-mobile', async (req, res) => {
    const { MobileNumber } = req.body;
    try {
        const user = await User.findByIdAndUpdate(req.params.id, { MobileNumber }, { new: true });
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Error updating mobile number' });
    }
});



// Add a mobile number
// app.post('/api/users/:id/mobile', async (req, res) => {
//     const { id } = req.params;
//     const { mobileNumber } = req.body;
//     await User.findByIdAndUpdate(id, { MobileNumber: mobileNumber });
//     res.sendStatus(204);
// });

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});







// data seed
// const mongoose = require('mongoose');
// const User = require('./model/Users.js');
// const data = require('./all.json'); // Ensure this file has srno field

// require('dotenv').config();

// mongoose.connect("mongodb+srv://warroom:warroom@cluster0.tyntx.mongodb.net/voterdata")
//     .then(async () => {
//         // Assuming your data has the srno field
//         await User.insertMany(data.users); // Ensure the JSON structure matches your User model
//         console.log('Data seeded!');
//         mongoose.disconnect();
//     })
//     .catch(err => console.log(err));
