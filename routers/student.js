const express = require('express')
const Student = require('../models/student')
const auth = require('../middleware/auth')
const router = new express.Router()

router.post('/students', async (req, res) => {
    const student = new Student(req.body)

    try {
        await student.save()
        const token = await student.generateAuthToken()
        res.status(201).send({ student, token })
    } catch (e) {
        res.status(400).send(e)
    }
})

router.post('/students/login', async (req, res) => {
    try {
        const student = await Student.findByCredentials(req.body.email, req.body.password)
        const token = await student.generateAuthToken()
        res.send({ student, token })
    } catch (e) {
        res.status(400).send()
    }
})

router.post('/students/logout', auth, async (req, res) => {
    try {
        req.student.tokens = req.student.tokens.filter((token) => {
            return token.token !== req.token
        })
        await req.student.save()

        res.send()
    } catch (e) {
        res.status(500).send()
    }
})

// router.post('/students/logoutAll', auth, async (req, res) => {
//     try {
//         req.student.tokens = []
//         await req.student.save()
//         res.send()
//     } catch (e) {
//         res.status(500).send()
//     }
// })

router.get('/students/me', auth, async (req, res) => {
    res.send(req.student)
})

router.patch('/students/me', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'email', 'password', 'batch', 'rollNo']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' })
    }

    try {
        updates.forEach((update) => req.student[update] = req.body[update])
        await req.student.save()
        res.send(req.student)
    } catch (e) {
        res.status(400).send(e)
    }
})

router.delete('/students/me', auth, async (req, res) => {
    try {
        await req.student.remove()
        res.send(req.student)
    } catch (e) {
        res.status(500).send()
    }
})

module.exports = router