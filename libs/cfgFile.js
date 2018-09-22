const fs = require('fs');
const path = require('path');
const util = require('util');
const utils = require('./utils');
const pkgUtils = require('./pkgUtils');

const cwd = process.cwd();
const CONFIG_FILE = '.local-depend';

function getCurrentPath() {
    return cwd;
}

function getCfgFilePath() {
    return path.resolve(getCurrentPath(), CONFIG_FILE);
}

function getCfg() {
    const jsonFilePath = getCfgFilePath();
    if (jsonFilePath && fs.existsSync(jsonFilePath)) {
        return utils.readJSONFromFile(jsonFilePath);
    }

    return Promise.resolve({});
}

function getLocalPackages() {
    return getCfg().then((packages) => {
        const availPkgs = Object.keys(packages).reduce((existedPkgs, pkgName) => {
            const dirPath = packages[pkgName];
            if (fs.existsSync(dirPath)) {
                existedPkgs[pkgName] = dirPath;
            }

            return existedPkgs;
        }, {});

        return availPkgs;
    });
}

function writeToFile(jsonData) {
    const jsonFilePath = getCfgFilePath();

    return new Promise((resolve, reject) => {
        try {
            const writeStream = fs.createWriteStream(jsonFilePath);
            writeStream.on('finish', () => {
                resolve();
            });

            writeStream.write(jsonData);
            writeStream.end();
        } catch (e) {
            reject(e);
        }
    });
}

function getPkgName(pkgPath) {
    return pkgUtils.parsePackageJSON(pkgPath)
        .then(pkgJSON => pkgJSON.name);
}

function writeDependency(pkgPath, pkgName) {
    let promise;

    if (!pkgName) {
        promise = getPkgName(pkgPath);
    } else {
        promise = Promise.resolve(pkgName);
    }

    return promise.then(tmpPkgName => getCfg().then((cfg) => {
        cfg[tmpPkgName] = pkgPath;

        console.log(`write file ${JSON.stringify(cfg)}`);
        return writeToFile(JSON.stringify(cfg));
    }));
}

module.exports = {
    writeDependency,
    getLocalPackages,
    getCurrentPath,
};
