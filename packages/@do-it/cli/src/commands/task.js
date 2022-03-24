const chalk = require('chalk')
const execa = require('execa')
const Table = require('cli-table3')
const deepmerge = require('deepmerge')
const inquirer = require('inquirer')
const flattenDepth = require('lodash.flattendepth')
const { sequence, isFunction, isString } = require('@do-it/utils')

const defaultConfig = {
  tasks: []
}

const listAsTable = (tasks) => {
  const leftMargin = '    ';
  const tableConfig = {
    head: ['Name', 'Title', 'Description'],
    chars: {
      'left': leftMargin.concat('│'),
      'top-left': leftMargin.concat('┌'),
      'bottom-left': leftMargin.concat('└'),
      'mid': '',
      'left-mid': '',
      'mid-mid': '',
      'right-mid': '',
    },
  };
  const table = new Table(tableConfig);

  tasks.forEach(task => {
    table.push([
      chalk.green(task.key),
      chalk.cyan(task.title),
      chalk.gray(task.description || ''),
    ]);
  });

  return table.toString();
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
    if (params.list) {
      console.log(listAsTable(tasks))
      return
    }


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

    if (!task) {
      throw new Error(`Task ${chalk.yellow(params.command)} not found!`)
    }

    log('\n', chalk.cyanBright(task.title || 'Task'), '\n')

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
      // remove error Command failed with exit code 1
      return execa.apply(execa, (terms.push(output), terms))
    })
  } catch (err) {
    log('\t\n', chalk.redBright('Command failed!'), '\n')
    log('\t\n', err.message, '\n')
  }
}
