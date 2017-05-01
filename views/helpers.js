'use strict'

const marked = require('marked')
const {
  distanceInWordsStrict,
  format
} = require('date-fns')

marked.setOptions({
  // `sanitize: true` will escape all raw HTML syntax
  sanitize: true
})

const dateDiff = date => distanceInWordsStrict(
  new Date(date),
  new Date()
)

const articleDate = date => format(
  date,
  'Do MMM YYYY [at] h:mma'
)

module.exports = {
  articleDate,
  dateDiff,
  marked
}
