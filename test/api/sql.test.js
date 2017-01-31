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
      user: 'admin',
      pass: 'nimda',
      _csrf: loginToken
    })

  t.context.token = await agent
    .get('/token')
    .then(res => res.text)
})

test('user: login => admin login', async t => {
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

test('user: login => user login', async t => {
  const res = await t.context.agent
    .post('/login')
    .send({
      user: 'user',
      pass: 'resu',
      _csrf: t.context.token
    })

  t.is(res.status, 302, 'login should redirect')
  t.is(res.headers.location, '/', 'redirect should be to main index')
})

test('user: login => incorrect credentials', async t => {
  const res = await t.context.agent
    .post('/login')
    .send({
      user: 'none',
      pass: 'none',
      _csrf: t.context.token
    })

  t.is(res.status, 401, 'user should not exist')
})

const injections = [
  `' OR 1=1--`,
  `' OR '1'='1`,
  `admin'--`
]

for (const injection of injections) {
  test(`user: login => bypass login SQL injection: ${injection}`, async t => {
    const res = await t.context.agent
      .post('/login')
      .send({
        user: injection,
        pass: injection,
        _csrf: t.context.token
      })

    t.is(res.status, 401, 'login should not succeed')
  })
}

test('user: profile => extract list of usernames and passwords', async t => {
  const dataExtractionQuery = `' UNION SELECT 1,user,3,pass,5,6 FROM users--`

  const res = await t.context.agent
    .get(`/user/${dataExtractionQuery}`)

  const leakedPassword = /.*<h3 class="article-item-title"><a href="\/articles\/\d">nimda<\/a><\/h3><p class="article-item-author"><a href="\/user\/admin">admin<\/a><\/p>.*/gim

  t.notRegex(res.text, leakedPassword, 'list of passwords should not be leaked')
})

test('articles: show => cause server error via SQL injection', async t => {
  const res = await t.context.agent
    .get(`/articles/'`)

  t.is(res.status, 404, 'SQL injection should not cause server error')
})

test.serial('articles: create => cause server error via SQL injection', async t => {
  const res = await t.context.agent
    .post(`/articles`)
    .send({
      title: `'`,
      body: `'`,
      _csrf: t.context.token
    })

  t.is(res.status, 302, 'SQL injection should not cause server error')
  // TODO: redirect to where
})

test('articles: edit => cause server error via SQL injection', async t => {
  const res = await t.context.agent
    .get(`/articles/'/edit`)

  t.is(res.status, 404, 'SQL injection should not cause server error')
})

test.serial('articles: update => cause server error via SQL injection', async t => {
  const res1 = await t.context.agent
    .post(`/articles/'`)
    .send({
      title: `'`,
      body: `'`,
      _csrf: t.context.token
    })

  const res2 = await t.context.agent
    .post(`/articles/1`)
    .send({
      title: `'`,
      body: `'`,
      _csrf: t.context.token
    })

  t.is(res1.status, 400, 'SQL injection should not cause server error')
  t.is(res2.status, 302, 'SQL injection should not cause server error')
})

test.serial('articles: remove => cause server error via SQL injection', async t => {
  const res = await t.context.agent
    .post(`/articles/'/delete`)
    .send({
      _csrf: t.context.token
    })

  t.is(res.status, 302, 'SQL injection should not cause server error')
  // TODO: redirect to where
})

test.serial('comments: create => cause server error via SQL injection', async t => {
  const res1 = await t.context.agent
    .post(`/articles/'/comments`)
    .send({
      author: `'`,
      body: `'`,
      _csrf: t.context.token
    })

  const res2 = await t.context.agent
      .post(`/articles/1/comments`)
      .send({
        author: `'`,
        body: `'`,
        _csrf: t.context.token
      })

  t.is(res1.status, 302, 'SQL injection should not cause server error')
  t.is(res2.status, 302, 'SQL injection should not cause server error')
  // TODO: redirect to where
})
