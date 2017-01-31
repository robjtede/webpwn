'use strict'

const sqlite3 = require('co-sqlite3')
const { genSalt, hash } = require('bcryptjs')

let sql = null

const getDB = async () => {
  return sql || (sql = await sqlite3(process.env.DB_HOST || './webpwn.test.db'))
}

const getHash = async pass => {
  const salt = await genSalt(10, 4)
  const h = await hash(pass, salt)

  return h
}

module.exports = {
  getDB,
  getHash
}
