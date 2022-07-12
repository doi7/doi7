const kebabCase = require('lodash.kebabcase') 
 
 const useBash = (cli, context = [], endParams = []) => new Proxy({}, {
    get: (_, command) => (...params) => [cli,
        [...context, kebabCase(command), ...params, ...endParams].filter((v) => !!v),
    ],
});


module.exports = {
    useBash
}