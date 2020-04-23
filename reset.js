const Post = require('./models/post');

Post.destroy({
    where: {},
    truncate: true
});