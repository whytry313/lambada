const basepath = process.env.OWD || process.env.PWD;
const { configPath } = require('./utils.js');
const fs = require('fs');
const config = require(configPath);

const { getAcceptedPath } = require('./utils.js');

String.prototype.sane = function() {
	return this.replace('$HOME', config.home);
};

const getStats = (path, root) => {
	const pathSafe = path.replace(config.home, '$HOME').replace('//', '/');
	const fsStats = fs.lstatSync(path.replace('//', '/').sane());

	return {
		creationDate: fsStats.ctime,
		lastModified: fsStats.mtime,
		type: fsStats.isDirectory() ? 'folder' : 'file',
		path: pathSafe,
		size: fsStats.size,
		root: getAcceptedPath(path) 
	};
};

module.exports = { getStats };