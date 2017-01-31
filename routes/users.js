'use strict'

const Debug = require('debug')
const debug = new Debug('app:routes/login.js')

const { verifyLogin } = require('./helpers')
const { oneLine } = require('common-tags')

module.exports = router => {
  router.get('/token', token)
  router.get('/login', login)
  router.post('/login', authenticate)
  router.post('/logout', logout)
  router.get('/profile', profile)
  router.get('/user/:user', user)
}

const token = async ctx => {
  debug('issuing csrf token', ctx.state.csrf)

  ctx.status = 200
  ctx.body = ctx.state.csrf || ''
}

const login = async ctx => {
  debug('rendering login')

  if (!verifyLogin(ctx)) {
    await ctx.render('login', {
      active: 'login'
    })
  } else ctx.redirect('/')
}

const authenticate = async ctx => {
  debug('authenticating')

  const user = ctx.request.body.user
  const pass = ctx.request.body.pass

  const q = oneLine`
    SELECT * FROM users
    WHERE user='${user}'
    AND pass='${pass}'
  `

  const acc = await ctx.db.get(q)
  debug(acc)

  if (acc) {
    ctx.session.me = {
      id: acc.id,
      user: acc.user
    }

    ctx.redirect('/')
  } else {
    ctx.status = 401

    await ctx.render('login', {
      error: `Account with username "${user}" not found or password was incorrect.`
    })
  }
}

const user = async ctx => {
  debug('rendering user profile')

  const username = ctx.params.user
  const me = verifyLogin(ctx)

  const q1 = oneLine`
    SELECT * FROM users
    WHERE user='${username}'
  `

  const q2 = oneLine`
    SELECT users.id, user as author, articles.id, title, author_id, articles.created_at
    FROM users
    INNER JOIN articles
    ON users.id = articles.author_id
    WHERE user='${username}'
  `

  const user = await ctx.db.get(q1)
  if (!user) ctx.throw(404)

  const articles = await ctx.db.all(q2)

  await ctx.render('user', {
    active: (me && me.user === username) ? 'profile' : '',
    user,
    articles
  })
}

const profile = async ctx => {
  debug('rendering own profile')

  const me = verifyLogin(ctx)

  if (me) {
    ctx.redirect(`/user/${me.user}`)
  } else ctx.redirect('/login')
}

const logout = async ctx => {
  debug('logging out')

  if (verifyLogin(ctx)) {
    ctx.session.me.id = 0
    ctx.session.me.user = ''
    ctx.session.me = {}

    delete ctx.session.me

    ctx.redirect('/')
  } else ctx.redirect('/')
}
