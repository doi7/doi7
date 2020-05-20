const chalk = require('chalk')
const execa = require('execa')
const deepmerge = require('deepmerge')
const inquirer = require('inquirer')
const { sequence, isFunction } = require('@do-it/utils')

const defaultConfig = {
  tasks: []
}

function normalizeCommand ({ command, task, params, config, env, output }) {
  const payload = command({ execa, inquirer, task, params, config, env, output })
  const args = (payload.push(output), payload)

  return Array.isArray(payload) 
    ? execa.apply(execa, args) 
    : payload
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

    await sequence((task && task.commands) || [], command =>
      isFunction(command)
        ? normalizeCommand({ command, task, params, config, env, output })
        : execa.apply(execa, (command.push(output), command))
    )
  } catch (err) {
    log()
    log(chalk.gray(`$ ${err.command}`))
    log()
    log(chalk.red(err.message))
  }
}
