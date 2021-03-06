const jwt = require('jsonwebtoken')
const Student = require('../models/student')

const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '')
        const decoded = jwt.verify(token, "abcd1234")
        const student = await Student.findOne({ _id: decoded._id, 'tokens.token': token })

        if (!student) {
            throw new Error()
        }

        req.token = token
        req.student = student
        next()
    } catch (e) {
        res.status(401).send({ error: 'Please authenticate.' })
    }
}

module.exports = auth