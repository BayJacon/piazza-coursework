const express = require('express');
const router = express.Router();
const Post = require('../models/schema');

// POST /posts - Create a new post
router.post('/', async (req, res) => {
    const postData = new Post({
        user: req.body.user,
        title: req.body.title,
        text: req.body.text,
        topic: req.body.topic, // Match the updated schema
        expirationTime: req.body.expirationTime // Include expiration time
    });

    try {
        const postToSave = await postData.save();
        res.status(201).json(postToSave);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET /posts - Fetch posts
router.get('/', async (req, res) => {
    try {
        const posts = await Post.find({ status: 'Live', expirationTime: { $gte: now } });
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

// POST /posts/:id/like - Like a post
router.post('/:id/like', async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).send('Post not found');

        post.likes++;
        await post.save();
        res.status(200).json({ message: 'Post liked!', likes: post.likes });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST /posts/:id/dislike - Dislike a post
router.post('/:id/dislike', async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).send('Post not found');

        post.dislikes++;
        await post.save();
        res.status(200).json({ message: 'Post disliked!', dislikes: post.dislikes });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
