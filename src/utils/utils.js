const basepath = process.env.OWD || process.env.PWD;
const configPath = basepath+'/.lambada.config.json';

const isAcceptedPath = (textPath) => {
	const acceptedFoldersList = require(configPath).paths;
	let isAllowed = false;
	acceptedFoldersList.map((path) => {
		const sanitized = path.replace(/\\\/$/, '').replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
		if (textPath.match( sanitized )) {
			isAllowed = true;
		}
	});
	return isAllowed;
};

const getAcceptedPath = (textPath) => {
	const acceptedFoldersList = require(configPath).paths;
	let rootPath = false;
	acceptedFoldersList.map((path) => {
		const sanitized = path.replace(/\\\/$/, '').replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
		if (textPath.match( sanitized )) {
			rootPath = path;
		}
	});
	return rootPath;
};

module.exports = {
	isAcceptedPath,
	getAcceptedPath,
	configPath,
};