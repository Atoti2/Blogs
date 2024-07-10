const { test, beforeEach, after } = require('node:test');
const assert = require('node:assert');
const mongoose = require('mongoose');
const supertest = require('supertest');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const app = require('../app');
const api = supertest(app);

const helper = require('./test_helper');
const Blog = require('../models/blog');
const User = require('../models/user');

let token;

beforeEach(async () => {
  await Blog.deleteMany({});
  await User.deleteMany({});

  const passwordHash = await bcrypt.hash('testpassword', 10);
  const user = new User({ username: 'testuser', passwordHash });
  await user.save();

  const userForToken = { username: user.username, id: user._id };
  token = jwt.sign(userForToken, process.env.SECRET);

  const blog = new Blog({
    title: 'Test Blog',
    author: 'Test Author',
    url: 'http://testurl.com',
    likes: 0,
    user: user._id,
  });

  await blog.save();
});

test('blog post id is named id', async () => {
  const response = await api.get('/api/blogs')
    .expect(200)
    .set('Authorization', `Bearer ${token}`)
    .expect('Content-Type', /application\/json/);

  response.body.forEach((post) => {
    assert.ok(post.id);
    assert.strictEqual(post._id, undefined);
  });
});

test('a valid blog can be added', async () => {
  const newBlog = {
    title: 'Test blog',
    author: 'Test author',
    url: 'https://test.com',
    likes: 5,
  };

  await api
    .post('/api/blogs')
    .set('Authorization', `Bearer ${token}`)
    .send(newBlog)
    .expect(201);

  const response = await api.get('/api/blogs').set('Authorization', `Bearer ${token}`);
  assert.strictEqual(response.body.length, helper.initialBlogs.length);
});

test('if the likes is missing it becomes automatically 0', async () => {
  const newBlog = {
    title: 'Test blog',
    author: 'Test author',
    url: 'https://test.com',
  };

  await api
    .post('/api/blogs')
    .set('Authorization', `Bearer ${token}`)
    .send(newBlog)
    .expect(201);

  const response = await api.get('/api/blogs').set('Authorization', `Bearer ${token}`);
  assert.strictEqual(response.body[response.body.length - 1].likes, 0);
});

test('should return 400 Bad Request if title is missing', async () => {
  const newPost = {
    content: 'Content of the new post',
    author: 'Author 3',
    url: 'http://example.com/new-post',
  };

  const postResponse = await api
    .post('/api/blogs')
    .set('Authorization', `Bearer ${token}`)
    .send(newPost)
    .expect(400);

  assert.strictEqual(postResponse.body.error, 'title and url are required');
});

test('should return 400 Bad Request if url is missing', async () => {
  const newPost = {
    title: 'New post',
    content: 'Content of the new post',
    author: 'Author 3',
  };

  const postResponse = await api
    .post('/api/blogs')
    .set('Authorization', `Bearer ${token}`)
    .send(newPost)
    .expect(400);

  assert.strictEqual(postResponse.body.error, 'title and url are required');
});

test('succeeds with status code 204 for deleting a post', async () => {
  const blogsAtStart = await helper.blogsInDb();
  const blogToDelete = blogsAtStart[0];

  await api
    .delete(`/api/blogs/${blogToDelete.id}`)
    .set('Authorization', `Bearer ${token}`)
    .expect(204);

  const blogsAtEnd = await helper.blogsInDb();
  assert.strictEqual(blogsAtEnd.length, blogsAtStart.length - 1);
});

test('should return 200 response when updating', async () => {
  const newPost = {
    title: 'Another test post',
    content: 'Another test content',
    author: 'Another test author',
    url: 'http://example.com/another-test-post',
    likes: 0,
  };

  const postResponse = await api
    .post('/api/blogs')
    .set('Authorization', `Bearer ${token}`)
    .send(newPost)
    .expect(201);

  const createdPost = postResponse.body;

  const updatedPost = {
    title: 'Another test post',
    content: 'Another test content',
    author: 'Another test author',
    url: 'http://example.com/another-test-post',
    likes: 50,
  };

  const updateResponse = await api
    .put(`/api/blogs/${createdPost.id}`)
    .set('Authorization', `Bearer ${token}`)
    .send(updatedPost)
    .expect(200);

  assert.strictEqual(updateResponse.body.likes, 50);
});

test('should give suitable status code if invalid user is created', async () => {
  const user = {
    username: 'Ferivok',
    name: 'Ferenc',
    password: 'in',
  };

  const response = await api
    .post('/api/users')
    .send(user)
    .expect(400);

  assert.strictEqual(response.body.error, 'password must be at least 3 characters');
});

after(async () => {
  await mongoose.connection.close();
});
