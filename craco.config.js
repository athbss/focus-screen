const webpack = require('webpack');

module.exports = {
    webpack: {
        configure: {
            resolve: {
                fallback: {
                    "buffer": require.resolve("buffer/"),
                    "url": require.resolve("url/"),
                    "https": require.resolve("https-browserify"),
                    "http": require.resolve("stream-http"),
                    "querystring": require.resolve("querystring-es3"),
                    "stream": require.resolve("stream-browserify"),
                    "util": require.resolve("util/"),
                    "assert": require.resolve("assert/"),
                    "crypto": require.resolve("crypto-browserify"),
                    "zlib": require.resolve("browserify-zlib"),
                    "os": require.resolve("os-browserify/browser"),
                    "path": require.resolve("path-browserify"),
                    "fs": false,
                    "net": false,
                    "tls": false,
                    "child_process": false,
                    "http2": false
                }
            },
            plugins: [
                new webpack.ProvidePlugin({
                    process: 'process/browser',
                    Buffer: ['buffer', 'Buffer']
                })
            ]
        }
    }
};