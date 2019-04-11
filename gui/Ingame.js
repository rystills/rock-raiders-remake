makeChild("IconButtonPanel", "RygameObject");

IconButtonPanel.prototype.updateBackgroundImage = function () {
	this.drawSurface = GameManager.getImage("Interface/IconPanel/IconPanel" + this.buttons.size().toString() + (this.backButton ? ".bmp" : "WOBack.bmp"));
};

IconButtonPanel.prototype.addButton = function (imagePath, imageName, runMethod = null, optionalArgs = null, additionalRequirement = null, additionalRequirementArgs = []) {
	if (!imagePath.endsWith("/")) {
		imagePath = imagePath + "/";
	}
	const normalSurface = GameManager.getImage(imagePath + imageName);
	const brightenedSurface = GameManager.getImage(imagePath + imageName);
	const button = new ImageButton(this.x + (this.backButton ? 35 : 10), this.y + 9 + this.curY, drawDepthIconButtonPanelButtons, normalSurface, brightenedSurface, this.drawLayer, runMethod, optionalArgs);
	button.darkenedSurface = GameManager.getImage(imagePath + "P" + imageName);
	button.unavailableSurface = GameManager.getImage(imagePath + "N" + imageName);
	button.additionalRequirement = additionalRequirement;
	button.additionalRequirementArgs = additionalRequirementArgs;
	button.updateAutomatically = false;
	button.visible = false;
	this.buttons.push(button);
	this.curY += button.normalSurface.canvas.height;
	return button;
};

IconButtonPanel.prototype.hide = function () {
	// TODO start hide animation
	this.setVisible(false);
};

IconButtonPanel.prototype.show = function () {
	// TODO start show animation
	this.setVisible(true);
};

IconButtonPanel.prototype.setVisible = function (state) {
	this.visible = state;
	this.buttons.objectList.forEach(btn => btn.visible = state);
	if (this.backButton) this.backButton.visible = state;
};

function IconButtonPanel(backButtonCallback = null) {
	this.buttons = new ObjectGroup();
	this.curY = 0;
	RygameObject.call(this, gameLayer.width - (backButtonCallback ? 111 : 86), 7, 10, drawDepthIconButtonPanelBackground, null, uiLayer, false, true, true);
	if (backButtonCallback) {
		this.backButton = new ImageButton(this.x + 4, this.y + 14, drawDepthIconButtonPanelButtons, null, GameManager.getImage("Interface/IconPanel/Back_HL.bmp"), uiLayer, backButtonCallback);
		this.backButton.visible = false;
	}
	this.setVisible(false);
}

makeChild("CrystalSideBar", "RygameObject");

CrystalSideBar.prototype.init = function (neededCrystals) {
	this.neededCrystals = neededCrystals ? neededCrystals : 0;
	this.redraw();
};

CrystalSideBar.prototype.changeResource = function (type, amount) {
	this.resources[type] += amount;
	this.redraw();
};

CrystalSideBar.prototype.redraw = function () {
	// clear drawSurface
	this.drawSurface.drawImage(this.image.canvas, 0, 0);

	// draw crystals
	let curX = this.rect.width - 8;
	let curY = this.rect.height - 34;
	const imgNoCrystal = GameManager.getImage("Interface/RightPanel/NoSmallCrystal.bmp").canvas;
	const imgSmallCrystal = GameManager.getImage("Interface/RightPanel/SmallCrystal.bmp").canvas;
	const imgUsedCrystal = GameManager.getImage("Interface/RightPanel/UsedCrystal.bmp").canvas;
	for (let c = 0; (this.neededCrystals < 1 || c < Math.max(this.neededCrystals, this.resources["crystal"])) && curY >= Math.max(imgNoCrystal.height, imgSmallCrystal.height, imgUsedCrystal.height); c++) {
		let imgCrystal = imgNoCrystal;
		if (this.usedCrystals > c) {
			imgCrystal = imgUsedCrystal;
		} else if (this.resources["crystal"] > c) {
			imgCrystal = imgSmallCrystal;
		}
		curY -= imgCrystal.height;
		this.drawSurface.drawImage(imgCrystal, curX - imgCrystal.width / 2, curY);
	}

	// draw ores
	curX = this.rect.width - 21;
	curY = this.rect.height - 42;
	const imgOre = GameManager.getImage("Interface/RightPanel/CrystalSideBar_Ore.bmp").canvas;
	for (let i = 0; i < this.resources["ore"] && curY >= imgOre.height; ++i) {
		curY -= imgOre.height;
		this.drawSurface.drawImage(imgOre, curX - imgOre.width / 2, curY);
	}

	// draw ore and crystal text
	this.drawSurface.fillText(this.resources["ore"], this.rect.width - 39, this.rect.height - 3);
	this.drawSurface.fillText(this.resources["crystal"], this.rect.width - 14, this.rect.height - 3);
};

function CrystalSideBar() {
	RygameObject.call(this, 0, 0, 10, drawDepthCrystalSideBar, "Interface/RightPanel/CrystalSideBar.bmp", uiLayer, false, true, true);
	this.x = uiLayer.width - this.rect.width;
	this.drawSurface.textAlign = "center";
	this.drawSurface.font = "bold 10px " + GameManager.fontName;
	this.drawSurface.fillStyle = "white";
	this.resources = {"ore": 0, "crystal": 0};
	this.neededCrystals = 0;
	this.usedCrystals = 0;
}
