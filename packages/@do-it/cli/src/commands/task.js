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

    log('\n', chalk.cyanBright(`🚀 ${task.title} 🚀`), '\n')
    await sequence((task && task.commands) || [], async command => {
      const result = isFunction(command) 
        ? await command({execa, inquirer, task, params, config, env, output })
        : command

      return execa.apply(execa, (result.push(output), result))
    })
  } catch (err) {
    log()
    log(chalk.gray(`$ ${err.command}`))
    log()
    log(chalk.red(err.message))
  }
}
