const fs = require('fs');
const path = require('path');
const util = require('util');
const chalk = require('chalk');
const shelljs = require('shelljs');
const utils = require('./utils');

const stat = util.promisify(fs.lstat);
const readdir = util.promisify(fs.readdir);
const mkdir = util.promisify(fs.mkdir);
const copyFile = util.promisify(fs.copyFile);

function mkdirFull(fullPath) {
    shelljs.mkdir('-p', fullPath);
}

function getIgnorePatterns(ignoreReg) {
    if (!ignoreReg) {
        return null;
    }

    const ignorePatterns = [];
    if (!(ignoreReg instanceof Array)) {
        ignorePatterns.push(ignoreReg);
    } else {
        ignorePatterns.push(...ignoreReg);
    }

    return ignorePatterns;
}

function testFile(patterns, filePath) {
    if (!patterns) {
        return false;
    }

    for (let i = 0; i < patterns.length; i += 1) {
        const pattern = patterns[i];

        if (typeof pattern === 'string' && pattern === filePath) {
            return true;
        }

        if (typeof pattern.test === 'function') {
            return pattern.test(filePath);
        }
    }

    return false;
}

function copyEntireDirectory(srcPath, targetPath, ignoreReg) {
    let promise;
    // 文件夹已经存在则直接拷贝内容
    if (fs.existsSync(targetPath)) {
        promise = Promise.resolve();
    } else {
        promise = mkdir(targetPath);
    }

    const ignorePatterns = getIgnorePatterns(ignoreReg);

    return promise.then(() => readdir(srcPath))
        .then(files => files.filter(file => !testFile(ignorePatterns, file)))
        .then((files) => {
            return Promise.all(files.map((file) => {
                const filePath = path.resolve(srcPath, file);

                return stat(filePath).then((status) => {
                    const newFilePath = path.resolve(targetPath, file);
                    console.log(chalk.greenBright(`copy ${chalk.red(filePath)} to ${chalk.magenta(newFilePath)}`));
                    if (status.isDirectory() || status.isSymbolicLink()) {
                        return copyEntireDirectory(filePath, newFilePath, ignoreReg);
                    }

                    if (status.isFile()) {
                        return copyFile(filePath, newFilePath);
                    }

                    return Promise.resolve();
                });
            }));
        });
}

function getGitIgnore() {
    return /\.git/;
}

module.exports = {
    mkdirFull,
    getGitIgnore,
    copyEntireDirectory,
};
