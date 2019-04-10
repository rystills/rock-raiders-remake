BitmapFont.prototype.createTextImage = function (text) {
	if (text === undefined || text === null || text.length < 1) {
		// empty text requested, context with width 0 is not allowed, but 1 with alpha is close enough
		const placeholder = createContext(1, 1, false);
		const imgData = placeholder.createImageData(1, this.charHeight);
		for (let y = 0; y < this.charHeight; y++) {
			imgData.data[y * 4 + 3] = 0;
		}
		placeholder.putImageData(imgData, 0, 0);
		return placeholder;
	}
	text = text.replace(/_/g, " ");
	let width = 0;
	for (let c = 0; c < text.length; c++) {
		const letter = text.charAt(c);
		const letterImg = this.letters[letter];
		if (letterImg) {
			width += letterImg.width;
		} else {
			console.error("Letter '" + letter + "' not found in charset! Ignoring it");
		}
	}
	const surface = createContext(width, this.charHeight, false);
	let x = 0;
	for (let c = 0; c < text.length; c++) {
		const letterImg = this.letters[text.charAt(c)];
		if (letterImg) {
			surface.drawImage(letterImg, x, 0, letterImg.width, letterImg.height);
			x += letterImg.width;
		} // issue alread reported above
	}
	return surface;
};

function BitmapFont(fontImage, cols = 10, rows = 19) { // font images always consist of 10 columns and 19 rows with last row empty
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

	const maxCharWidth = fontImage.width / cols;
	this.charHeight = fontImage.height / rows;

	function getActualCharacterWidth(imgData) {
		for (let y = 0; y < fontImage.height / rows; y++) { // find non-empty row first
			let rowPixelIndex = y * 4 * fontImage.width;
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
		const imgData = fontImage.getImageData((i % 10) * maxCharWidth, Math.floor(i / 10) * this.charHeight, maxCharWidth, this.charHeight);
		let actualWidth = getActualCharacterWidth(imgData);
		let context;
		if (actualWidth > 0) {
			context = createContext(actualWidth, this.charHeight, false);
			context.putImageData(imgData, 0, 0);
		} else {
			context = createDummyImage(maxCharWidth, this.charHeight);
		}
		this.letters[chars[i]] = context.canvas;
	}
}

DummyFont.prototype.createTextImage = function () {
	return this.charImg;
};

function DummyFont() {
	this.charImg = createDummyImage(80, 20);
}
