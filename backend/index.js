const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const cluster = require('cluster');
const os = require('os');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const numCPUs = os.cpus().length; // Get the number of CPU cores

// Connect to MongoDB Cluster
mongoose.connect("mongodb+srv://warroom:warroom@cluster0.tyntx.mongodb.net/voterdata").then(() => {
    console.log("Connected successfully");
}).catch((error) => {
    console.error("Connection error:", error.message);
});

// User Schema with Indexes
const userSchema = new mongoose.Schema({
    srno: { type: Number, required: true },
    FullName: { type: String, required: true, index: true },
    Age: { type: Number, required: true, min: 0 },
    Sex: { type: String, required: true },
    CardNo: { type: String, required: true, index: true },
    Boot: { type: String, required: true },
    MobileNumber: { type: String }
});

// User Model
const User = mongoose.model('User', userSchema);

// Middleware for handling errors
const errorHandler = (err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: err.message });
};

// Define API routes
// app.get('/api/users', async (req, res) => {
//     try {
//         const users = await User.find().lean();
//         res.json(users);
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// });

app.get('/', async (req, res) => {
    try {
    
        res.json(
            {
                "message":"welcome to backend"
            }
        );
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


app.get('/api/users/search', async (req, res) => {
    const { name, cardNo } = req.query;
    const query = {};
    if (name) {
        query.FullName = { $regex: name, $options: 'i' };
    }
    if (cardNo) {
        query.CardNo = cardNo;
    }

    try {
        const users = await User.find(query).lean();
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.put('/api/users/:id/add-mobile', async (req, res) => {
    const { MobileNumber } = req.body;
    try {
        const user = await User.findByIdAndUpdate(req.params.id, { MobileNumber }, { new: true, runValidators: true });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Error updating mobile number' });
    }
});

// Error handling middleware
app.use(errorHandler);

// Cluster management
if (cluster.isMaster) {
    console.log(`Master ${process.pid} is running`);

    // Fork workers for each CPU core
    for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
    }

    cluster.on('exit', (worker, code, signal) => {
        console.log(`Worker ${worker.process.pid} died`);
    });
} else {
    // Workers can share the same server port
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`Worker ${process.pid} started on port ${PORT}`);
    });
}

// Data seeding (commented out as per your requirement)
// const mongoose = require('mongoose');
// const User = require('./model/Users.js');
// const data = require('./all.json'); // Ensure this file has srno field
// require('dotenv').config();
// mongoose.connect("mongodb+srv://warroom:warroom@cluster0.tyntx.mongodb.net/voterdata")
//     .then(async () => {
//         await User.insertMany(data.users); // Ensure the JSON structure matches your User model
//         console.log('Data seeded!');
//         mongoose.disconnect();
//     })
//     .catch(err => console.log(err));
