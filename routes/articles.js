'use strict'

const Debug = require('debug')
const debug = new Debug('app:routes/article.js')

const Router = require('koa-router')
const articles = new Router({
  prefix: '/articles'
})

const { verifyLogin } = require('./helpers')
const { oneLine } = require('common-tags')

module.exports = router => {
  articles.get('/', list)
  articles.get('/new', nouveau)
  articles.post('/', create)
  articles.get('/:id', show)
  articles.get('/:id/edit', edit)
  articles.post('/:id', update)
  articles.post('/:id/delete', remove)

  router.use(articles.routes(), articles.allowedMethods())
}

const list = async ctx => {
  debug('rendering article list')

  verifyLogin(ctx)

  const q = oneLine`
    SELECT articles.id, title, body, articles.created_at as created_at, user as author, author_id, (SELECT COUNT(id) FROM comments WHERE article_id = articles.id) as no_commments
    FROM articles
    INNER JOIN users
    ON articles.author_id = users.id
  `

  const articles = await ctx.db.all(q)

  await ctx.render('articles/list', {
    active: 'article',
    articles
  })
}

const nouveau = async ctx => {
  debug(`rendering new article`)

  if (!verifyLogin(ctx)) ctx.throw(403)

  await ctx.render('articles/new', {
    active: 'article'
  })
}

const create = async ctx => {
  debug(`creating article`)

  if (!verifyLogin(ctx)) ctx.throw(403)

  const title = ctx.request.body.title
  const body = ctx.request.body.body
  const author = ctx.session.me.id

  const q = `
    INSERT INTO
    articles (title, body, author_id)
    VALUES
    ('${title}', '${body}', ${author})
  `

  try {
    const { lastID } = await ctx.db.run(q)

    if (!lastID) ctx.throw(400, `article was not created`)
    ctx.redirect(`/articles/${lastID}`)
  } catch (err) {
    console.error(err)
    ctx.throw(500)
  }
}

const show = async ctx => {
  debug(`rendering article ${ctx.params.id}`)

  verifyLogin(ctx)

  const q1 = oneLine`
    SELECT articles.id, title, body, articles.created_at as created_at, user as author, author_id
    FROM articles
    INNER JOIN users
    ON articles.author_id = users.id
    WHERE articles.id = ${ctx.params.id}
  `
  const q2 = oneLine`
    SELECT comments.id, comments.body, comments.created_at, users.user as author, comments.created_at
    FROM comments
    INNER JOIN users
    ON comments.author_id = users.id
    WHERE article_id = ${ctx.params.id}
  `

  const [article, comments] = await Promise.all([
    ctx.db.get(q1),
    ctx.db.all(q2)
  ])

  if (!article) ctx.throw(404)

  await ctx.render('articles/show', {
    active: 'article',
    article,
    comments
  })
}

const edit = async ctx => {
  debug(`rendering edit article ${ctx.params.id}`)

  const { id } = verifyLogin(ctx)
  const articleCheck = await ctx.db.get(oneLine`
    SELECT author_id
    FROM articles
    WHERE id = ?
  `, [ctx.params.id])

  if (!articleCheck) ctx.throw(400)
  if (id !== articleCheck.author_id) ctx.throw(403)

  const q = oneLine`
    SELECT *
    FROM articles
    WHERE id = ${ctx.params.id}
  `

  const article = await ctx.db.get(q)

  if (!article) ctx.throw(404)

  await ctx.render('articles/edit', {
    active: 'article',
    article
  })
}

const update = async ctx => {
  debug(`updating article ${ctx.params.id}`)

  const { id } = verifyLogin(ctx)
  const articleCheck = await ctx.db.get(oneLine`
    SELECT author_id
    FROM articles
    WHERE id = ?
  `, [ctx.params.id])

  if (!articleCheck) ctx.throw(400)
  if (id !== articleCheck.author_id) ctx.throw(403)

  const title = ctx.request.body.title
  const body = ctx.request.body.body

  const q = `
    UPDATE articles
    SET title = '${title}', body = '${body}', updated_at = datetime('now')
    WHERE id = ${ctx.params.id}
  `

  try {
    const { changes } = await ctx.db.run(q)

    if (!changes) ctx.throw(400, `article ${ctx.params.id} was not updated`)
    ctx.redirect(`/articles/${ctx.params.id}`)
  } catch (err) {
    console.error(err)
    ctx.throw(500)
  }
}

const remove = async ctx => {
  debug(`deleting article ${ctx.params.id}`)

  const { id } = verifyLogin(ctx)
  const articleCheck = await ctx.db.get(oneLine`
    SELECT author_id
    FROM articles
    WHERE id = ?
  `, [ctx.params.id])

  if (!articleCheck) ctx.throw(400)
  if (id !== articleCheck.author_id) ctx.throw(403)

  const q1 = oneLine`
    DELETE FROM comments
    WHERE article_id = ${ctx.params.id}
  `
  const q2 = oneLine`
    DELETE FROM articles
    WHERE id = ${ctx.params.id}
  `

  try {
    await ctx.db.run(q1)
    await ctx.db.run(q2)

    ctx.redirect('/articles')
  } catch (err) {
    console.error(err)
    ctx.throw(500)
  }
}
