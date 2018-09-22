const path = require('path');
const chalk = require('chalk');
const chokidar = require('chokidar');
const utils = require('./utils');
const cfgFile = require('./cfgFile');
const watchActions = require('./watchActions');

function getIgnoreReg(includeNodeModules) {
    if (!includeNodeModules) {
        return /\/node_modules(\/|$)/;
    }

    return null;
}

function doAction(event, srcPath, targetPath) {
    if (watchActions[event]) {
        console.log(`doaction ${chalk.red(srcPath)} targetPath ${chalk.magenta(targetPath)}`);

        watchActions[event](srcPath, targetPath);
    } else {
        console.warn(`${chalk.keyword('event')} is not support`);
    }
}

function outputErrorInfo(err) {
    console.error(chalk.red(`watch file with error ${err.message}`), err);
}

function watchModule(argv) {
    const { includeNodeModules } = argv;

    const promise = cfgFile.getLocalPackages();
    promise.then((packages) => {
        Object.keys(packages).forEach((pkgName) => {
            const dirPath = packages[pkgName];

            const watcher = chokidar.watch(dirPath, {
                ignored: getIgnoreReg(includeNodeModules),
            }).on('ready', () => {
                console.log(chalk.yellow(`watcher has started for ${dirPath}`));

                watcher.on('all', (event, changedPath) => {
                    if (event === 'error') {
                        outputErrorInfo(changedPath);
                        return;
                    }

                    const curDirectory = cfgFile.getCurrentPath();
                    const targetPath = path.resolve(curDirectory, 'node_modules', pkgName);
                    const newPath = utils.replacePath(changedPath, dirPath, targetPath);
                    doAction(event, changedPath, newPath);
                });
            });

            console.log(chalk.yellow(`start watch path ${dirPath}`));
        });
    });
}

function watchBuilder(yargs) {
    yargs.option('includeNodeModules', {
        describe: 'watch the file change in node_modules folder',
        type: 'boolean',
        default: true,
    });
}

module.exports = {
    watchBuilder,
    watchModule,
};
