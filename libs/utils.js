const { execSync } = require('child_process');
const process = require('process');
const path = require('path');
const util = require('util');
const fs = require('fs');

const stat = util.promisify(fs.stat);
const readFile = util.promisify(fs.readFile);

function isWin() {
    return process.platform === 'win32';
}

function getGlobalNodeModulePath() {
    const prefix = execSync('npm config get prefix',
        { stdio: ['ignore', 'pipe', 'pipe'] }).toString().replace(/\n$/, '');
    let globalNodeModulePath;

    if (isWin()) {
        globalNodeModulePath = path.resolve(prefix, 'node_modules');
    } else {
        globalNodeModulePath = path.resolve(prefix, 'lib', 'node_modules');
    }

    return globalNodeModulePath;
}

function readJSONFromFile(filePath) {
    return stat(filePath).then((status) => {
        if (status.isFile()) {
            return filePath;
        }

        throw new Error(`${filePath} is not a file`);
    })
        .then(availFilePath => readFile(availFilePath))
        .then((jsonStr) => {
            if (jsonStr) {
                return JSON.parse(jsonStr);
            }

            return {};
        });
}

function replacePath(srcPath, srcRoot, targetRoot) {
    let relativePath = srcPath.replace(srcRoot, '');
    if (relativePath.charAt(0) === path.sep) {
        relativePath = relativePath.substring(1);
    }

    return path.resolve(targetRoot, relativePath);
}

module.exports = {
    isWin,
    replacePath,
    readJSONFromFile,
    getGlobalNodeModulePath,
};
