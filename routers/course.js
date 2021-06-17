const express = require('express')
const Course = require('../models/course')
const auth = require('../middleware/auth2')
const router = new express.Router()

router.post('/courses', auth, async (req, res) => {
    const course = new Course({
        ...req.body,
        owner: req.teacher._id
    })

    try {
        await course.save()
        res.status(201).send(course)
    } catch (e) {
        res.status(400).send(e)
    }
})

// GET /courses?completed=true
// GET /courses?limit=10&skip=20
// GET /courses?sortBy=createdAt:desc
router.get('/courses', auth, async (req, res) => {
    const match = {}
    const sort = {}

    if (req.query.completed) {
        match.completed = req.query.completed === 'true'
    }

    if (req.query.sortBy) {
        const parts = req.query.sortBy.split(':')
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
    }

    try {
        await req.teacher.populate({
            path: 'courses',
            match,
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            }
        }).execPopulate()
        res.send(req.teacher.courses)
    } catch (e) {
        res.status(500).send()
    }
})

router.get('/courses/:id', auth, async (req, res) => {
    const _id = req.params.id

    try {
        const course = await Course.findOne({ _id, owner: req.teacher._id })

        if (!course) {
            return res.status(404).send()
        }

        res.send(course)
    } catch (e) {
        res.status(500).send()
    }
})

router.patch('/courses/:id', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = [ 'courseName', 'description', 'completed' ]
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' })
    }

    try {
        const course = await Course.findOne({ _id: req.params.id, owner: req.teacher._id})

        if (!course) {
            return res.status(404).send()
        }

        updates.forEach((update) => course[update] = req.body[update])
        await course.save()
        res.send(course)
    } catch (e) {
        res.status(400).send(e)
    }
})

router.delete('/courses/:id', auth, async (req, res) => {
    try {
        const course = await Course.findOneAndDelete({ _id: req.params.id, owner: req.teacher._id })

        if (!course) {
            res.status(404).send()
        }

        res.send(course)
    } catch (e) {
        res.status(500).send()
    }
})

module.exports = router