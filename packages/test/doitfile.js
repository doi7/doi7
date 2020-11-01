const bash = (cli, context = []) => new Proxy({}, {
  get: (_, command) => (...args) => [cli, [...context, command, ...args]]
})

const git = bash('git')
const echo = bash('echo')['']

module.exports = {
  tasks: [
    {
      title: 'Show git status',
      key: 'my-task',
      commands: [
        echo('--- start ---'),
        async ({ execa }) => {
          await execa('echo', ['awesome doitfile'], { stdio: 'inherit' })
          await execa.apply(execa, [...echo('--- middle ---'), { stdio: 'inherit' } ])

          return git.status()
        },
        echo('--- end ---')
      ]
    },
    {
      key: 'mist',
      commands: [echo('hello word'), git.remote(), git.branch()]
    }
  ]
}