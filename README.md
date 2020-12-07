# DoIt Cli

- Generates favicons;
- Generates changelog;
- Automates tasks;

#### Install

```bash
$ yarn add @do-it/cli
```

#### Usage

Create the `doitfile.js`

```js
// Return Object or Function
module.exports = ({ params }) => {
  return {
    // ... options
  }
}

```

The cli

```bash
$ doit --help
```

##### Example

##### Tasks


```js
// doitfile.js

// bash helper
const bash = (cli, context = []) => new Proxy({}, {
  get: (_, command) => (...args) => [cli, [...context, command, ...args]]
})

const git = bash('git', ['-C', '../app'])

module.expors = {
    tasks: [
      {
        key: 'wip'
        title: 'Send work in progress',
        commands: [
          git.status(),
          git.add(),
          git.commit('chore: updates'),
          git.push()
        ]
      }
    ]
}
```

Usage:

```bash
# Choose a task
$ doit task 

# or just exec the task
$ doit task wip
```
