const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const utils = require('./utils');
const cfgFile = require('./cfgFile');
const pkgUtils = require('./pkgUtils');
const { copyEntireDirectory, getGitIgnore } = require('./fsUtils');

function validPkgFiles(pkgDirPath) {
    return pkgUtils.parsePackageJSON(pkgDirPath)
        .then((packageJson) => {
            if (typeof packageJson.name !== 'string') {
                throw new Error('you should set an name in package.json');
            }

            return pkgDirPath;
        });
}

function installDir(relativePath) {
    const dirPath = path.resolve(relativePath);

    if (!fs.existsSync(dirPath)) {
        return Promise.reject(new Error('directory is not existed, plz check the path'));
    }

    return validPkgFiles(dirPath)
        .then(pkgDirPath => Promise.all([
            Promise.resolve(pkgDirPath),
            cfgFile.getPkgName(pkgDirPath),
        ]))
        .then(([pkgDirPath, pkgName]) => Promise.all([
            Promise.resolve(pkgDirPath),
            Promise.resolve(pkgName),
            cfgFile.writeDependency(pkgDirPath, pkgName),
        ]))
        .catch((e) => {
            console.error(chalk.red(`validate package failed, because of ${e.message}`), e);
            throw new Error('package files is not valied, please check the package.json or main file');
        });
}

function installPkg(pkgName) {
    const globalNodeModulePath = utils.getGlobalNodeModulePath();
    const pkgPath = path.resolve(globalNodeModulePath, pkgName);

    if (!fs.existsSync(pkgPath)) {
        return Promise.reject(new Error('package is not existed, plz use "npm link pkgName" first, or install with directory'));
    }

    return validPkgFiles(pkgPath)
        .then(pkgDirPath => Promise.all([
            Promise.resolve(pkgDirPath),
            Promise.resolve(pkgName),
            cfgFile.writeDependency(pkgDirPath, pkgName),
        ]))
        .catch((e) => {
            console.error(chalk.red(`validate package failed, because of ${e.message}`), e);
            throw new Error('package files is not valied, please check the package.json or main file');
        });
}

function installModule(argv) {
    const name = argv.pkgName;
    if (!name) {
        throw new Error('you should input a name of package');
    }
    console.log(`name ${name} isDir ${argv.dir}`);

    let ret;
    if (argv.dir) {
        ret = installDir(name);
    } else {
        ret = installPkg(name);
    }

    ret.then(([pkgDirPath, pkgName]) => {
        const targetPath = cfgFile.getTargetPkgPath(pkgName);

        return copyEntireDirectory(pkgDirPath, targetPath, getGitIgnore());
    }).catch((err) => {
        console.error(chalk.red(err.message), err);
    });
}

function installBuilder(yargs) {
    yargs.positional('pkgName', {
        describe: 'package name for install',
        type: 'string',
    }).option('dir', {
        describe: 'whether the name is a directory or not',
        type: 'boolean',
        default: false,
    }).option('includeNodeModules', {
        describe: 'copy the files include node_modules folder',
        type: 'boolean',
        default: true,
    });
}

module.exports = { installModule, installBuilder };
