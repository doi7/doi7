const bash = (cli, context = []) => new Proxy({}, {
  get: (_, command) => (...args) => [cli, [...context, command, ...args]]
})

const git = bash('git')

module.exports = {
  tasks: [
    {
      title: 'Show git status',
      key: 'my-task',
      commands: [
        () => {
          return git.status()
        }
      ]
    }
  ]
}