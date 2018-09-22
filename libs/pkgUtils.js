const fs = require('fs');
const path = require('path');
const util = require('util');
const { readJSONFromFile } = require('./utils');

const stat = util.promisify(fs.stat);

module.exports = {
    getPackageJSONPath(dir) {
        const jsonFilePath = path.resolve(dir, 'package.json');
        const isExisted = fs.existsSync(jsonFilePath);

        if (isExisted) {
            return jsonFilePath;
        }

        return null;
    },
    parsePackageJSON(pkgPath) {
        return stat(pkgPath).then((status) => {
            if (status.isDirectory() || status.isSymbolicLink()) {
                return pkgPath;
            }

            throw new Error(`${pkgPath} is not a directory or symbolic link`);
        }).then((validedPkgPath) => {
            const jsonPath = this.getPackageJSONPath(validedPkgPath);

            return readJSONFromFile(jsonPath);
        });
    },
};
