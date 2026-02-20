const express = require('express');
const app = express();
const fs = require('fs');
const { Sequelize, DataTypes } = require('sequelize');

app.use(express.json());
app.use(express.urlencoded());

// DB
class DB {
    constructor() {
        if(this.constructor === DB) {
            
        }
    }
}


// Middleware


app.listen(9000, () => console.log("Server is running on port 9000"))