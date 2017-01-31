'use strict'

const Debug = require('debug')
const debug = new Debug('app:routes/index.js')

const { verifyLogin } = require('./helpers')

module.exports = router => {
  router.get('/', index)
}

const index = async ctx => {
  debug('rendering homepage')

  verifyLogin(ctx)

  await ctx.render('index', {
    active: 'index'
  })
}
