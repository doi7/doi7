const execa = require('execa')
const deepmerge = require('deepmerge')
const { logger } = require('@doi7/utils')
const chalk = require('chalk')

const envConfig = {
  name: null,
  host: null,
  user: 'dev',
  path: null,
  composer: null,
  service: null,
  commands: {
    before: [],
    after: []
  }
}

const line = console.log
const header  = text => `echo ":: ${chalk.green(text)} ::"`
const castArray = val => (Array.isArray(val) ? val : [val]);

module.exports = async (target, params, extraCommands) => {
  const commands = []
  const env = deepmerge(envConfig, target)

  logger.info(`Accessing environment ${env.name}`)

  const beforeCommands = [
    ...castArray(extraCommands.before),
    ...castArray(env.commands.before)
  ]
  const afterCommands = [
    ...castArray(env.commands.after),
    ...castArray(extraCommands.after)
  ]

  // adds before commands
  if (beforeCommands.length) {
    commands.push(header('Before commands'), ...beforeCommands)
  }

  if (params.pull) {
    const branch = params.pull === true ? 'development' : params.pull
    commands.push(
      header(`Updating project (branch: ${branch})`),
      `cd ${env.path}`,
      'git reset --hard',
      'git fetch --all',
      `git checkout ${branch}`,
      'git pull'
    )
  }

  if (params.composer) {
    commands.push(
      header('Updating composer'),
      `cd ~/infrastructure/composers/${env.composer}`,
      'git pull'
    )
  }

  if (params.rebot) {
    commands.push(
      header('Rebuilding containers'),
      `cd ~/infrastructure/composers/${env.composer}`,
      'sudo docker-compose down',
      'sudo docker-compose up -d'
    )
  }

  if (params.install) {
    commands.push(
      header('Installing dependencies'),
      `cd ~/infrastructure/composers/${env.composer}`,
      `sudo docker-compose exec ${env.service} bash -c \'npm install\'`
    )
  }

  if (params.build) {
    commands.push(
      header('Rebuilding application'),
      `cd ~/infrastructure/composers/${env.composer}`,
      `sudo docker-compose exec ${env.service} bash -c \'npm run build\'`
    )
  }

  if (params.restart) {
    commands.push(
      header('Restarting container'),
      `cd ~/infrastructure/composers/${env.composer}`,
      `sudo docker-compose restart ${env.service}`
    )
  }

  if (params.down) {
    commands.push(
      header('Stopping container'),
      `cd ~/infrastructure/composers/${env.composer}`,
      `sudo docker-compose down ${env.service}`
    )
  }

  if (params.stop) {
    commands.push(
      header('Stopping container'),
      `cd ~/infrastructure/composers/${env.composer}`,
      `sudo docker-compose stop ${env.service}`
    )
  }

  if (params.start) {
    commands.push(
      header('Starting container'),
      `cd ~/infrastructure/composers/${env.composer}`,
      `sudo docker-compose start ${env.service}`
    )
  }

  if (params.log) {
    commands.push(
      header('Viewing logs'),
      `cd ~/infrastructure/composers/${env.composer}`,
      `sudo docker-compose logs -f ${env.service}`
    )
  }

  if (params.container || params.interact) {
    commands.push(
      header('Accessing container'),
      `cd ~/infrastructure/composers/${env.composer}`,
      `sudo docker-compose exec ${env.service} bash`
    )
  }

  if (params.bash) {
    commands.push('bash')
  }

  // adds extra commands
  // adds before commands
  if (afterCommands.length) {
    commands.push(header('After commands'), ...afterCommands)
  }

  if (params.debug) {	
    line()
    console.log(chalk.blue('Commands:'))
    commands.forEach(command => {
      if (command.startsWith('echo')) {
        line(); line()
        console.log(command.replace('echo ', '').replace(/"/g, ''))
        line()
      } else {
        console.log(`${chalk.grey('$')} ${command}`)
      }
    })
    line()

    return
  }

  const stream = [commands.length > 0 ? '-t' : '', `${env.user}@${env.host}`, commands.join(' && ')]

  await execa('ssh', stream.filter(command => !!command), { stdio: 'inherit' })
}