'use strict'

const {
  Role,
  Selector
} = require('testcafe')

const { port } = require('./helpers')

const userInput = Selector('input[type="text"]#user')
const passInput = Selector('input[type="password"]#pass')
const submit = Selector('input[type="submit"]#submit')

module.exports.admin = Role(`http://localhost:${port}/login`, async t => {
  await t
    .typeText(userInput, 'admin')
    .typeText(passInput, 'nimda')
    .click(submit)
})

module.exports.user = Role(`http://localhost:${port}/login`, async t => {
  await t
    .typeText(userInput, 'user')
    .typeText(passInput, 'resu')
    .click(submit)
})
