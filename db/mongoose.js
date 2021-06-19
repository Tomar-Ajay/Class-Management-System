const mongoose = require('mongoose')

const connection_url = "mongodb+srv://frosh:dInJ1EskBg0Ff2Oz@cluster0.jopij.mongodb.net/froshdb?retryWrites=true&w=majority"

mongoose.connect( connection_url, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
})