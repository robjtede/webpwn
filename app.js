'use strict'

const Debug = require('debug')
const debug = new Debug('app:app.js')

const app = require('./server')
const port = process.env.PORT || 7777

debug(`starting server on port ${port}`)
console.log(`starting server on port ${port}`)
app.listen(port)
