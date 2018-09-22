const fs = require('fs');
const path = require('path');
const util = require('util');
const chalk = require('chalk');
const shelljs = require('shelljs');
const utils = require('./utils');

const stat = util.promisify(fs.stat);
const readdir = util.promisify(fs.readdir);
const mkdir = util.promisify(fs.mkdir);
const copyFile = util.promisify(fs.copyFile);

function mkdirFull(fullPath) {
    shelljs.mkdir('-p', fullPath);
}

function copyEntireDirectory(srcPath, targetPath, ignoreReg) {
    let promise;
    // 文件夹已经存在则直接拷贝内容
    if (fs.existsSync(targetPath)) {
        promise = Promise.resolve();
    } else {
        promise = mkdir(targetPath);
    }

    return promise.then(() => readdir(srcPath)).then((files) => {
        return Promise.all(files.map((file) => {
            const filePath = path.resolve(srcPath, file);

            return stat(filePath).then((status) => {
                if (ignoreReg && ignoreReg.test(file)) {
                    return Promise.resolve();
                }

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

module.exports = {
    mkdirFull,
    copyEntireDirectory,
};
