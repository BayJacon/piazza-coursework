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