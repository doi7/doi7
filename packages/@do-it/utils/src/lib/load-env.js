const path = require('path')
const dotenv = require('dotenv')
const dotenvExpand = require('dotenv-expand')

module.exports = (mode, context = '.') => {
  const basePath = path.resolve(context, `.env${mode ? `.${mode}` : ``}`)
  const localPath = `${basePath}.local`

  const load = envPath => {
    try {
      const env = dotenv.config({
        path: envPath, debug: !!process.env.DEBUG
      })

      dotenvExpand(env)
    } catch (err) {
      // only ignore error if file is not found
      if (err.toString().indexOf('ENOENT') < 0) {
        console.error(err)
      }
    }
  }

  load(localPath)
  load(basePath)
}
