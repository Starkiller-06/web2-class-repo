const express = require("express");
const mongoose = require("mongoose");
const User = require("./models/users");
require("dotenv").config();

const app = express();
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("Database connected"))
    .catch(err => console.log(err));

// Create User
app.post("/users", async (req, res) => {
    try {
        const user = await User.create(req.body);
        res.status(201).json(user);
    } 
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get All Users
app.get("/users", async (req, res) => {
    const users = await User.find();
    res.json(users);
});

// Update User
app.put("/users/:id", async (req, res) => {
    try {
        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true },
        );
        res.json(updatedUser);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Delete User
app.delete("/users/:id", async (req, res) => {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted" });
});


// 2. Create GET /users/active route.
app.get("/users/active", async (req, res) => {
    const activeUsers = await User.find({ isActive: true });
    res.json(activeUsers);
});

app.put("/users/deactivate/:id", async (req, res) => {
    try {
        const deactivatedUser = await User.findByIdAndUpdate(
            req.params.id,
            { isActive: false },
            { new: true, runValidators: true },
        )
        return res.status(200).json(deactivatedUser);
    }
    catch {
        res.status(400).json({ error: error.message });
    }
})

app.listen(3000, () => console.log("Server running on port 3000"));

