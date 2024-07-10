const Blog = require('../models/blog')

const initialBlogs = [
    {
        title: "Test 1",
        author: "Test 1 author",
        url: "http://test1",
        likes: 1
    },
    {
        title: "Test 2",
        author: "Test 2 author",
        url: "http://test2",
        likes: 2
    },
]

const blogsInDb = async () => {
    const blogs = await Blog.find({})
 
    return blogs.map(blog => blog.toJSON())
}

module.exports = { initialBlogs, blogsInDb }