'use strict'

// builtin
const Debug = require('debug')
const path = require('path')
const crypto = require('crypto')

// middleware
const Koa = require('koa')
const Router = require('koa-router')
const views = require('koa-views')
const serve = require('./lib/koa-file-server')
const logger = require('./lib/koa-morgan')
const json = require('koa-json')
const bodyparser = require('koa-bodyparser')
const error = require('koa-error')
const session = require('koa-session')
const CSRF = require('koa-csrf').default
const sqlite = require('./lib/sqlite')

// instantiations
const debug = new Debug('app:server.js')
const app = new Koa()
const router = new Router()

const dev = app.env === 'development'
const prod = app.env === 'production'
const test = app.env === 'test'

app.keys = [crypto.prng(50).toString('hex'), crypto.prng(50).toString('hex')]

debug('error page middleware')
app.use(error({
  engine: 'pug',
  template: `${path.resolve('./views')}/error.pug`
}))

debug('setup logging')
let format = dev ? 'tiny' : 'short'
if (!test) app.use(logger(format))

debug('init middleware')
app.use(bodyparser())
app.use(json())
app.use(sqlite())
app.use(session(app))
// app.use(new CSRF())

app.use(serve({
  root: './public',
  maxage: 60 * 60 * 1000,
  etag: {
    algorithm: 'md5'
  }
}))

app.use(views(path.resolve('./views'), {
  extension: 'pug'
}))

const viewHelpers = require('./views/helpers')
app.use(async (ctx, next) => {
  ctx.state.csrf = ctx.csrf
  Object.assign(ctx.state, viewHelpers)
  await next()
})

debug('init routes')
require('./routes/index')(router)
require('./routes/users')(router)
require('./routes/articles')(router)
require('./routes/comments')(router)

app.use(router.routes(), router.allowedMethods())

module.exports = app
