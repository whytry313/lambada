const { acceptedFoldersList } = require('../utils/utils.js');
const Container = document.getElementById('container');
const { getStats } = require('../utils/stats.js');
const { getIcon } = require('../utils/icon.js');
const { configPath } = require('../utils/utils.js');
const basepath = process.env.OWD || process.env.PWD;
const fs = require('fs');

String.prototype.sane = function() {
	return this.replace('$HOME', require(configPath).home);
};

class Navigator {
	constructor() {
		this.folder = require(configPath).home;
		this.gotoPath = this.gotoPath.bind(this);
		this.config = require(configPath);
		this.hideHidden = true;
		this.gotoPath();
		this.gotoPath = this.gotoPath.bind(this);
		this.updatePath = this.updatePath.bind(this);
		this.gotoParent = this.gotoParent.bind(this);
	}


	getParent(path) {
		return path.replace(/[^\/]+\/?$/, '');
	}


	gotoParent(path) {
		this.gotoPath(this.getParent(path));
	}


	updatePath(el, path) {
		let set = this.config.paths;
		if (el.checked) {
			const set = Array.from(new Set([ ...this.config.paths, path ]));
			this.config.paths = set;
		} else {
			delete set[ set.indexOf(path) ];
			this.config.paths = set.filter(Boolean);
		}

		fs.writeFileSync(configPath, JSON.stringify(this.config, null, 4));
		this.config = require(configPath);
		this.gotoPath();
		window._server.restart();
	}


	gotoPath(newFolder) {
		if (newFolder) {
			this.folder = (newFolder+'/').replace(/[\/]{2,}/g, '/').replace('$HOME', this.config.home);
		}

		const folder = this.folder;
		let files = fs.readdirSync(folder).filter(el => el !== '.' && el !== '..');

		if (this.hideHidden) {
			files = files.filter(el => el.match(/^[^\.]/));
		}
		files = files.map(el => getStats(folder+'/'+el));

		const onlyFolders = files.filter(el => el.type === 'folder');
		const onlyFiles = files.filter(el => el.type !== 'folder');

		onlyFolders.sort();
		onlyFiles.sort();

		let html = ``;
		html += `<div id="path">${ this.folder }</div>`;
		html += `<table class="main-table">`;


		if (this.getParent(this.folder).split('/').length > 1 && this.getParent(this.folder) !== this.folder) {
			html += `
				<tr class="list-entry">
					<td></td>
					<td style="width: 42px;">
						<div class="icontype" style="background-image: url(${ getIcon('back') })"></div>
					</td>
					<td class="td-goback" onClick="window._navigator.gotoPath('${ this.getParent(this.folder) }')">.. 	(Retour)</td>
					<td></td>
					<td></td>
				</tr>
			`;
		}


		[ ...onlyFolders, ...onlyFiles ].map((file) => {
			const path = [ '/', ...folder.split('/'), ...file.path.split('/') ].join('/');
			let matches = null;
			const isChecked = require(configPath).paths.map((checkedpath) => {

				const sanitized = checkedpath.replace(/\/$/, '').replace(/\\\/$/, '').replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
				if (path.match(sanitized)) {
					matches = checkedpath;
					return true;
				}
				return null;

			}).filter(Boolean).length > 0;

			let isCurrent = false;
			if (matches) {
				isCurrent = file.path.sane().replace(/\/$/, '') === matches.sane().replace(/\/$/, '');
			}

			html += `
			<tr class="list-entry">
				<td>
					${
						file.type === 'folder' ?
						`<input type="checkbox"
							${ isChecked ? 'checked="checked"' : '' }
							${ isChecked && !isCurrent ? 'disabled="disabled"' : '' }
							onChange="window._navigator.updatePath(this, '${ file.path }')"/>`: ''
					}
				</td>
				<td style="width: 42px;">
					<div class="icontype" style="background-image: url(${ getIcon(path, file.type) })"></div>
				</td>
				<td class="td-name" onClick="window._navigator.gotoPath('${ file.path }')">
					${ path.match(/[^\/]+\/?$/)[0] }
				</td>
				<td></td>
				<td></td>
			</tr>
			`;
		});
		html += `</table>`;

		Container.innerHTML = html;
	}
}

window._navigator = new Navigator();
module.exports = window._navigator;