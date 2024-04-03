const express = require('express');
const app = express();
const cors = require('cors');
// const Web3 = require('web3');
// const contract = require('@truffle/contract');
// const artifacts = require('./build/contracts/Contacts.json');
// const CONTACT_ABI = require('./config');
// const CONTACT_ADDRESS = require('./config');
const users = require("./routes/userRoutes");
const accounts = require("./routes/accountRoutes");
const requests = require("./routes/requestRoutes");

const db = require("./models/index.js");

app.use(cors());
app.use(express.json());

app.use("/users", users);
app.use("/accounts", accounts);
app.use("/requests", requests);

module.exports = app;