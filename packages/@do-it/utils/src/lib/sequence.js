module.exports = (tasks, fn) => {
  return tasks.reduce((promise, task) => {
    return promise.then(() => fn(task))
  }, Promise.resolve())
}
