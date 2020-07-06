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
    .help()
    .argv

var bundler = require('./dist/cep-bundler-core.cjs')

bundler.compile({
    out: argv.out,
    root: argv.in === '.' || argv.in === './' ? process.cwd() : argv.in,
    htmlFilename: 'index.html',
    isDev: argv.dev
})
