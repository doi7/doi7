const chalk = require('chalk')
const execa = require('execa')
const deepmerge = require('deepmerge')
const { sequence, isFunction } = require('@do-it/utils')

const defaultConfig = {
  tasks: {
    commands: []
  }
}

module.exports = async (params, config, env) => {
  const log = console.log
  const { tasks } = deepmerge(defaultConfig, config)

  try {
    await sequence(tasks.commands, command =>
      isFunction(command)
        ? command({ execa, params, config, env, output: { stdio: 'inherit' } })
        : execa.apply(execa, (command.push({ stdio: 'inherit' }), command))
    )
  } catch (err) {
    log()
    log(chalk.gray(`$ ${err.command}`))
    log()
    log(chalk.red(err.message))
  }
}