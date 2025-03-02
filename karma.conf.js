/* eslint-env node */

// Dependencies
// =============================================================================
const fs           = require('fs');
const pkg          = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
const { execSync } = require('child_process');


// Variables
// =============================================================================
const files = {
    test: './tests/**/*.test.js'
};
const gitInfo = {
    branch   : execSync('git rev-parse --abbrev-ref HEAD').toString().trim(),
    commitMsg: execSync('git log -1 --pretty=%B').toString().trim(),
    isClean  : Boolean(execSync('[[ -n $(git status -s) ]] || echo "clean"').toString().trim()),
    isDirty  : Boolean(execSync('[[ -z $(git status -s) ]] || echo "dirty"').toString().trim())
};


// Settings
// =============================================================================
const settings = {
    files: [
        files.test
    ],
    preprocessors: {
        [files.test]: ['eslint', 'webpack', 'sourcemap']
    },
    frameworks: ['mocha', 'chai'],
    reporters : ['mocha', 'coverage-istanbul', 'BrowserStack'],
    webpack: {
        mode  : 'development',
        module: {
            rules: [
                {
                    test   : /\.js$/,
                    exclude: [/node_modules/],
                    use    : [
                        {
                            loader : 'babel-loader',
                            options: {
                                // See .babelrc
                                plugins: [
                                    ['istanbul', { include: 'src/*' }]
                                ]
                            },
                        }
                    ]
                }
            ]
        }
    },
    webpackMiddleware: {
        // https://webpack.js.org/configuration/stats/
        stats: 'minimal'
    },
    // Code coverage
    // https://github.com/mattlewis92/karma-coverage-istanbul-reporter
    coverageIstanbulReporter: {
        reports                : ['lcovonly', 'text-summary'],
        combineBrowserReports  : true,
        fixWebpackSourcePaths  : true,
        skipFilesWithNoCoverage: true
    },
    mochaReporter: {
        // https://www.npmjs.com/package/karma-mocha-reporter
        output: 'autowatch'
    },
    autoWatch  : false,
    colors     : true,
    concurrency: Infinity,
    port       : 9876,
    singleRun  : true,
    // browserDisconnectTimeout  : 1000*10, // default 2000
    // browserDisconnectTolerance: 1,       // default 0
    // browserNoActivityTimeout  : 1000*20, // default 10000
    // captureTimeout            : 1000*60, // default 60000
    client: {
        // Prevent browser messages from appearing in terminal
        captureConsole: false,
        mocha: {
            timeout: 1000*5 // default 2000
        }
    }
};


// Export
// =============================================================================
module.exports = function(config) {
    const isRemote = Boolean(process.argv.indexOf('--remote') > -1);

    // Remote test
    if (isRemote) {
        // Browsers
        // https://www.browserstack.com/automate/capabilities
        settings.customLaunchers = {
            bs_chrome: {
                base           : 'BrowserStack',
                browser        : 'Chrome',
                os             : 'Windows',
                os_version     : '10'
            },
            bs_firefox: {
                base           : 'BrowserStack',
                browser        : 'Firefox',
                os             : 'Windows',
                os_version     : '10'
            },
            bs_safari: {
                base           : 'BrowserStack',
                browser        : 'Safari',
                os             : 'OS X',
                os_version     : 'Catalina'
            }
        };
        settings.browsers = Object.keys(settings.customLaunchers);
        settings.reporters.push('BrowserStack');
        settings.browserStack = {
            username : process.env.BROWSERSTACK_USERNAME,
            accessKey: process.env.BROWSERSTACK_ACCESS_KEY,
            build    : [
                `${process.env.GITHUB_RUN_ID ? 'GitHub' : 'Local'}:${gitInfo.branch} -`,
                gitInfo.isClean ? gitInfo.commitMsg : 'Uncommitted changes',
                `@ ${new Date().toLocaleString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric', timeZoneName: 'short', hour12: true })}`
            ].join(' '),
            project  : pkg.name,
            video    : false
        };
    }
    // Local
    else {
        settings.browsers = ['ChromeHeadless'];
        settings.webpack.devtool = 'inline-source-map';
        settings.coverageIstanbulReporter.reports.push('html');

        // eslint-disable-next-line
        console.log([
            '============================================================\n',
            `KARMA: localhost:${settings.port}/debug.html\n`,
            '============================================================\n'
        ].join(''));
    }

    // Logging: LOG_DISABLE, LOG_ERROR, LOG_WARN, LOG_INFO, LOG_DEBUG
    settings.logLevel = config.LOG_INFO;
    config.set(settings);
};
