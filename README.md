# Doi7

Doi7 is a task automation tool, it allows you to use the power of the JavaScript performing repetitive tasks in your workflow.

#### Install

```bash
$ npm i -g @doi7/cli
```

#### Usage

Create a `doitfile.js` or `doitfile.json`.

```js
module.exports = ({ params }) => {
  return {
    tasks: [
      { key: 'foo', title: 'Foo', commands: ['echo "Hello cli"']}
    ]
  }
}

```

The cli

```bash
$ doit --help
```

or you can run using the command npx: `npx @doi7/cli task`.

### API

#### Tasks

- `key`: identifies the task to be run.
   `doit task <key>`
- `title`: task title, it will be visible in the task list.
   `doit task`
- `commands`: list of commands to be executed in sequence.
   `[Function, Array, String]`

You can run parallel commands using functions like a command.

```
[
  async ({ execa }) => {
    const commands = [execa(...), execa(...), ...]
  
    await Promise.all(commands)
  }
]
```

### Example

#### Tasks

The commands are executed by [execa](https://www.npmjs.com/package/execa).

```js
// doitfile.js

// bash helper
// how about making the command more friendly?
const useBash = (cli, context = []) => new Proxy({}, {
  get: (_, command) => (...args) => [cli, [...context, command, ...args]]
})


const git = useBash('git')
const composer = useBash('docker-compose',  [
  '-f', '../docker-compose.yml',
  '--project-directory', '../project-x/y'
])
const doit = useBash('doit')


module.expors = ({ params }) => ({
    tasks: [
      {
        key: 'wip'
        title: 'Send work in progress',
        commands: [
          git.status(),                       // useBash
          ['echo', [':: commit ::']],         // array 
          'git add .',                        // string
          () => git.commit(`chore: ${params.m || 'updates'}`), // function
          async ({ execa }) => {
             // do something
             await execa(...git.push())
          }
        ]
      },
      {
        key: 'db',
        title: 'Data base',
        commands: [
          composer.up('-d',  'mongodb')
        ]
      },
      {
        key: 'up',
        title: 'Up container',
        commands: [
          composer.up('-d',  params.c)
        ]
      },
      {
        key: 'project:x',
        title: 'Start project xxx',
        commands: [
          doit.task('db'),
          doit.task('up', 'xxx'),
        ]
      }
    ]
})
```

Usage:

```bash
# Choose a task
$ doit task

# or just exec the task
$ doit task wip -m "just an example"
```
