const execa = require('execa')
const fs = require('fs')
const cc = require('conventional-changelog')
const custom = require('@anteriovieira/conventional-changelog')

function genNewRelease (version) {
  return new Promise(resolve => {
    const newReleaseStream = cc({
      config: custom,
      releaseCount: 2,
      pkg: {
        transform (pkg) {
          pkg.version = `v${version}`
          return pkg
        },
      },
    })

    let output = ''
    newReleaseStream.on('data', buf => {
      output += buf
    })
    newReleaseStream.on('end', () => resolve(output))
  })
}

module.exports = async (version, changelogPath) => {
  const newRelease = await genNewRelease(version)

  try {
    const newChangelog = newRelease + fs.readFileSync(changelogPath, { encoding: 'utf8' })
    fs.writeFileSync(changelogPath, newChangelog)

    delete process.env.PREFIX
  } catch (err) {
    throw new Error(`${changelogPath} not exist`)
  }
}
