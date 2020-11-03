 const useBash = (cli, context = [], endParams = []) => new Proxy({}, {
    get: (_, command) => (...params) => [cli,
        [...context, command, ...params, ...endParams].filter((v) => !!v),
    ],
});


module.exports = {
    useBash
}