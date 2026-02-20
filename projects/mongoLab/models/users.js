// models/User.js
const mongoose = require("mongoose");
const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            minlength: 3,
        },
        age: {
            type: Number,
            required: true,
            min: 18,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            validator: {
                validate: {
                    validator: function (v) {
                        return v.includes("@");
                    },
                    message:  "Invalid email format",
                }
            }
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        //role column added
        role: {
            type: String,
            enum: ["user", "admin"],
            required: true,
            default: "user",
        }

    },
    { timestamps: true },
);
module.exports = mongoose.model("User", userSchema);
