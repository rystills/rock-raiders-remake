BitmapFont.prototype.createTextImage = function (text) {
	let width = 0;
	for (let c = 0; c < text.length; c++) {
		width += this.letters[text.charAt(c)].width;
	}
	const surface = createContext(width, this.charHeight, false);
	let x = 0;
	for (let c = 0; c < text.length; c++) {
		const letterImg = this.letters[text.charAt(c)];
		surface.drawImage(letterImg, x, 0, letterImg.width, letterImg.height);
		x += letterImg.width;
	}
	return surface;
};

function BitmapFont(fontImageName, cols = 10, rows = 19) { // font images always consist of 10 columns and 19 rows with last row empty
	// actually chars are font dependent and have to be externalized in future
	// maybe CP850 was used... not sure, doesn't fit...
	const chars = [" ", "!", "\"", "#", "$", "%", "⌵", "`", "(", ")",
		"*", "+", ",", "-", ".", "/", "0", "1", "2", "3",
		"4", "5", "6", "7", "8", "9", ":", ";", "<", "=",
		">", "?", "@", "A", "B", "C", "D", "E", "F", "G",
		"H", "I", "J", "K", "L", "M", "N", "O", "P", "Q",
		"R", "S", "T", "U", "V", "W", "X", "Y", "Z", "[",
		"\\", "]", "^", "_", "'", "a", "b", "c", "d", "e",
		"f", "g", "h", "i", "j", "k", "l", "m", "n", "o",
		"p", "q", "r", "s", "t", "u", "v", "w", "x", "y",
		"z", "Ä", "Å", "Á", "À", "Â", "Ã", "Ą", "ä", "å",
		"á", "à", "â", "ã", "ą", "Ë", "E̊", "É", "È", "É",
		"Ę", "ë", "e̊", "é", "è", "e̊", "ę̊", "", "", "",
		"", "", "", "", "", "Ö", "", "", "", "",
		"ö", "", "", "", "", "Ü", "", "", "", "ü",
		"", "", "", "", "", "", "", "", "", "",
		"", "", "", "", "", "", "", "", "", "",
		"", "", "", "ß", "", "", "", "Ñ", "", "ñ",
		""
	]; // TODO complete this character list

	const imgFont = GameManager.getImage(fontImageName);
	const maxCharWidth = imgFont.width / cols;
	this.charHeight = imgFont.height / rows;

	function getActualCharacterWidth(imgData) {
		for (let y = 0; y < imgFont.height / rows; y++) { // find non-empty row first
			let rowPixelIndex = y * 4 * imgFont.width;
			if (imgData.data[rowPixelIndex] !== 255 && imgData.data[rowPixelIndex + 2] !== 255) { // red/blue pixels indicate end of character
				for (let x = 0; x < maxCharWidth; x++) {
					let colPixelIndex = x * 4;
					if (imgData.data[colPixelIndex] === 255 || imgData.data[colPixelIndex + 2] === 255) { // red/blue pixels indicate end of character
						return x;
					}
				}
				return maxCharWidth;
			}
		}
		return 0;
	}

	this.letters = [];
	for (let i = 0; i < chars.length; i++) {
		const imgData = imgFont.getImageData((i % 10) * maxCharWidth, Math.floor(i / 10) * this.charHeight, maxCharWidth, this.charHeight);
		let actualWidth = getActualCharacterWidth(imgData);
		let context;
		if (actualWidth > 0) {
			context = createContext(actualWidth, this.charHeight, false);
			context.putImageData(imgData, 0, 0);
			this.letters[chars[i]] = context.canvas;
		} else {
			// TODO use placeholder image to improve stability
		}
	}
}
