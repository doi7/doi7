const chalk = require('chalk')
const execa = require('execa')
const deepmerge = require('deepmerge')
const inquirer = require('inquirer')
const flattenDepth = require('lodash.flattendepth')
const { sequence, isFunction, isString } = require('@do-it/utils')

const defaultConfig = {
  tasks: []
}

module.exports = async (params, config, env) => {
  let task
  const output = { stdio: 'inherit' }
  const log = console.log
  const { tasks } = deepmerge(defaultConfig, config)
  const choices = tasks.map((task, index) => (task.separator
    ? new inquirer.Separator()
    : { name: task.title, value: index, disabled: task.disabled }
  ))

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
      let terms = (isFunction(command) 
        ? await command({ execa, inquirer, task, params, config, env, output })
        : command) || []

      if (isString(terms)) {
        terms = terms.split('&&').filter(v => !!v)
        terms = terms.map(term => {
          const line = term.match(/(['"].*?"|[^'"\s]+)+(?=\s*|\s*$)/g).filter(v => !!v)
          const [arg0, ...args] = line

          return [arg0, args]
        }).reduce((a, t) => ([...a, ...t]), [])
      }

      if (params.verbose) {
        log('\n', chalk.gray(`$ ${flattenDepth(terms).join(' ')}`), '\n')
      }

      return execa.apply(execa, (terms.push(output), terms))
    })
  } catch (err) {
    log('\n', chalk.gray(`$ ${err.command}`))
    log('\n', chalk.red(err.message))
  }
}
