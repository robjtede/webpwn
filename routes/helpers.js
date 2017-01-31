'use strict'

const verifyLogin = ctx => {
  const me = ctx.session ? ctx.session.me : null

  if (me) ctx.state.me = me
  return me
}

module.exports = {
  verifyLogin
}
