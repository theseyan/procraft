const path = require('path');

// Whether it is development mode
const DEVMODE = true;

module.exports = {
    entry: './App.js',
    output: {
        globalObject: 'this',
        filename: 'procraft.admin.js',
        path: path.resolve(__dirname, '../static'),
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                use: [{
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env']
                    }
                }],
                exclude: /node_modules/
            },
            {
                test: /\.ejs$/,
                use: {
                  loader: 'ejs-compiled-loader',
                  options: {
                    htmlmin: true,
                    htmlminOptions: {
                      removeComments: true
                    }
                  }
                }
              }
        ]
    },
    mode: DEVMODE===true ? 'development' : 'production',
    devtool: DEVMODE===true ? 'eval-source-map' : false
};