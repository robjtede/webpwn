'use strict'

const sqlite3 = require('co-sqlite3')
const {
  genSalt,
  hash
} = require('bcryptjs')

const xssList = require('./xss-list')
const app = require('../../server')

let sql = null

const port = Math.round(Math.random() * 1000) + 17000

const getDB = async () => {
  return sql || (sql = await sqlite3(process.env.DB_HOST || './webpwn.test.db'))
}

const getHash = async pass => {
  const salt = await genSalt(10, 4)
  const h = await hash(pass, salt)

  return h
}

const setupDB = async () => {
  const db = await getDB()
  const hashadmin = await getHash('nimda')
  const hashuser = await getHash('resu')

  // clear existing data
  await db.run('DELETE FROM users')
  await db.run('DELETE FROM articles')
  await db.run('DELETE FROM comments')

  // add users
  await db.run('INSERT INTO users (id, user, pass, admin) VALUES (?, ?, ?, ?)', [1, 'admin', hashadmin, 1])
  await db.run('INSERT INTO users (id, user, pass, admin) VALUES (?, ?, ?, ?)', [2, 'user', hashuser, 0])

  // add stored xss attacks
  xssList.forEach(async (xss, index) => {
    await db.run('INSERT INTO articles (id, title, body, author_id) VALUES (?, ?, ?, ?)', [index + 1, xss, xss, 1])
    await db.run('INSERT INTO comments (body, author_id, article_id) VALUES (?, ?, ?)', [xss, 1, index + 1])
    await db.run('INSERT INTO users (id, user, pass, admin) VALUES (?, ?, ?, ?)', [index + 3, xss, 'pass', 0])
  })
}

const startApp = () => {
  console.log(`starting server on port ${port}`)
  app.listen(port)
  return port
}

module.exports = {
  getDB,
  port,
  xssList,
  setupDB,
  startApp
}
