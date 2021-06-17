const express = require('express')
require('./db/mongoose')
const teacherRouter = require('./routers/teacher')
const courseRouter = require('./routers/course')
const studentRouter = require('./routers/student')

const app = express()

app.use(express.json())
app.use(teacherRouter)
app.use(courseRouter)
app.use(studentRouter)

module.exports = app