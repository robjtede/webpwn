'use strict'

const { test } = require('ava')
const request = require('supertest-session')

const {
  getDB,
  getHash
} = require('./helpers')

const server = require('../../server')
let app = null

test.before('setup server', async t => {
  app = server.listen()
})

test.before('seed database', async t => {
  const db = await getDB()
  const hash = await getHash('nimda')

  await db.run('DELETE FROM users')
  await db.run('INSERT INTO users (id, user, pass, admin) VALUES (?, ?, ?, ?)', [1, 'admin', hash, 1])
  await db.run('INSERT INTO users (id, user, pass, admin) VALUES (?, ?, ?, ?)', [2, 'user', 'resu', 0])
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

test('user passwords are hashed', async t => {
  const res = await t.context.agent
    .post('/login')
    .send({
      user: 'admin',
      pass: 'nimda',
      _csrf: t.context.token
    })

  t.is(res.status, 302, 'login should redirect')
  t.is(res.headers.location, '/', 'redirect should be to main index')
})

test('plaintext passwords should not work', async t => {
  const res = await t.context.agent
    .post('/login')
    .send({
      user: 'user',
      pass: 'resu',
      _csrf: t.context.token
    })

  t.is(res.status, 401, 'login should fail')
})
