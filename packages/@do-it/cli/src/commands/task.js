const chalk = require('chalk')
const execa = require('execa')
const deepmerge = require('deepmerge')
const inquirer = require('inquirer')
const { sequence, isFunction } = require('@do-it/utils')

const defaultConfig = {
  tasks: []
}

module.exports = async (params, config, env) => {
  let task
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
        ? command({ execa, inquirer, task, params, config, env, output: { stdio: 'inherit' } })
        : execa.apply(execa, (command.push({ stdio: 'inherit' }), command))
    )
  } catch (err) {
    log()
    log(chalk.gray(`$ ${err.command}`))
    log()
    log(chalk.red(err.message))
  }
}