const fs = require('fs');
var path = require('path');
var mime = require('mime');
const express = require('express');
const basepath = process.env.OWD || process.env.PWD;
const Header = document.getElementById('header');
const bodyParser = require('body-parser');

const { configPath } = require('../utils/utils.js');
const { getStats } = require('../utils/stats.js');
const { isAcceptedPath, getAcceptedPath, acceptedFoldersList } = require('../utils/utils.js');


const os = require('os');
const ifaces = os.networkInterfaces();

const getIP = () => {
	const iFaces = [];

	Object.keys(ifaces).forEach(function (ifname) {
		var alias = 0;

		ifaces[ifname].forEach(function (iface) {
			if ('IPv4' !== iface.family || iface.internal !== false) { return; }

			if (alias >= 1) {
				iFaces.push(iface.address);
			} else {
				iFaces.push(iface.address);
			}
			++alias;
		});
	});
	return iFaces.filter(el => el.match(/^192\.168\./));
};



String.prototype.sane = function() {
	return this.replace('$HOME', require(configPath).home);
};


class Server {
	constructor() {
		const express = require('express');

		this.app = express();
		this.config = require(configPath);
		this.port = this.config.port;
		this.server = null;


		this.start = this.start.bind(this);
		this.restart = this.restart.bind(this);
		this.changePort = this.changePort.bind(this);

		this.acceptedFoldersList = this.config.paths;
		this.acceptedFolders = [  ];

		// init
		this.start();
	}



	start() {
		const publicPath = path.resolve(__dirname, '../../public');
		this.acceptedFolders = this.acceptedFoldersList.map((path) => getStats(path));

		this.app.use(express.static(publicPath));
		this.app.use( bodyParser.json() );       // to support JSON-encoded bodies
		this.app.use(bodyParser.urlencoded({ extended: true })); 

		this.app.get('/download/*', (req, res) => {
			const PATH = decodeURIComponent(req.url).replace(/^\/download\//, '');
			const stat = fs.lstatSync(PATH.sane());
			if (isAcceptedPath(PATH) && stat.isFile()) {
				// res.sendFile( path.sane() );
				const file = PATH.sane();

				const filename = path.basename(file);
				const mimetype = mime.lookup(file);

				res.setHeader('Content-disposition', 'attachment; filename=' + filename);
				res.setHeader('Content-type', mimetype);
				res.setHeader('Content-Length', stat.size);

				const filestream = fs.createReadStream(file);
				filestream.pipe(res);
			} else {
				res.send({ error: 'Unallowed or Unknwon file.' });
			}
		});

		this.app.post('/q', (req, res) => {
			if (req.body && req.body.path && req.body.path !== '/') {
				if (isAcceptedPath(req.body.path)) {
					const isDirectory = fs.lstatSync(req.body.path.sane()).isDirectory();
					if (isDirectory) {
						res.send({
							list: fs.readdirSync(req.body.path.sane()).map((file) => {
								return getStats(req.body.path + '/' + file);
							})
						});
					} else {
						res.send({ error: 'Wrong method' });
					}
				} else {
					res.send({ error: '503 - Unallowed' });
				}
			} else {
				res.send({ list: this.acceptedFolders });
			}
		});

		this.server = this.app.listen(this.port, () => {
			console.log(`Example app listening at http://localhost:${this.port}`)
			Header.innerHTML = `
			<div class="row">
				<div class="half" style="text-align: left;">
					<div class="myList">
						${ this.config.paths.map((el) => {
							return `<div class="list-el" onClick="window._navigator.gotoParent('${ el }')">${ el }</div>`;
						}).join('') }
					</div>
				</div>
				<div class="half">
					<span>Serveur lancé sur le port:
						<b style="font-size: 1.2em">${ this.port }</b>
					</span><br/>
					<div class="btn" onClick="window._server.restart();">Redémarrer le seveur</div>
					<br/>
					<br/>
					Diffusion sur addresse(s): <br/>${ getIP().map((ip) => {
						const addr = 'http://'+ip+':'+this.config.port+'/'
						return `<b>${ addr }</b><br/>`;
					}).join('') }
					<p style="font-size: 0.8em">
						Si vous n'arrivez pas à vous connecter vérifiez
						<br/>
						que le port ${ this.config.port } soit autorisé sur vote pare-feu
					</p>
				</div>
			</div>
			`;
		});
	}

	restart() {
		Header.innerHTML = '<span><i>Restarting....</i></span>';
		this.server.close(() => {
			this.config = require(configPath);
			this.acceptedFoldersList = this.config.paths;
			this.start();
		});
	}

	changePort(port) {
		this.config.port = port;
		fs.writeFileSync(configPath, JSON.stringify(config, null, 4));
		this.config = require(configPath);
		this.restert();
	}
}

window._server = new Server();
module.exports = window._server;