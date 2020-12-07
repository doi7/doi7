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

The commands are executed by [execa](https://www.npmjs.com/package/execa).


```js
// doitfile.js

// bash helper
const useBash = (cli, context = []) => new Proxy({}, {
  get: (_, command) => (...args) => [cli, [...context, command, ...args]]
})

const git = useBash('git', ['-C', '../app'])

module.expors = {
    tasks: [
      {
        key: 'wip'
        title: 'Send work in progress',
        commands: [
          git.status(), // ['git', ['status']]
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
