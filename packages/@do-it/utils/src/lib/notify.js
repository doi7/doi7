const path = require('path')
const notifier = require('node-notifier')

module.exports = ({ title, message }) => {
  notifier.notify({
    title,
    message,
    icon: path.resolve(__dirname, '../assets/done.png')
  })
}