makeChild("MenuTitleLabel", "RygameObject");

function MenuTitleLabel(x, y, font, label, layer, autoCenter) {
	let imgTitle = font.createTextImage(label.replace(/_/g, " "));
	const labelX = autoCenter ? x - imgTitle.canvas.width / 2 : x;
	RygameObject.call(this, labelX, y, 0, 0, null, layer, false, true, true);
	this.drawSurface = imgTitle;
}

makeChild("BitmapFontButton", "ImageButton");

BitmapFontButton.prototype.setText = function (newLabel) {
	this.normalSurface = this.fontLow.createTextImage(newLabel);
	this.brightenedSurface = this.fontHigh.createTextImage(newLabel);
};

function BitmapFontButton(x, y, label, fontLow, fontHigh, layer, runMethod, optionalArgs = null) {
	this.fontLow = fontLow;
	this.fontHigh = fontHigh;
	this.setText(label);
	ImageButton.call(this, x - this.normalSurface.canvas.width / 2, y, 0, this.normalSurface, this.brightenedSurface, layer, runMethod, optionalArgs);
}

makeChild("WindowPanel", "RygameObject");

WindowPanel.prototype.setFirstLine = function (font, text) {
	this.drawSurface.drawImage(this.originalSurface.canvas, 0, 0);
	let txtCanvas = font.createTextImage(text.replace(/_/g, " ")).canvas;
	const x = this.windowX + (this.windowWidth - txtCanvas.width) / 2;
	const y = this.windowY + this.windowHeight / 2 - 3 * txtCanvas.height / 4;
	this.drawSurface.drawImage(txtCanvas, x, y);
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
}
