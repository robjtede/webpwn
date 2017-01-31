'use strict'

// builtin
const Debug = require('debug')
const path = require('path')
const crypto = require('crypto')

// middleware
const Koa = require('koa')
const Router = require('koa-router')
const views = require('koa-views')

// instantiations
const debug = new Debug('app:server.js')
const app = new Koa()
const router = new Router()

app.use(views(path.resolve('./views'), {
  extension: 'pug'
}))

debug('init routes')
router.get('/', async ctx => {
  await ctx.render('malicious/index')
})

app.use(router.routes(), router.allowedMethods())

app.listen(7666)

module.exports = app
