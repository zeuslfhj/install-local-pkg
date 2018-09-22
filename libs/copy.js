const path = require('path');
const chalk = require('chalk');
const { getCurrentPath, getLocalPackages } = require('./cfgFile');
const { copyEntireDirectory } = require('./fsUtils');

function copyModule(argv) {
    const { includeNodeModules } = argv;
    let ignoreReg = null;

    if (!includeNodeModules) {
        ignoreReg = /node_modules/;
    }

    const promise = getLocalPackages();
    promise.then((packages) => {
        Object.keys(packages).forEach((pkgName) => {
            const pkgPath = packages[pkgName];
            const targetPath = path.resolve(getCurrentPath(), 'node_modules', pkgName);

            console.log(chalk.green(`copy file from ${pkgPath} to ${targetPath}`));
            copyEntireDirectory(pkgPath, targetPath, ignoreReg)
                .catch((e) => {
                    console.error(chalk.red(`copy path failed ${e.message}`), e.stack);
                });
        });
    });
}

function copyBuilder(yargs) {
    yargs.option('includeNodeModules', {
        describe: 'copy the files include node_modules folder',
        type: 'boolean',
        default: true,
    });
}

module.exports = {
    copyBuilder,
    copyModule,
};
