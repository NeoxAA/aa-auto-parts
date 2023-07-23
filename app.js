const dotenv = require("dotenv");
dotenv.config();
const createError = require('http-errors');
const express = require('express');
const cookieParser = require('cookie-parser');
const path = require('path');
const logger = require('morgan');

const app = express();

const mongoose = require("mongoose");
mongoose.set("strictQuery", false);
const mongoDB = process.env.MONGO_DB_CONNECTION;

main().catch((err) => console.log(err));
async function main() {
    await mongoose.connect(mongoDB);
}

const indexRouter = require('./routes/index');

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);

module.exports = app;