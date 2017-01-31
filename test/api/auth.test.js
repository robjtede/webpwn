'use strict'

const { test } = require('ava')
const request = require('supertest-session')

const {
  getDB
} = require('./helpers')

const server = require('../../server')
let app = null

test.before('setup server', async t => {
  app = server.listen()
})

test.beforeEach('seed database', async t => {
  const db = await getDB()

  await db.run('DELETE FROM comments')
  await db.run('DELETE FROM articles')
  await db.run('DELETE FROM users')

  await db.run('INSERT INTO users (id, user, pass, admin) VALUES (?, ?, ?, ?)', [1, 'admin', 'nimda', 1])
  await db.run('INSERT INTO users (id, user, pass, admin) VALUES (?, ?, ?, ?)', [2, 'user', 'resu', 0])

  await db.run('INSERT INTO articles (id, title, body, author_id) VALUES (?, ?, ?, ?)', [1, 'title', 'body', 1])
})

test.beforeEach('get csrf token', async t => {
  const agent = request(app)
  t.context.agent = agent

  const loginToken = await agent
    .get('/token')
    .then(res => res.text)

  await agent
    .post('/login')
    .send({
      user: 'user',
      pass: 'resu',
      _csrf: loginToken
    })

  t.context.token = await agent
    .get('/token')
    .then(res => res.text)
})

test.serial('anonymous user => load new article page', async t => {
  const logoutToken = await t.context.agent
    .get('/token')
    .then(res => res.text)

  await t.context.agent
    .post('/logout')
    .send({
      _csrf: logoutToken
    })

  const res = await t.context.agent
    .get('/articles/new')

  t.is(res.status, 403, 'anonymous user => should not be able load new article page')
})

test.serial('anonymous user => create article', async t => {
  const logoutToken = await t.context.agent
    .get('/token')
    .then(res => res.text)

  await t.context.agent
    .post('/logout')
    .send({
      _csrf: logoutToken
    })

  const res = await t.context.agent
    .post('/articles')
    .send({
      title: `title by anon`,
      body: `body by anon`,
      _csrf: t.context.token
    })

  t.is(res.status, 403, 'anon should not be able to create articles')
})

test.serial('user => create articles as another via SQL injection', async t => {
  const db = await getDB()

  const res = await t.context.agent
    .post('/articles')
    .send({
      title: `title`,
      body: `body', 1);--`,
      _csrf: t.context.token
    })

  const dbCheck = await db.get(`
    SELECT *
    FROM articles
    WHERE title = ? AND body = ? AND author_id = ?
  `, [`title`, `body', 1);--`, 2])

  t.is(res.status, 302, 'user should have made a successful request with injection string as the body')
  t.truthy(dbCheck, 'inserted row should belong to user not admin')
  // HINT: this is fixed with the SQL injection exercise
})

test.serial('user => comment as another via SQL injection', async t => {
  const db = await getDB()

  const res = await t.context.agent
    .post('/articles/1/comments')
    .send({
      body: `body', 1, 1);--`,
      _csrf: t.context.token
    })

  const dbCheck = await db.get(`
    SELECT *
    FROM comments
    WHERE body = ? AND author_id = ? AND article_id = ?
  `, [`body', 1, 1);--`, 2, 1])

  t.is(res.status, 302, 'user should have made a successful request with injection string as the body')
  t.truthy(dbCheck, 'inserted row should belong to user not admin')
  // HINT: this is fixed with the SQL injection exercise
})

test('user load others articles edit page', async t => {
  const res = await t.context.agent
    .get('/articles/1/edit')

  t.is(res.status, 403, 'user should not be able to edit as others')
})

test.serial('user => edit others articles', async t => {
  const res = await t.context.agent
    .post('/articles/1')
    .send({
      title: `title by user`,
      body: `body by user`,
      _csrf: t.context.token
    })

  t.is(res.status, 403, 'user should not be able to edit as others')
})

test.serial('user => edit others articles via SQL injection', async t => {
  const res = await t.context.agent
    .post('/articles/1')
    .send({
      title: `title by user', body = 'body by user' WHERE id = 1;--`,
      _csrf: t.context.token
    })

  t.is(res.status, 403, 'user should not be able to edit as others')
  // HINT: this is fixed with the SQL injection exercise
})

test.serial('user => delete others articles', async t => {
  const res = await t.context.agent
    .post('/articles/1/delete')
    .send({
      _csrf: t.context.token
    })

  t.is(res.status, 403, 'user should not be able to delete as others')
})
