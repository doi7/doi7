# DoIt cli

- Automates tasks;
- Generates favicons;
- Generates changelog;

DoIt cli is a task automation tool, it allows you to use the power of the java script to perform repetitive tasks asks in your workflow. It is still a work in progress, so we will still have many improvements.

#### Install

```bash
$ yarn add @do-it/cli
```

#### Usage

Create a `doitfile.js` or `doitfile.json`.

```js
module.exports = ({ params }) => {
  return {
    tasks: [...]
  }
}

```

The cli

```bash
$ doit --help
```

or you can run using the command npx: `npx doit task`.

##### Example

##### Tasks

The commands are executed by [execa](https://www.npmjs.com/package/execa).

```js
// doitfile.js

// bash helper
const useBash = (cli, context = []) => new Proxy({}, {
  get: (_, command) => (...args) => [cli, [...context, command, ...args]]
})

const git = useBash('git')

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
$ doit task wip
```
