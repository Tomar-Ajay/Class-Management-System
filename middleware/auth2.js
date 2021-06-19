const jwt = require('jsonwebtoken')
const Teacher = require('../models/teacher')

const auth2 = async (req, res, next) => {
    try {
        const token = req.header('Authorization')
        const decoded = jwt.verify(token, "abcd1234")
        const teacher = await Teacher.findOne({ _id: decoded._id, 'tokens.token': token })

        if (!teacher) {
            throw new Error()
        }

        req.token = token
        req.teacher = teacher
        next()
    } catch (e) {
        console.log(e)
        res.status(401).send({ error: 'Please authenticate.' })
    }
}

module.exports = auth2