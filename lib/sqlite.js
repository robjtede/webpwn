'use strict'

const sqlite3 = require('co-sqlite3')

module.exports = () => {
  return async (ctx, next) => {
    ctx.db = await sqlite3(process.env.DB_HOST || './webpwn.db')
    await next()
  }
}
