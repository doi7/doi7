const fs = require('fs')
const path = require('path')
const deepmerge = require('deepmerge')

function get (packagePath) {
  let packageJson

  try {
    packageJson = fs.readFileSync(packagePath, 'utf-8')
  } catch (err) {
    throw new Error(`${packagePath} not exist`)
  }

  try {
    packageJson = JSON.parse(packageJson)
  } catch (err) {
    throw new Error('The package.json is malformed')
  }

  return packageJson
}

class PackageManager {
  constructor (pkgPath = '.') {
    this.path = path.resolve(pkgPath, 'package.json')
    this.pkg = {}
  }

  ready () {
    this.pkg = get(this.path)

    return this.pkg
  }

  save (data) {
    this.pkg = deepmerge(this.pkg, data)

    fs.writeFileSync(this.path, JSON.stringify(this.pkg, null, 2))
  }
}

module.exports = PackageManager