/* global fixture:false test:false */
'use strict'

const { Selector } = require('testcafe')

const {
  admin
} = require('./roles')

const {
  setupDB,
  xssList,
  startApp
} = require('./helpers')

const port = startApp()

const userInput = Selector('input[type="text"]#user')
const passInput = Selector('input[type="password"]#pass')
const submit = Selector('input[type="submit"]#submit')

fixture('XSS Injections')
  .page(`http://localhost:${port}/`)
  .before(async ctx => {
    ctx.port = port
    await setupDB()
  })

test('XSS injection => article list', async t => {
  await t
    .setNativeDialogHandler(() => { throw new Error('Test failed due to XSS execution.') })
    .useRole(admin)
    .navigateTo(`http://localhost:${port}/articles`)

  // wait for next page load
  await t.eval(() => {})
})

xssList.forEach((xss, index) => {
  test(`XSS injection ${index + 1} => article title/body/comments: ${xss}`, async t => {
    await t
      .setNativeDialogHandler(() => { throw new Error('Test failed due to XSS execution.') })
      .useRole(admin)
      .navigateTo(`http://localhost:${port}/articles/${index + 1}`)

    // wait for next page load
    await t.eval(() => {})
  })

  test(`XSS injection ${index + 1} => article title/body edit: ${xss}`, async t => {
    await t
      .setNativeDialogHandler(() => { throw new Error('Test failed due to XSS execution.') })
      .useRole(admin)
      .navigateTo(`http://localhost:${port}/articles/${index + 1}/edit`)

    // wait for next page load
    await t.eval(() => {})
  })

  test(`XSS injection ${index + 1} => user profile: ${xss}`, async t => {
    await t
      .setNativeDialogHandler(() => { throw new Error('Test failed due to XSS execution.') })
      .useRole(admin)
      .navigateTo(`http://localhost:${port}/profile`)

    // wait for next page load
    await t.eval(() => {})
  })

  test(`XSS injection ${index + 1} => login page reflection: ${xss}`, async t => {
    await t
      .setNativeDialogHandler(() => { throw new Error('Test failed due to XSS execution.') })
      .navigateTo(`http://localhost:${port}/login`)
      .typeText(userInput, xss)
      .typeText(passInput, '!pass')
      .click(submit)

    // wait for next page load
    await t.eval(() => {})
  })
})
