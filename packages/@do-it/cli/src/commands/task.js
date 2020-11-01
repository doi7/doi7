const chalk = require('chalk')
const execa = require('execa')
const deepmerge = require('deepmerge')
const inquirer = require('inquirer')
const flattenDepth = require('lodash.flattendepth')
const { sequence, isFunction } = require('@do-it/utils')

const defaultConfig = {
  tasks: []
}

module.exports = async (params, config, env) => {
  let task
  const output = { stdio: 'inherit' }
  const log = console.log
  const { tasks } = deepmerge(defaultConfig, config)
  const choices = tasks.map((task, index) => ({ name: task.title, value: index}))

  try {
    if (!params.command) {
      const { selectedTask } = await inquirer.prompt([
        {
          name: 'selectedTask',
          message: 'Select a task',
          type: 'list',
          choices,
        }
      ])
      task = tasks[selectedTask]
    } else {
      task = tasks.find(task => task.key === params.command)
    }

    log('\n', chalk.cyanBright(task.title || 'Task'))

    await sequence((task && task.commands) || [], async command => {
      const result = isFunction(command) 
        ? await command({execa, inquirer, task, params, config, env, output })
        : command

      if (params.verbose) {
        log('\n', chalk.gray(`$ ${flattenDepth(result).join(' ')}`), '\n')
      }

      return execa.apply(execa, (result.push(output), result))
    })
  } catch (err) {
    log('\n', chalk.gray(`$ ${err.command}`))
    log('\n', chalk.red(err.message))
  }
}
