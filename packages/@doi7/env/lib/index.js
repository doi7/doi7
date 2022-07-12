const fs = require('fs');
const path = require('path')
const dotenv = require('dotenv')
const dotenvExpand = require('dotenv-expand')

module.exports = ({mode = null, context = '.', local = true} = {}) => {
  const basePath = path.resolve(context, '.env')
  const localPath = `${basePath}.local`
  const modePath = mode ? `${basePath}.${mode}` : mode
  const localModePath = `${modePath}.local`
  
  const load = envPath => {
    try {
      if(!fs.existsSync(envPath)) return;

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

  if (local) load(localModePath)
  if (modePath) load(modePath)
  if (local) load(localPath)
  
  load(basePath)
}
