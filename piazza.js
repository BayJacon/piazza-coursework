const express = require('express');
const router = express.Router();
const Post = require('../models/schema'); // Import the correct schema

// POST /posts - Create a new post
router.post('/', async (req, res) => {
    const postData = new Post({
        user: req.body.user,
        title: req.body.title,
        text: req.body.text,
        topic: req.body.topic, // Use "topic" from the schema
        expirationTime: req.body.expirationTime // Add expiration time
    });

    try {
        const postToSave = await postData.save();
        res.status(201).json(postToSave);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET /posts - Browse posts
router.get('/', async (req, res) => {
    try {
        const topic = req.query.topic;
        const posts = topic
            ? await Post.find({ topic })
            : await Post.find();
        res.status(200).json(posts);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// code snippet to handle expiration of posts
router.get('/', async (req, res) => {
    try {
        const now = new Date(); // Current time
        const topic = req.query.topic;

        const posts = topic
            ? await Post.find({ topic, expirationTime: { $gte: now }, status: 'Live' })
            : await Post.find({ expirationTime: { $gte: now }, status: 'Live' });

        res.status(200).json(posts);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


// POST /posts/:id/comment - Add a comment to a post
router.post('/:id/comment', async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).send('Post not found');

        const comment = {
            user: req.body.user,
            text: req.body.text,
            date: new Date()
        };

        post.comments.push(comment);
        await post.save();
        res.status(201).json({ message: 'Comment added!', comments: post.comments });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;