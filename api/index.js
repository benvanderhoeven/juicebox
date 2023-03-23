const express = require('express');
const apiRouter = express.Router();
const tagsRouter = require('./tags');
const usersRouter = require('./users');
const postsRouter = require('./posts');
apiRouter.use('/users', usersRouter);
apiRouter.use('/posts', postsRouter);
apiRouter.use('/tags', tagsRouter);

module.exports = apiRouter;