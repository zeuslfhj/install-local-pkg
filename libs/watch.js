const path = require('path');
const chalk = require('chalk');
const chokidar = require('chokidar');
const utils = require('./utils');
const cfgFile = require('./cfgFile');
const watchActions = require('./watchActions');
const { getGitIgnore } = require('./fsUtils');

/**
 * 获取ignore的自定义模板
 * @param {bool}   includeNodeModules - 是否需要监听node_modules中的文件
 * @param {string} customIgnore       - 自定义ignore模板
 *
 * @return {Regex[]}
 */
function getIgnoreReg(includeNodeModules, customIgnore) {
    const ignores = [getGitIgnore()];

    if (!includeNodeModules) {
        ignores.push(/\/node_modules(\/|$)/);
    }

    if (customIgnore) {
        ignores.push(customIgnore);
    }

    return ignores;
}

/**
 * 创建自定义ignore内容
 * @param  {string} ignoreStr ignore匹配模板
 * @return {Promsie}
 */
function createCustomIgnore(ignoreStr) {
    if (!ignoreStr) {
        return Promise.resolve();
    }

    try {
        const reg = new RegExp(ignoreStr);
        return Promise.resolve(reg);
    } catch (e) {
        throw new Error(`create ignore regex failed with error ${e.message}`, e);
    }
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

/**
 * 运行watch模式
 * @param  {[type]} argv [description]
 * @return {[type]}      [description]
 */
function watchModule(argv) {
    const { includeNodeModules, ignore } = argv;
    const regPromise = createCustomIgnore(ignore);
    const promise = cfgFile.getLocalPackages();

    Promise.all([promise, regPromise])
        .then(([packages, cusReg]) => {
            Object.keys(packages).forEach((pkgName) => {
                const dirPath = packages[pkgName];

                const watcher = chokidar.watch(dirPath, {
                    ignored: getIgnoreReg(includeNodeModules, cusReg),
                }).on('ready', () => {
                    console.log(chalk.yellow(`watcher has started for ${dirPath}`));
                    console.log(chalk.yellow('if no files watched, the command would end immediately'));

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
        })
        .catch((e) => {
            console.error(chalk.red(`invoke watch command failed, because of ${e.message}`), e);
        });
}

function watchBuilder(yargs) {
    yargs.option('includeNodeModules', {
        describe: 'watch the file change in node_modules folder',
        type: 'boolean',
        default: true,
    }).option('ignore', {
        describe: 'set the ignore files for watching',
        type: 'string',
    });
}

module.exports = {
    watchBuilder,
    watchModule,
};
