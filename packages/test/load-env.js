require('../@do-it/utils/src/index').loadEnv({
    mode: 'production',
    context: __dirname,
    local: true
});
console.log('TEST_A=', process.env.TEST_A);
console.log('TEST_B=', process.env.TEST_B);