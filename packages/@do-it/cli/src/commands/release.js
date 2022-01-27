const ora = require('ora')
const path = require('path')
const execa = require('execa')
const chalk = require('chalk')
const semver = require('semver')
const inquirer = require('inquirer')
const deepmerge = require('deepmerge')
const { notify, PackageManager, genChangelog, sequence } = require('@do-it/utils')

const defaultConfig = {
  release: {
    docker: {
      file: 'Dockerfile',
      context: {},
      tag: null
    }
  }
}

module.exports = async (params, config) => {
  const { release } = deepmerge(defaultConfig, config)
  const cwd = process.cwd()
  const packageManager = new PackageManager(cwd)
  const packageData = packageManager.ready()
  const bumps = ['patch', 'minor', 'major', 'prerelease']
  const versions = {}
  
  console.log(`Current version from ${chalk.bold(packageData.name)}: ${chalk.blue(packageData.version)}`)

  bumps.forEach(b => { versions[b] = semver.inc(packageData.version, b) })

  const bumpsChoices = bumps.map(b => ({ name: `${b} (${versions[b]})`, value: b }))
  const { bump, customVersion } = await inquirer.prompt([
    {
      name: 'bump',
      message: 'Select release type:',
      type: 'list',
      choices: [
        ...bumpsChoices,
        { name: 'custom', value: 'custom' }
      ]
    },
    {
      name: 'customVersion',
      message: 'Input version:',
      type: 'input',
      when: answers => answers.bump === 'custom'
    }
  ])

  const version = customVersion || versions[bump]
  const { yes } = await inquirer.prompt([{
    name: 'yes',
    message: `Confirm releasing ${version}`,
    type: 'confirm'
  }])

  if (yes) {
    // save package
    const start = Date.now()
    const spinner = ora()

    const commands = async (header, tasks) => {
      if (!params.verbose) {
        spinner.start()
        spinner.text = header
      } else {
        console.log(`:: ${chalk.magenta(header)} ::`)
      }

      await sequence(tasks, task => task())

      if (!params.verbose) {
        spinner.succeed()
      } else {
        console.log()
      }
    }

    try {
      packageManager.save({ version })

      if (params.changelog) {
        await commands(`Generating changelog`, [
          x => genChangelog(version, path.join(cwd, 'CHANGELOG.md'))
        ])
      }

      if (params.commit) {
        await commands(`Committing version`, [
          x => execa('git', ['add', '-A'], params.verbose && { stdio: 'inherit' }),
          x => execa('git', ['commit', '-m', `chore(changelog): release ${version} ${params.skipCi ? '[skip ci]' : ''}`], params.verbose && { stdio: 'inherit' })
        ])
      }

      if (params.push) {
        await commands(`Pushing version v${version}`, [
          x => execa('git', ['tag', `v${version}`], params.verbose && { stdio: 'inherit' }),
          x => execa('git', ['push', 'origin', '--tags'], params.verbose && { stdio: 'inherit' }),
          x => execa('git', ['push'], params.verbose && { stdio: 'inherit' })
        ])
      }

      if (params.docker) {
        const docker = release.docker
        let tag = docker.tag || params.docker
        const context = docker.context[params.docker]

        if (context) {
          tag = context.tag || tag
        }
        
        tag = tag.replace('{version}', version)
        
        await commands(`Building image ${tag}`, [
          x => execa('docker', ['build', '-f', path.join(cwd, docker.file), '-t', tag, '.'], params.verbose && { stdio: 'inherit' })
        ])
        await commands(`Uploading ${tag} to docker hub`, [
          x => execa('docker', ['build', '-f', path.join(cwd, docker.file), '-t', tag, '.'], params.verbose && { stdio: 'inherit' })
        ])
      }

      // generate version
      notify({ title: 'Releasing', message: `Releasing version v${version}` })
      spinner.text = `Releasing version v${version}`
      spinner.succeed()
    } catch (err) {
      spinner.text = err.stderr
      spinner.fail()
    }
    const end = Date.now() - start
    const ms = end / 1000
    console.info(`Execution time: ${chalk.grey((ms > 60 ? ms / 60 : ms).toFixed(2))}${chalk.grey(ms > 60 ? 'm' : 's')}`)
  }
}
