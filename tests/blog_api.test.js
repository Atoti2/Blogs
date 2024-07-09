const {test, after, beforeEach, } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)

const helper = require('./test_helper')

const Blog = require('../models/blog')

beforeEach(async () => {
    await Blog.deleteMany({})
    await Blog.insertMany(helper.initialBlogs)
})

test('there are two notes', async () => {
    const response = await api.get('/api/blogs')
    assert.strictEqual(response.body.length, 2)
})

test('blog post id is named id', async () => {
    const response = await api.get('/api/blogs').expect(200).expect('Content-Type', /application\/json/)
    response.body.forEach((post) => {
        assert.ok(post.id)
        assert.strictEqual(post._id, undefined);
    })
})

test('a valid blog can be added', async () => {
    const newBlog = {
        title: 'Test blog',
        author: 'Test author',
        url: 'https://test.com',
        likes: 5
    }

    await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(201)

    const response = await api.get('/api/blogs')
    assert.strictEqual(response.body.length, helper.initialBlogs.length + 1)
})

test('if the likes is missing it becomes automatically 0', async () => {
    const newBlog = {
        title: 'Test blog',
        author: 'Test author',
        url: 'https://test.com'
    }
    await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(201)
    const response = await api.get('/api/blogs')
    assert.strictEqual(response.body[response.body.length - 1].likes, 0)
})

test('should return 400 Bad Request if title is missing', async () => {
    const newPost = {
      content: 'Content of the new post',
      author: 'Author 3',
      url: 'http://example.com/new-post'
    };

    const postResponse = await api.post('/api/blogs').send(newPost);
    assert.strictEqual(postResponse.status, 400);
    assert.strictEqual(postResponse.body.error, 'title and url are required');
  });

  test('should return 400 Bad Request if url is missing', async () => {
    const newPost = {
      title: 'New post',
      content: 'Content of the new post',
      author: 'Author 3'
    };

    const postResponse = await api.post('/api/blogs').send(newPost);
    assert.strictEqual(postResponse.status, 400);
    assert.strictEqual(postResponse.body.error, 'title and url are required');
  });


after(async () => {
    await mongoose.connection.close()
})