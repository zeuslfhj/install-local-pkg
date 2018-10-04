# Install Local Packages

Installs local packages without symlink.

# Getting started

Install with

```
npm i -g install-local-pkg
```

You can use install-local-pkg from command line.

# Command line

Usage

```
# install the package has been linked by npm link
$ install-local-pkg install pkgName

# install the directory directly
$ install-local-pkg install dirPath --dir

# watch the changes of packages and sync them
$ install-local-pkg watch
# watch the changes of packages but ignore the change file name contains 'a.js'
$ install-local-pkg watch --ignore a.js

# sync packages
$ install-local-pkg copy
```

All installed package was saved in .local-depend.

Options:
- install
    + ```--dir```: input content is a directory
- copy
    + ```--includeNodeModules```: copy node_modules directory
- watch
    + ```--includeNodeModules```: watch and sync the node_modules directory
    + ```--ignore```: ignore regex for watching

# Why?
Why installing packages locally? Just because of React Native couldn't work with symlink.
