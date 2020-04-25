# DoIt Cli

- Generates favicons;
- Generates changelog;
- Automates tasks;

#### Install

```bash
$ yarn add @do-it/cli
```

#### Usage

Create the `doitfile.js``

```js
// Return Object or Function
module.exports = async () {
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

module.exports = async () {
  return {
    // ... options
  }
}

```

```js
// bash helper
const bash = (cli, context = []) => new Proxy({}, {
  get: (_, command) => (...args) => [cli, [...context, command, ...args]]
})

const dockerCompose = bash('docker-compose',  [
  '-f', '../laradock/docker-compose.yml',
  '--project-directory', '../laradock'
])
const git = bash('git', ['-C', '../app'])

module.expors = {
    taks: {
        commands: [
            // start project
            dockerCompose.up('-d', 'nginx', 'postgres', 'workspace'),
            // access workspace
            dockerCompose.exec('workspace', 'bash', '-c', 'cd runclub-app'),
        ]
    }
}
```
