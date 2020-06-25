const MomentLocalesPlugin = require("moment-locales-webpack-plugin");

const path = require("path");
const include = path.resolve(__dirname, "resources/js");
module.exports = {
    mode: "production",
    entry: {
        bundle: "./resources/js/alpinejs-table-bundle.js",
        core: "./resources/js/alpinejs-table-core.js",
    },
    output: {
        library: "AlpinejsTable",
        libraryTarget: "umd",
        path: path.resolve(__dirname, "resources/views"),
        filename: "[name].js",
    },
    optimization: {
        minimize: true,
    },
    plugins: [
        new MomentLocalesPlugin({
            localesToKeep: ["en"],
        }),
    ],
    module: {
        rules: [
            {
                test: /\.blade\.php$/,
                include: [include],
                use: {
                    loader: "babel-loader",
                    options: {
                        presets: ["@babel/preset-env"],
                    },
                },
            },
        ],
    },
    performance: { hints: false },
};
