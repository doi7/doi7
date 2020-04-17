const isFunction = val => typeof val === 'function'

module.exports = {
  isFunction,
  chalk: require('chalk'),
  sequence: require('./lib/sequence'),
  logger: require('./lib/logger'),
  notify: require('./lib/notify'),
  genChangelog: require('./lib/genChangelog'),
  PackageManager: require('./lib/packageManager')
}
