const express = require('express')
const Teacher = require('../models/teacher')
const auth = require('../middleware/auth2')
const router = new express.Router()

router.post('/teachers', async (req, res) => {
    const teacher = new Teacher(req.body)

    try {
        await teacher.save()
        const token = await teacher.generateAuthToken()
        res.status(201).send({ teacher, token })
    } catch (e) {
        res.status(400).send(e)
    }
})

router.post('/teachers/login', async (req, res) => {
    try {
        const teacher = await Teacher.findByCredentials(req.body.email, req.body.password)
        const token = await teacher.generateAuthToken()
        res.send({ teacher, token })
    } catch (e) {
        res.status(400).send()
    }
})

router.post('/teachers/logout', auth, async (req, res) => {
    try {
        req.teacher.tokens = req.teacher.tokens.filter((token) => {
            return token.token !== req.token
        })
        await req.teacher.save()

        res.send()
    } catch (e) {
        res.status(500).send()
    }
})

router.get('/teachers/:id', auth, async (req, res) => {
    const _id = req.params.id

    try {
        const teacher = await Teacher.findOne({ _id
        })

        if (!teacher) {
            return res.status(404).send()
        }

        res.send(teacher)
    } catch (e) {
        res.status(500).send()
    }
})

router.patch('/teachers/:id', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'email', 'password', 'specialization', 'rating']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' })
    }

    try {
        updates.forEach((update) => req.teacher[update] = req.body[update])
        await req.teacher.save()
        res.send(req.teacher)
    } catch (e) {
        res.status(400).send(e)
    }
})

router.delete('/teachers/:id', auth, async (req, res) => {
    try {
        await req.teacher.remove()
        res.send(req.teacher)
    } catch (e) {
        res.status(500).send()
    }
})

module.exports = router