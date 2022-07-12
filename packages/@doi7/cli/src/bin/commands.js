const program = require('commander')
const Liftoff = require('liftoff')
const v8flags = require('v8flags')
const interpret = require('interpret')
const parseArgs = require('minimist')

const cli = new Liftoff({
  name: 'doit',
  extensions: {
    '.js': null,
    '.json': null
  },
  v8flags
})

program
  .version(require('../../package.json').version)
  .usage('<command> [options]')

program
  .command('favicons')
  .allowUnknownOption()
  .description('Generate favicons to app')
  .option('-s, --source <source>', 'file for generate favicons', 'icon.png')
  .option('-d, --dest <dest>', 'output directory', 'icons')
  .option('-c, --context <context>', 'dir context', './')
  .action(cmd => {
    loadCommand('favicons', cleanArgs(cmd))
  })

program
  .command('release')
  .description('Release')
  .allowUnknownOption()
  .option('-l, --changelog', 'generate changelog')
  .option('-c, --commit', 'commit changes')
  .option('-p, --push', 'push new version for github')
  .option('-v, --verbose', 'show the output of command processing')
  .option('-s, --skip-ci', 'skip the automated deployment by adding [skip ci]')
  .option('-D, --docker <source>', 'push a new tag to docker repository')
  .action(cmd => loadCommand('release', cleanArgs(cmd)))

program
  .command('task')
  .alias('tasks')
  .allowUnknownOption()
  .description('Tasks')
  .option('-l, --list', 'list all tasks')
  .option('-v, --verbose', 'show the output of command processing')
  .action(cmd => loadCommand('task', cleanArgs(cmd)))

program.commands.forEach(c => c.on('--help', () => console.log()))
program.parse(process.argv)

function camelize (str) {
  return str.replace(/-(\w)/g, (_, c) => c ? c.toUpperCase() : '')
}

function loadCommand (name, params) {
  cli.launch(
    { configPath: program.doitfile, require: program.require },
    env => invoke({
      env,
      params,
      command: name,
      engine: (...args) => require(`../commands/${name}`)(...args)
    })
  )
}

function cleanArgs (cmd) {
  const options = cmd.parseOptions(process.argv)
  const unknown = parseArgs(options.unknown)
  const allargs = {}
  
  cmd.options.forEach(o => {
    const key = camelize(o.long.replace(/^--/, ''))
    if (typeof cmd[key] !== 'function' && typeof cmd[key] !== undefined) {
      allargs[key] = cmd[key]
    }
  })
  let [command] = options.args.slice(3)
  return { ...allargs, ...unknown, command  }
}

async function asyncInvoke ({ env, params, command, engine }) {
  try {
    // load module
    const module = env.configPath ? require(env.configPath) : {}
    const handler = typeof module.default === 'function' ? module.default : module
    const config = typeof handler === 'function' ? await handler({ command, params, env }) : (handler || {})

    await engine(params, config, env)

    exit(1)
  } catch (err) {
    throw err
  }
}

function invoke(...args) {
  asyncInvoke(...args).catch(error => {
    setTimeout(() => {
      throw error
    })
  })
}

function exit(code) {
  if (process.platform === 'win32' && process.stdout.bufferSize) {
    process.stdout.once('drain', () => {
      process.exit(code)
    })
    return
  }

  process.exit(code)
}
