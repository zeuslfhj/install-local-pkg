const chalk = require('chalk');
const { getTargetPkgPath, getLocalPackages } = require('./cfgFile');
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
            const targetPath = getTargetPkgPath(pkgName);

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
