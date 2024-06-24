const path = require('path');

module.exports = {
    entry: './actions/index.js',
    target: 'node',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'index.js',
        library: {
            type: 'commonjs2'
        }
    }
};
