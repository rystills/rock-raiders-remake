makeChild("MenuTitleLabel", "RygameObject");

function MenuTitleLabel(x, y, font, label, layer) {
	const imgTitle = font.createTextImage(label);
	RygameObject.call(this, x - imgTitle.canvas.width / 2, y, 0, 0, null, layer, false, true, true);
	this.drawSurface = imgTitle;
}

makeChild("BitmapFontButton", "ImageButton");

BitmapFontButton.prototype.setText = function (newLabel) {
	this.normalSurface = this.fontLow.createTextImage(newLabel);
	this.brightenedSurface = this.fontHigh.createTextImage(newLabel);
};

function BitmapFontButton(x, y, label, fontLow, fontHigh, layer, runMethod, optionalArgs = null, autoCenter = true) {
	this.fontLow = fontLow;
	this.fontHigh = fontHigh;
	this.setText(label);
	ImageButton.call(this, x, y, 0, this.normalSurface, this.brightenedSurface, layer, runMethod, optionalArgs);
	this.x = autoCenter ? x - this.normalSurface.canvas.width / 2 : x;
}

makeChild("WindowPanel", "RygameObject");

WindowPanel.prototype.setFirstLine = function (font, text) {
	if (text) {
		this.firstLine = text;
		this.redraw(font);
	}
};

WindowPanel.prototype.setSecondLine = function (font, text) {
	if (text) {
		this.secondLine = text;
		this.redraw(font);
	}
};

WindowPanel.prototype.redraw = function (font) {
	this.drawSurface.drawImage(this.originalSurface.canvas, 0, 0);
	let txtFirstCanvas = font.createTextImage(this.firstLine).canvas;
	const x1 = this.windowX + (this.windowWidth - txtFirstCanvas.width) / 2;
	const y1 = this.windowY + this.windowHeight / 2 - 3 * txtFirstCanvas.height / 4;
	this.drawSurface.drawImage(txtFirstCanvas, x1, y1);
	let txtSecondCanvas = font.createTextImage(this.secondLine).canvas;
	const x2 = this.windowX + (this.windowWidth - txtSecondCanvas.width) / 2;
	const y2 = this.windowY + this.windowHeight / 2 - 3 * txtFirstCanvas.height / 4 + txtFirstCanvas.height;
	this.drawSurface.drawImage(txtSecondCanvas, x2, y2);
};

function WindowPanel(x, y, drawDepth, drawSurface, layer, winX, winY, winWidth, winHeight) {
	RygameObject.call(this, x, y, 0, drawDepth, null, layer, false, true, true);
	this.originalSurface = drawSurface;
	this.drawSurface = createContext(this.originalSurface.canvas.width, this.originalSurface.canvas.height, false);
	this.drawSurface.drawImage(this.originalSurface.canvas, 0, 0);
	this.rect = new Rect(this.drawSurface.canvas.width, this.drawSurface.canvas.height);
	this.windowX = winX;
	this.windowY = winY;
	this.windowWidth = winWidth;
	this.windowHeight = winHeight;
	this.firstLine = "";
	this.secondLine = "";
}
