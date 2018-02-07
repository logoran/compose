'use strict'

/**
 * Expose compositor.
 */

module.exports = compose

/**
 * Compose `middleware` returning
 * a fully valid middleware comprised
 * of all those which are passed.
 *
 * @param {Array} middleware
 * @return {Function}
 * @api public
 */

function compose (middleware) {
  if (!Array.isArray(middleware)) throw new TypeError('Middleware stack must be an array!')
  for (const fn of middleware) {
    if (typeof fn !== 'function') throw new TypeError('Middleware must be composed of functions!')
  }

  /**
   * @param {Object} context
   * @return {Promise}
   * @api public
   */

  return function (context, next) {
    // last called middleware #
    return dispatch(0)
    function dispatch (i) {
      let fn = middleware[i]
      if (i === middleware.length) {
        if(next && 0 === next.length) {
          try {
            return Promise.resolve(next())
          } catch (err) {
            return Promise.reject(err)
          }
        } else {
          fn = next
        }
      }
      if (!fn) return Promise.resolve()
      try {
        return Promise.resolve(fn(context, function next (offset = 1) {
          return dispatch(i + offset)
        }))
      } catch (err) {
        return Promise.reject(err)
      }
    }
  }
}
