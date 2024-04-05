require('dotenv').config();

require("dotenv").config();

module.exports = {
    development: {
        username: process.env.DEV_DB_USERNAME,
        password: process.env.DEV_DB_PASSWORD,
        database: process.env.DEV_DB_NAME,
        host: "127.0.0.1",
        dialect: "mysql"
    },
    test: {
        username: process.env.TEST_DB_USERNAM,
        password: process.env.TEST_DB_PASSWORD,
        database: "usdc_op_test",
        host: "127.0.0.1",
        dialect: "mysql"
    },
    production: {
        username: process.env.PROD_DB_USERNAME,
        password: process.env.PROD_DB_PASSWOR,
        database: process.env.PROD_DB_NAME,
        host: process.env.PROD_DB_HOST,
        dialect: "mysql"
    }
};