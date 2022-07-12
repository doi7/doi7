const helpers = require('./lib/helpers')
const isFunction = val => typeof val === 'function'
const isString = val => typeof val === 'string'

module.exports = {
  isFunction,
  isString,
  chalk: require('chalk'),
  sequence: require('./lib/sequence'),
  logger: require('./lib/logger'),
  notify: require('./lib/notify'),
  genChangelog: require('./lib/genChangelog'),
  PackageManager: require('./lib/packageManager'),
  ...helpers
}
