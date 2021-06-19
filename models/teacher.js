const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Course = require('./course')

const teacherSchema = new mongoose.Schema({
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
    specialization: {
        type: String,
        default: "None",
        trim: true
    },
    rating: {
        type: Number,
        default: 0
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

teacherSchema.virtual('courses', {
    ref: 'Course',
    localField: '_id',
    foreignField: 'owner'
})

teacherSchema.methods.toJSON = function () {
    const teacher = this
    const teacherObject = teacher.toObject()

    delete teacherObject.password
    delete teacherObject.tokens

    return teacherObject
}

teacherSchema.methods.generateAuthToken = async function () {
    const teacher = this
    const token = jwt.sign({ _id: teacher._id.toString() }, "abcd1234")

    teacher.tokens = teacher.tokens.concat({ token })
    await teacher.save()

    return token
}

teacherSchema.statics.findByCredentials = async (email, password) => {
    const teacher = await Teacher.findOne({ email })

    if (!teacher) {
        throw new Error('Unable to login')
    }

    const isMatch = await bcrypt.compare(password, teacher.password)

    if (!isMatch) {
        throw new Error('Unable to login')
    }

    return teacher
}

// Hash the plain text password before saving
teacherSchema.pre('save', async function (next) {
    const teacher = this

    if (teacher.isModified('password')) {
        teacher.password = await bcrypt.hash(teacher.password, 8)
    }

    next()
})

// Delete teacher courses when teacher is removed
teacherSchema.pre('remove', async function (next) {
    const teacher = this
    await Course.deleteMany({ owner: teacher._id })
    next()
})

const Teacher = mongoose.model('Teacher', teacherSchema)

module.exports = Teacher