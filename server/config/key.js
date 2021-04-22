if(process.env.NODE_ENV === 'production') {
    // production 모드.
    module.exports = require('./prod');
} else {
    // develop 모드.
    module.exports = require('./dev');
}