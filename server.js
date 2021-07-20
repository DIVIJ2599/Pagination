const express = require('express')
const app = express()
const mongoose = require('mongoose')
const User = require('./users')

//Mongoose connection
mongoose.connect('mongodb://localhost/pagination', { useNewUrlParser: true, useUnifiedTopology: true })
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

//get route to view all users
app.get('/users', paginatedResults(User), (req, res) => {
  res.json(res.paginatedResults)
})

//Pagination middleware
function paginatedResults(model) {
  return async (req, res, next) => {
    const page = parseInt(req.query.page)
    const limit = parseInt(req.query.limit)

    const startIndex = (page - 1) * limit
    const endIndex = page * limit

    const results = {}

    //Checks if there are more pages or not
    if (endIndex < await model.countDocuments().exec()) {
      results.next = {
        page: page + 1,
        limit: limit
      }
    }

    //Checks if we are on the first page  
    if (startIndex > 0) {
      results.previous = {
        page: page - 1,
        limit: limit
      }
    }
    try {
      results.results = await model.find().limit(limit).skip(startIndex).exec()
      res.paginatedResults = results
      next()
    } catch (e) {
      res.status(500).json({ message: e.message })
    }
  }
}


app.listen(3000,(req,res)=>{
    console.log("Listening on Port 3000")
})