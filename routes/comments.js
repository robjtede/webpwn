'use strict'

const Debug = require('debug')
const debug = new Debug('app:routes/comments.js')

const Router = require('koa-router')
const comments = new Router({
  prefix: '/articles/:id/comments'
})

const { auth } = require('./helpers')
const { oneLine } = require('common-tags')

module.exports = router => {
  comments.post('/', create)

  router.use(comments.routes(), comments.allowedMethods())
}

const create = async ctx => {
  debug(`creating comment on article ${ctx.params.id}`)

  const author = ctx.session.me.id
  const body = ctx.request.body.body
  const articleId = ctx.params.id

  const q = `
    INSERT INTO comments
    (body, author_id, article_id)
    VALUES
    (?, ?, ?)
  `

  try {
    const { lastID } = await ctx.db.run(q, [body, author, articleId])

    if (!lastID) ctx.throw(400, `comment was not created on article ${ctx.params.id}`)
    ctx.redirect(`/articles/${articleId}`)
  } catch (err) {
    console.error(err)
    ctx.throw(500)
  }
}
