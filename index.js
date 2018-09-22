#!/usr/bin/env node

const yargs = require('yargs');
const { installModule, installBuilder } = require('./libs/install');
const { watchModule, watchBuilder } = require('./libs/watch');
const { copyModule, copyBuilder } = require('./libs/copy');

yargs.usage('$0 <cmd> [args]')
    .command('install <pkgName> [dir]', 'add package to local dependence', installBuilder, installModule)
    .command('watch [includeNodeModules]', 'watch the change in packages', watchBuilder, watchModule)
    .command('copy [includeNodeModules]', 'copy the entire package', copyBuilder, copyModule)
    .help()
    .argv;
