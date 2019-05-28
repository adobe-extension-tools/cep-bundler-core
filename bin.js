#!/usr/bin/env node

var path = require('path')
var argv = require('yargs')
    .option('in', {
        alias: 'i',
        describe: 'Input folder',
        default: '.'
    })
    .option('out', {
        alias: 'o',
        describe: 'Output folder',
        default: './dist'
    })
    .option('dev', {
        alias: 'd',
        describe: 'Enable development mode',
        default: false
    })
    .option('dev-port', {
        alias: 'p',
        describe: 'Set development server port',
        default: 8080
    })
    .option('dev-host', {
        alias: 'h',
        describe: 'Set development server host',
        default: 'localhost'
    })
    .help()
    .argv

var bundler = require('./dist/cep-bundler-core.cjs')

bundler.compile({
    out: argv.out,
    devPort: argv.devPort,
    devHost: argv.devHost,
    root: argv.in === '.' || argv.in === './' ? process.cwd() : argv.in,
    htmlFilename: 'index.html',
    isDev: argv.dev
})
