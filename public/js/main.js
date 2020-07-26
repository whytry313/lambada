const Container = document.getElementById('container');

function humanFileSize(bytes, si=false, dp=1) {
	const thresh = si ? 1000 : 1024;

	if (Math.abs(bytes) < thresh) {
		return bytes + ' B';
	}

	const units = si 
		? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'] 
		: ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
	let u = -1;
	const r = 10**dp;

	do {
		bytes /= thresh;
		++u;
	} while (Math.round(Math.abs(bytes) * r) / r >= thresh && u < units.length - 1);


	return bytes.toFixed(dp) + ' ' + units[u];
}

const iconsList = [
	"3gp", "7z", "ae", "ai", "apk", "asf", "avi", "bak",
	"bmp", "cdr", "css", "csv", "divx", "dll", "doc", "docx",
	"dwg", "dw", "eps", "exe", "flv", "fw", "gif", "gz", "html",
	"ico", "iso", "jar", "jpg", "js", "mov", "mp3", "mp4", "mpeg",
	"pdf", "php", "png", "ppt", "psd", "ps", "rar", "svg", "swf", "sys",
	"gz", "tar", "tiff", "txt", "wav", "zip",
];

const getIcon = (file, type) => {
	if (file === 'back') {
		return '/img/back.png';
	}
	if (type === 'folder') {
		return '/img/folder-black.png';
	} else {
		const extension = file.match(/\.[a-z0-9]+$/i);
		const ext = extension && extension[0] && extension[0].replace('.', '');
		console.log(ext);
		return ext && iconsList.indexOf(ext) > -1 ? `img/${ ext }.png` : '/img/uk.png';
	}
}


const goTo = (path) => {
	fetch('/q', {
		headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
		method: "POST",
		body: JSON.stringify({ path: path })
	}).then(res => res.json()).then((data) => {
		if (data && data.list) {
			displayList(data.list, path === '/');
		}
	});
}


const displayList = (list, isRoot) => {
	let html = `<table class="main-table"><tbody>`;
	const folders = list.filter(el => el.type === 'folder');
	const files = list.filter(el => el.type !== 'folder');


	if (!isRoot) {
		const _root = (list[0].root || '/').replace(/\/$/, '');
		const raw_path = (list[0].path || '//');
		const parentPath = raw_path.replace(_root, '').replace('//', '/').replace(/\/$/, '').split('/');
		parentPath.pop();
		parentPath.pop();

		html += `<tr class="list-entry return-el" onClick="goTo('${ parentPath.length > 0 ? `${ _root }/${ parentPath.join('/') }` : '/' }')">
			<td style="width: 42px;"><div class="icontype" style="background-image: url(${ getIcon('back') })"></div></td>
			<td class="td-name"><div class="nolink">..</div></td>
			<td class="td-size"></td>
			<td class="last-mod">${ parentPath }</td>
		</tr>`;
	}


	[
		...folders.sort(),
		...files.sort()
	].map((el) => {
		const path = el.path.replace(/[\\\/]$/, '').split(/[\\\/]/);
		const name = path[ path.length - 1 ];
		const lastModified = el.lastModified ? new Date(el.lastModified).toLocaleString() : '';

		const isFolder = el.type !== 'file';

		if (isFolder) {		
			html += `<tr class="list-entry" onClick="goTo('${ el.path }')">
				<td style="width: 42px;"><div class="icontype" style="background-image: url(${ getIcon(name, el.type) })"></div></td>
				<td class="td-name"><div class="nolink">${ name }</div></td>
				<td class="td-size"></td>
				<td class="last-mod">${ lastModified }</td>
			</tr>`;
		} else {
			html += `
			<tr class="list-entry">
				<td style="width: 42px;"><div class="icontype" style="background-image: url(${ getIcon(name, el.type) })"></div></td>
				<td class="td-name">
					<a href="/download/${ encodeURIComponent(el.path) }" class="list-entry" onClick="goTo('${ el.path }')">
						${ name }
					</a>
				</td>
				<td class="td-size">${ humanFileSize(el.size) }</td>
				<td class="last-mod">${ lastModified }</td>
			</tr>`;
		}
	});
	html += '</tbody></table>';
	Container.innerHTML = html;
}

goTo('/');

