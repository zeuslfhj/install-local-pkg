const fs = require('fs');
const path = require('path');
const util = require('util');
const chalk = require('chalk');
const shelljs = require('shelljs');
const { copyEntireDirectory, mkdirFull } = require('./fsUtils');

const stat = util.promisify(fs.stat);
const rmdir = util.promisify(fs.rmdir);
const unlink = util.promisify(fs.unlink);
const copyFile = util.promisify(fs.copyFile);

function addDir(srcPath, targetPath) {
    stat(srcPath).then((status) => {
        if (status.isDirectory()) {
            mkdirFull(targetPath);
            return Promise.resolve();
        }

        if (status.isSymbolicLink()) {
            return copyEntireDirectory(srcPath, targetPath);
        }

        return Promise.resolve();
    });
}

function unlinkDir(src, targetPath) {
    console.log('unlink directory');

    if (fs.existsSync(targetPath)) {
        rmdir(targetPath);
    }
}

function copySingleFile(src, targetPath) {
    const dirName = path.dirname(targetPath);

    if (!fs.existsSync(dirName)) {
        mkdirFull(dirName);
    }

    return copyFile(src, targetPath).catch((e) => {
        console.error(`
            copy file from ${chalk.red(src)} to ${chalk.magenta(targetPath)} failed
            with error ${chalk.yellow(e.message)}
        `, e);
    });
}

function unlinkAction(src, targetPath) {
    console.log('unlink file:' + targetPath);

    if (fs.existsSync(targetPath)) {
        shelljs.rm(targetPath);
    }

    return Promise.resolve();
}

module.exports = {
    addDir,
    unlinkDir,
    add: copySingleFile,
    change: copySingleFile,
    unlink: unlinkAction,
};
