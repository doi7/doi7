const fs = require('fs');
const path = require('path')
const dotenv = require('dotenv')
const dotenvExpand = require('dotenv-expand')

module.exports = ({mode = null, context = '.', local = true}) => {
  const basePath = path.resolve(context, '.env');
  const localPath = `${basePath}.local`;
  const modePath = `${basePath}.${mode}`;
  
  const load = envPath => {
    try {
      const env = dotenv.config({
        path: envPath, debug: !!process.env.DEBUG ? true : null
      })

      dotenvExpand(env)
    } catch (err) {
      // only ignore error if file is not found
      if (err.toString().indexOf('ENOENT') < 0) {
        console.error(err)
      }
    }
  }

  if (fs.existsSync(modePath)) load(modePath)
  if (local && fs.existsSync(localPath)) load(localPath)
  if (fs.existsSync(basePath)) load(basePath)
}
