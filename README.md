# DoIt cli

DoIt cli is a task automation tool, it allows you to use the power of the java script to perform repetitive tasks asks in your workflow. It is still a work in progress.

- Automates tasks;
- Generates favicons;
- Generates changelog;

#### Install

```bash
$ yarn add @do-it/cli
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

or you can run using the command npx: `npx doit task`.

### API

#### Tasks

- `key`: allows you to run the task from the command line.
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
const useBash = (cli, context = []) => new Proxy({}, {
  get: (_, command) => (...args) => [cli, [...context, command, ...args]]
})

const git = useBash('git')
// this helper lets you do something more friendly like
// git.commit('-m', '-a', 'message')

module.expors = ({ params }) => ({
    tasks: [
      {
        key: 'wip'
        title: '📋 Send work in progress',
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
        ...
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
