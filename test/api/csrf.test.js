'use strict'

const { test } = require('ava')
const request = require('supertest-session')

const {
  getDB,
  getHash
} = require('./helpers')

const server = require('../../server')
let app = null

let lastID

test.before('setup server', async t => {
  app = server.listen()
})

test.before('seed database', async t => {
  const db = await getDB()
  const hashadmin = await getHash('nimda')
  const hashuser = await getHash('resu')

  await db.run('DELETE FROM comments')
  await db.run('DELETE FROM articles')
  await db.run('DELETE FROM users')
  await db.run('INSERT INTO users (id, user, pass, admin) VALUES (?, ?, ?, ?)', [1, 'admin', hashadmin, 1])
  await db.run('INSERT INTO users (id, user, pass, admin) VALUES (?, ?, ?, ?)', [2, 'user', hashuser, 0])
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
      user: 'admin',
      pass: 'nimda',
      _csrf: loginToken
    })

  t.context.token = await agent
    .get('/token')
    .then(res => res.text)
})

test('user: login => without csrf token', async t => {
  const res = await t.context.agent
    .post('/login')
    .send({
      user: 'admin',
      pass: 'nimda'
    })

  t.is(res.status, 403, 'should be unauthorized')
})

test('user: login => with csrf token', async t => {
  const res = await t.context.agent
    .post('/login')
    .send({
      user: 'admin',
      pass: 'nimda',
      _csrf: t.context.token
    })

  t.is(res.status, 302, 'should redirect')
  t.is(res.headers.location, '/', 'redirect should be to main index')
})

test('user: incorrect login => without csrf token', async t => {
  const res = await t.context.agent
    .post('/login')
    .send({
      user: 'none',
      pass: 'none'
    })

  t.is(res.status, 403, 'should be unauthorized')
})

test('user: incorrect login => with csrf token', async t => {
  const res = await t.context.agent
    .post('/login')
    .send({
      user: 'none',
      pass: 'none',
      _csrf: t.context.token
    })

  t.is(res.status, 401, 'user should not exist')
})

test.serial('article: create => without csrf token', async t => {
  const res = await t.context.agent
    .post('/articles')
    .send({
      title: `title`,
      body: `body`
    })

  t.is(res.status, 403, 'should be unauthorized')
})

test.serial('article: create => with csrf token', async t => {
  const res = await t.context.agent
    .post('/articles')
    .send({
      title: `title`,
      body: `body`,
      _csrf: t.context.token
    })

  t.is(res.status, 302, 'should redirect')

  const re = /(\d+$)/
  lastID = re.exec(res.headers.location)[1]
})

test.serial('article: update => without csrf token', async t => {
  const res = await t.context.agent
    .post(`/articles/${lastID}`)
    .send({
      title: `title`,
      body: `body`
    })

  t.is(res.status, 403, 'should be unauthorized')
})

test.serial('article: update => with csrf token', async t => {
  const res = await t.context.agent
    .post(`/articles/${lastID}`)
    .send({
      title: `title`,
      body: `body`,
      _csrf: t.context.token
    })

  t.is(res.status, 302, 'should redirect')
  t.is(res.headers.location, `/articles/${lastID}`, 'redirect should be back to article')
})

test.serial('comment: create => without csrf token', async t => {
  const res = await t.context.agent
    .post(`/articles/${lastID}/comments`)
    .send({
      body: 'body'
    })

  t.is(res.status, 403, 'should be unauthorized')
})

test.serial('comment: create => with csrf token', async t => {
  const res = await t.context.agent
    .post(`/articles/${lastID}/comments`)
    .send({
      body: 'body',
      _csrf: t.context.token
    })

  t.is(res.status, 302, 'should redirect')
  t.is(res.headers.location, `/articles/${lastID}`, 'redirect should be back to article')
})

test.serial('article: delete => without csrf token', async t => {
  const res = await t.context.agent
    .post(`/articles/${lastID}/delete`)
    .send({})

  t.is(res.status, 403, 'should be unauthorized')
})

test.serial('article: delete => with csrf token', async t => {
  const res = await t.context.agent
    .post(`/articles/${lastID}/delete`)
    .send({
      _csrf: t.context.token
    })

  t.is(res.status, 302, 'should redirect')
  t.is(res.headers.location, `/articles`, 'redirect should be back to article list')
})
