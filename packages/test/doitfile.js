const { useBash } = require('../@do-it/utils')

const git = useBash('git')
const npx = useBash('npx')
const echo = useBash('echo')['']

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
      title: 'Mist',
      commands: [echo('hello word'), git.remote(), git.branch()]
    },
    {
      key: 'serve',
      title: 'Lite Serve',
      commands: [npx.liteServer('--baseDir', '.')]
    }
  ]
}