const mongoose = require('mongoose')
const blogsRouter = require('./controllers/blogs')
require('dotenv').config()
const logger = require('./utils/logger')
const config = require('./utils/config')
const express = require('express')
const app = express()
const middleware = require('./utils/middleware')
const morgan = require("morgan");
const cors = require("cors");

morgan.token("body", (req) => {
    return JSON.stringify(req.body);
});

mongoose.set('strictQuery', false)

mongoose.connect(config.MONGODB_URI)
.then(() => {
    logger.info('Connected to MONGODB')
})
.catch((error) => {
    logger.error('error connecting to mongodb:', error.message)
})

app.use(express.json())
app.use(cors())
app.use(morgan(":method :url - :total-time ms :body "));
app.use('/api/blogs', blogsRouter)
app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

module.exports = app