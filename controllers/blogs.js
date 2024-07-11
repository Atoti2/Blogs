const blogsRouter = require("express").Router();
const Blog = require("../models/blog");
const jwt = require('jsonwebtoken')
const userExtractor = require('../utils/middleware').userExtractor

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({}).populate('user', {username: 1, name: 1})
  response.json(blogs)
});

blogsRouter.get('/:id', userExtractor, async (request, response) => {
  const blog = await Blog.findById(request.params.id)
  if (blog) {
    response.status(200).json(blog)
    } else {
      response.status(404).end()
    }
})

blogsRouter.post("/", async (request, response) => {

  if (!request.body.title || !request.body.url) {
    return response.status(400).json({ error: 'title and url are required' });
  }


  const decodedToken = jwt.verify(request.token, process.env.SECRET)
  if (!decodedToken.id) {
    return response.status(401).json({ error: 'token missing or invalid' })
  }
  const user = request.user

  const blog = new Blog({
    title: request.body.title,
    author: request.body.author,
    url: request.body.url,
    likes: request.body.likes || 0,
    user: user.id
  });

  const savedBlog = await blog.save()
  user.blogs = user.blogs.concat(savedBlog._id)  
  await user.save()
  response.status(201).json(savedBlog)
});

blogsRouter.delete("/:id", userExtractor, async (request, response) => {

  const decodedToken = jwt.verify(request.token, process.env.SECRET)
  if (!decodedToken.id) {
    return response.status(401).json({ error: 'token missing or invalid' })
  }

  const blog = await Blog.findById(request.params.id)


  if (blog.user.toString() !== decodedToken.id) {
    return response.status(403).json({ error: 'unauthorized operation' });
  }
  await Blog.findByIdAndDelete(request.params.id)
  response.status(204).end()
})

blogsRouter.put("/:id", async (request, response) => {
  const { likes } = request.body;
    const updatedPost = await Blog.findByIdAndUpdate(
      request.params.id,
      { likes },
      { new: true, runValidators: true }
    );
    response.status(200).json(updatedPost);
})



module.exports = blogsRouter