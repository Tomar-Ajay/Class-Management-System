const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Course = require('./course')

const studentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        unique: true,
        required: true,
        trim: true,
        lowercase: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Email is invalid')
            }
        }
    },
    password: {
        type: String,
        required: true,
        minlength: 7,
        trim: true,
        validate(value) {
            if (value.toLowerCase().includes('password')) {
                throw new Error('Password cannot contain "password"')
            }
        }
    },
    batch: {
        type: Number,
        default: 1
    },
    rollNo: {
        type: Number,
        required: true
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }],
    avatar: {
        type: Buffer
    }
}, {
    timestamps: true
})

studentSchema.virtual('courses', {
    ref: 'Course',
    localField: '_id',
    foreignField: 'owner'
})

studentSchema.methods.toJSON = function () {
    const student = this
    const studentObject = student.toObject()

    delete studentObject.password
    delete studentObject.tokens

    return studentObject
}

studentSchema.methods.generateAuthToken = async function () {
    const student = this
    const token = jwt.sign({ _id: student._id.toString() }, process.env.JWT_SECRET)

    student.tokens = student.tokens.concat({ token })
    await student.save()

    return token
}

studentSchema.statics.findByCredentials = async (email, password) => {
    const student = await Student.findOne({ email })

    if (!student) {
        throw new Error('Unable to login')
    }

    const isMatch = await bcrypt.compare(password, student.password)

    if (!isMatch) {
        throw new Error('Unable to login')
    }

    return student
}

// Hash the plain text password before saving
studentSchema.pre('save', async function (next) {
    const student = this

    if (student.isModified('password')) {
        student.password = await bcrypt.hash(student.password, 8)
    }

    next()
})

// Delete student courses when student is removed
studentSchema.pre('remove', async function (next) {
    const student = this
    await Course.deleteMany({ owner: student._id })
    next()
})

const Student = mongoose.model('Student', studentSchema)

module.exports = Student