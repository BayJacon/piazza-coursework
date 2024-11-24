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
