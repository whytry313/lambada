const fs = require('fs');
const { app, BrowserWindow } = require('electron');
const { configPath } = require('./src/utils/utils.js');
const basepath = process.env.OWD || process.env.PWD;

const home = app.getPath('home');

if (home) {
	let config = {
		"port": 4500,
		"restricted": false,
		"password": null,
		"paths": [],
	};

	if (fs.existsSync(configPath)) {
		config = require(configPath);
	}


	config.home = home;
	config.basePath = basepath;
	fs.writeFileSync(configPath, JSON.stringify(config, null, 4));
}

function createWindow () {
	// Cree la fenetre du navigateur.
	const win = new BrowserWindow({
		width: 800,
		height: 600,
		webPreferences: { nodeIntegration: true }
	});

	// et charger le fichier index.html de l'application.
	win.loadFile('src/index.html');

	// Ouvre les DevTools.
	win = null
};

app.whenReady().then(createWindow)
app.on('window-all-closed', () => {
	process.platform !== 'darwin' ? app.quit() : process.exit();
});


app.on('activate', () => {
	win === null && createWindow()
});