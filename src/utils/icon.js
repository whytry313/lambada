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
		return '../public/img/back.png';
	}
	if (type === 'folder') {
		return '../public/img/folder-black.png';
	} else {
		const extension = file.match(/\.[a-z0-9]+$/i);
		const ext = extension && extension[0] && extension[0].replace('.', '');

		return ext && iconsList.indexOf(ext) > -1 ? `../public/img/${ ext }.png` : '../public/img/uk.png';
	}
}


module.exports = { iconsList, getIcon };