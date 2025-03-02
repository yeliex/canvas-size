// Dependencies
// =============================================================================
const path = require('path');

import { babel } from '@rollup/plugin-babel';
import eslint    from '@rollup/plugin-eslint';
import mergician from 'mergician';
import pkg       from './package.json';
import terser    from '@rollup/plugin-terser';


// Settings
// =============================================================================
// Copyright
const currentYear  = (new Date()).getFullYear();
const releaseYear  = 2015;

// Output
const entryFile  = path.resolve(__dirname, 'src', 'index.js');
const outputFile = path.resolve(__dirname, 'dist', `${pkg.name}.js`);
const outputName = 'canvasSize';

// Banner
const bannerData = [
    `${pkg.name}`,
    `v${pkg.version}`,
    `${pkg.homepage}`,
    `(c) ${releaseYear}${currentYear === releaseYear ? '' : '-' + currentYear} ${pkg.author}`,
    `${pkg.license} license`
];

// Plugins
const pluginSettings = {
    eslint: {
        exclude       : ['node_modules/**', './package.json'],
        throwOnWarning: false,
        throwOnError  : true
    },
    babel: {
        // See .babelrc
        babelHelpers: 'bundled'
    },
    terser: {
        beautify: {
            compress: false,
            mangle  : false,
            output: {
                beautify: true,
                comments: /(?:^!|@(?:license|preserve))/
            }
        },
        minify: {
            compress: true,
            mangle  : true,
            output  : {
                comments: new RegExp(pkg.name)
            }
        }
    }
};


// Config
// =============================================================================
// Base
const config = {
    input : entryFile,
    output: {
        file     : outputFile,
        name     : outputName,
        banner   : `/*!\n * ${ bannerData.join('\n * ') }\n */`,
        sourcemap: true
    },
    plugins: [
        eslint(pluginSettings.eslint),
        babel(pluginSettings.babel)
    ],
    watch: {
        clearScreen: false
    }
};

// Formats
// -----------------------------------------------------------------------------
// ES Module
const esm = mergician({}, config, {
    output: {
        file  : config.output.file.replace(/\.js$/, '.esm.js'),
        format: 'esm'
    },
    plugins: config.plugins.concat([
        terser(pluginSettings.terser.beautify)
    ])
});

// ES Module (Minified)
const esmMinified = mergician({}, config, {
    output: {
        file  : esm.output.file.replace(/\.js$/, '.min.js'),
        format: esm.output.format
    },
    plugins: config.plugins.concat([
        terser(pluginSettings.terser.minify)
    ])
});

// UMD
const umd = mergician({}, config, {
    output: {
        format: 'umd'
    },
    plugins: config.plugins.concat([
        terser(pluginSettings.terser.beautify)
    ])
});

// UMD (Minified)
const umdMinified = mergician({}, config, {
    output: {
        file  : umd.output.file.replace(/\.js$/, '.min.js'),
        format: umd.output.format
    },
    plugins: config.plugins.concat([
        terser(pluginSettings.terser.minify)
    ])
});


// Exports
// =============================================================================
export default [
    esm,
    esmMinified,
    umd,
    umdMinified
];
