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

makeChild("Slider", "RygameObject");

Slider.prototype.redrawState = function () {
	this.drawSurface.drawImage(this.imgOffBar, 0, 0);
	this.drawSurface.drawImage(this.imgRightCap, this.drawSurface.width - this.imgRightCap.width, 0);
	this.drawSurface.save();
	this.drawSurface.beginPath();
	this.drawSurface.rect(0, 0, this.imgOffBar.width * this.value / this.maxValue, this.imgOffBar.height);
	this.drawSurface.clip();
	this.drawSurface.drawImage(this.imgOnBar, 0, 0);
	this.drawSurface.restore();
	this.drawSurface.drawImage(this.imgLeftCap, 0, 0);
};

function Slider(x, y, xOff, yOff, imgLabelLow, imgLabelHigh, minVal, maxVal, value, layer, callback) {
	// maybe make these dynamic someday, currently not necessary
	this.imgOffBar = GameManager.getImage("Interface/FrontEnd/Vol_OffBar.bmp").canvas;
	this.imgOnBar = GameManager.getImage("Interface/FrontEnd/Vol_OnBar.bmp").canvas;
	this.imgLeftCap = GameManager.getImage("Interface/FrontEnd/Vol_Leftcap.bmp").canvas;
	this.imgRightCap = GameManager.getImage("Interface/FrontEnd/Vol_Rightcap.bmp").canvas;
	const imgMinus = GameManager.getImage("Interface/FrontEnd/Vol_Minus.bmp");
	const imgMinusHi = GameManager.getImage("Interface/FrontEnd/Vol_MinusHi.bmp");
	const imgPlus = GameManager.getImage("Interface/FrontEnd/Vol_Plus.bmp");
	const imgPlusHi = GameManager.getImage("Interface/FrontEnd/Vol_PlusHi.bmp");
	const objLabel = new RygameObject(x, y, 0, 0, null, layer, false, true, true);
	objLabel.drawSurface = imgLabelLow;
	objLabel.rect.width = objLabel.drawSurface.width;
	objLabel.rect.height = objLabel.drawSurface.height;
	const that = this;
	objLabel.update = function () {
		if (!objLabel.visible) {
			return;
		}
		const mouseInRect = GameManager.mousePos.x >= x && GameManager.mousePos.y >= y
			&& GameManager.mousePos.x < x + xOff + that.imgOffBar.width + that.imgRightCap.width + imgPlus.width
			&& GameManager.mousePos.y < y + Math.max(imgLabelLow.height, that.imgOffBar.height, imgPlus.height);
		if (mouseInRect) {
			objLabel.drawSurface = imgLabelHigh;
		} else {
			objLabel.drawSurface = imgLabelLow;
		}
	};
	const barX = x + xOff;
	const barY = y + yOff;
	RygameObject.call(this, barX, barY, 0, 0, null, layer, false, true, true);
	this.drawSurface = createContext(this.imgOffBar.width + this.imgRightCap.width, this.imgOffBar.height, false);
	this.maxValue = maxVal;
	this.value = Math.max(Math.min(Math.floor(value), maxVal), minVal);
	this.redrawState();
	this.rect.width = this.drawSurface.width;
	this.rect.height = this.drawSurface.height;
	new ImageButton(barX - imgMinus.width, barY, 0, imgMinus, imgMinusHi, layer, function () {
		if (that.value > minVal) {
			that.value--;
			that.redrawState();
			if (callback) {
				callback(that.value / that.maxValue);
			}
		}
	});
	new ImageButton(barX + this.rect.width, barY, 0, imgPlus, imgPlusHi, layer, function () {
		if (that.value < maxVal) {
			that.value++;
			that.redrawState();
			if (callback) {
				callback(that.value / that.maxValue);
			}
		}
	});
}

makeChild("ToggleButton", "RygameObject");

ToggleButton.prototype.update = function () {
	this.button.update(); // can't use auto update, because highlighting would be synced with label
	const mouseInRect = GameManager.mousePos.x >= this.x && GameManager.mousePos.y >= this.y
		&& GameManager.mousePos.x < this.button.x + this.button.rect.width
		&& GameManager.mousePos.y < this.button.y + this.button.rect.height;
	if (mouseInRect) {
		if (GameManager.mousePressedLeft) {
			GameManager.mousePressedLeft = false;
			this.mouseDownOnButton = true;
		}
		if (GameManager.mouseReleasedLeft) {
			if (this.mouseDownOnButton) {
				GameManager.mouseReleasedLeft = false;
				if (this.button.runMethod != null) { // button has been clicked
					this.button.runMethod.apply(this.button, this.button.optionalArgs);
				}
			}
			this.mouseDownOnButton = false;
		}
		this.drawSurface = this.brightenedSurface;
		this.button.drawSurface = this.button.brightenedSurface;
	} else {
		this.drawSurface = this.normalSurface;
		this.button.drawSurface = this.button.normalSurface;
	}
};

function ToggleButton(x, y, xOff, yOff, fontLow, fontHigh, label, labelOff, labelOn, initialState, layer, callback) {
	this.state = initialState ? 1 : 0;
	RygameObject.call(this, x, y, 0, 0, null, layer, false, true, true);
	this.normalSurface = fontLow.createTextImage(label);
	this.drawSurface = this.normalSurface;
	this.brightenedSurface = fontHigh.createTextImage(label);
	this.imgLabelOff = fontLow.createTextImage(labelOff);
	this.imgLabelOffHi = fontHigh.createTextImage(labelOff);
	this.imgLabelOn = fontLow.createTextImage(labelOn);
	this.imgLabelOnHi = fontHigh.createTextImage(labelOn);
	const that = this;
	this.button = new ImageButton(x + xOff, y + yOff, 0, that.state ? that.imgLabelOn : that.imgLabelOff, that.state ? that.imgLabelOnHi : that.imgLabelOffHi, layer, function () {
		that.state = 1 - that.state;
		that.button.normalSurface = that.state ? that.imgLabelOn : that.imgLabelOff;
		that.button.brightenedSurface = that.state ? that.imgLabelOnHi : that.imgLabelOffHi;
		that.button.rect.width = that.button.normalSurface.width;
		that.button.rect.height = that.button.normalSurface.height;
		if (callback) {
			callback(that.state);
		}
	});
	this.button.updateAutomatically = false;
	this.mouseDownOnButton = false;
}
