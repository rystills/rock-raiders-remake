makeChild("ScoreScreenOverlay", "RygameObject");

ScoreScreenOverlay.prototype.setValue = function (value) {
	if (this.val != null && this.val.drawSurface != null) {
		this.val.x += this.val.drawSurface.width / 2;
	}
	let valueImage = scoreScreenLayer.fonts[this.key].createTextImage(value);
	this.val.x -= valueImage.width / 2;
	this.val.drawSurface = valueImage;
	this.val.rect = new Rect(this.val.drawSurface.width, this.val.drawSurface.height);
	this.val.visible = false;
};

ScoreScreenOverlay.prototype.startReveal = function () {
	const that = this;
	if (that.revealTimeout != null) {
		return; // overlay is already being revealed soon
	}
	that.revealTimeout = setTimeout(function () {
		that.show();
		if (that.txt) {
			that.txt.visible = true;
			if (that.txtDelay > 0) { // don't hide Score text
				const txt = that.txt;
				that.txtTimeout = setTimeout(function () { // start timer to hide text again
					txt.visible = false;
				}, that.txtDelay);
			}
		}
	}, that.revealStart);
};

ScoreScreenOverlay.prototype.show = function () {
	if (this.img) {
		this.img.visible = true;
	}
	if (this.box) {
		this.box.visible = true;
	}
	if (this.val) {
		this.val.visible = true;
	}
	if (this.txt) {
		this.txt.visible = this.key === "Score";
	}
	if (this.revealTimeout) {
		clearTimeout(this.revealTimeout);
	}
	this.revealTimeout = null;
	if (this.txtTimeout) {
		clearTimeout(this.txtTimeout);
	}
	this.txtTimeout = null;
};

ScoreScreenOverlay.prototype.reset = function () {
	if (this.img) {
		this.img.visible = false;
	}
	if (this.box) {
		this.box.visible = false;
	}
	if (this.val) {
		this.val.visible = false;
	}
	if (this.txt) {
		this.txt.visible = false;
	}
	if (this.revealTimeout) {
		clearTimeout(this.revealTimeout);
	}
	this.revealTimeout = null;
	if (this.txtTimeout) {
		clearTimeout(this.txtTimeout);
	}
	this.txtTimeout = null;
};

function ScoreScreenOverlay(key, revealStart) {
	this.key = key;
	this.img = null;
	this.box = null;
	this.val = null;
	this.txt = null;
	this.revealStart = revealStart;
	this.txtDelay = 0;
	this.revealTimeout = null;
	this.txtTimeout = null;
}

makeChild("ScoreScreenLayer", "Layer");

ScoreScreenLayer.prototype.setValues = function (missionState, missionTitle, crystals, ore, diggable, constructions, caverns, figures, rockMonsters, oxygen, timerMilliseconds, score) {
	if (this.btnTimeout != null) {
		clearTimeout(this.btnTimeout);
	}
	this.btnTimeout = null;
	const overlays = this.overlays;
	Object.keys(overlays).forEach(function (overlayKey) {
		overlays[overlayKey].reset();
	});
	this.saveButton.visible = false;
	this.advanceButton.visible = false;

	if (this.missionTitle != null && this.missionTitle.drawSurface != null) {
		this.missionTitle.x += this.missionTitle.drawSurface.width / 2;
	}
	let titleImage = scoreScreenLayer.titleFont.createTextImage(missionTitle);
	this.missionTitle.x -= titleImage.width / 2;
	this.missionTitle.drawSurface = titleImage;
	this.missionTitle.rect = new Rect(this.missionTitle.drawSurface.width, this.missionTitle.drawSurface.height);

	this.missionState = missionState;
	this.completeText.visible = this.missionState === "completed";
	this.failedText.visible = this.missionState === "failed";
	this.quitText.visible = this.missionState === "quit";

	this.overlays["Crystals"].setValue(crystals.toString() + "%");
	this.overlays["Ore"].setValue(ore.toString() + "%");
	this.overlays["Diggable"].setValue(diggable.toString() + "%");
	this.overlays["Constructions"].setValue(constructions.toString());
	this.overlays["Caverns"].setValue(caverns.toString() + "%");
	this.overlays["Figures"].setValue(figures.toString() + "%");
	this.overlays["RockMonsters"].setValue(rockMonsters.toString() + "%");
	this.overlays["Oxygen"].setValue(oxygen.toString() + "%");
	const h = Math.floor(timerMilliseconds / 3600000).toString();
	const hh = h.length < 2 ? "0" + h : h;
	const m = Math.floor(timerMilliseconds / 60000).toString();
	const mm = m.length < 2 ? "0" + m : m;
	const s = Math.floor((timerMilliseconds % 60000) / 1000).toString();
	const ss = s.length < 2 ? "0" + s : s;
	this.overlays["Timer"].setValue(hh + ":" + mm + "." + ss);
	this.overlays["Score"].setValue(score.toString() + "%");
};

ScoreScreenLayer.prototype.startReveal = function () {
	const overlays = this.overlays;
	const missionState = this.missionState;
	Object.keys(overlays).forEach(function (overlayKey) {
		if (overlayKey !== "Score" || missionState === "completed") {
			overlays[overlayKey].startReveal();
		}
	});
	const saveButton = this.saveButton;
	const advButton = this.advanceButton;
	const overlayKeys = Object.keys(overlays);
	const lastOverlay = overlays[overlayKeys[overlayKeys.length - 1]];
	this.btnTimeout = setTimeout(function () {
		saveButton.visible = true;
		saveButton.clickable = missionState === "completed";
		advButton.visible = true;
	}, lastOverlay.revealStart + lastOverlay.revealTimeout);
};

ScoreScreenLayer.prototype.update = function () {
	// skip reveals
	if (GameManager.mouseReleasedLeft) {
		const overlays = this.overlays;
		const missionState = this.missionState;
		Object.keys(overlays).forEach(function (overlayKey) {
			if (overlayKey !== "Score" || missionState === "completed") {
				overlays[overlayKey].show();
			}
		});
		this.saveButton.visible = true;
		this.saveButton.clickable = this.missionState === "completed";
		this.advanceButton.visible = true;
	}
};

function ScoreScreenLayer(confScoreScreen) {
	this.btnTimeout = null;
	this.missionState = null;
	Layer.call(this, 0, 0, 1, 1, GameManager.screenWidth, GameManager.screenHeight);
	const layer = this;

	this.background = GameManager.getImage(confScoreScreen["Wallpaper"]);
	const backFont = GameManager.getFont(confScoreScreen["BackFont"]);
	const font = GameManager.getFont(confScoreScreen["Font"]);
	this.titleFont = GameManager.getFont(confScoreScreen["TitleFont"]);
	const fonts = [];
	this.fonts = fonts;
	Object.keys(confScoreScreen["Fonts"]).forEach(function (fontKey) {
		fonts[fontKey] = GameManager.getFont(confScoreScreen["Fonts"][fontKey]);
	});
	const revealDelay = Math.round(parseFloat(confScoreScreen["Timer"]) * 1000);
	const overlays = [];
	this.overlays = overlays;
	let drawDepth = 500;
	Object.keys(confScoreScreen["Images"]).forEach(function (imgKey, index) {
		const imgConf = confScoreScreen["Images"][imgKey].split("|");
		overlays[imgKey] = overlays[imgKey] || new ScoreScreenOverlay(imgKey, index * revealDelay);
		overlays[imgKey].img = new RygameObject(parseInt(imgConf[1]), parseInt(imgConf[2]), 0, drawDepth, imgConf[0], layer, false, true, false);
		overlays[imgKey].img.visible = false;
		drawDepth--;
	});
	Object.keys(confScoreScreen["BoxImages"]).forEach(function (boxKey, index) {
		const boxConf = confScoreScreen["BoxImages"][boxKey].split("|");
		overlays[boxKey] = overlays[boxKey] || new ScoreScreenOverlay(boxKey, index * revealDelay);
		overlays[boxKey].box = new RygameObject(parseInt(boxConf[1]), parseInt(boxConf[2]), 0, drawDepth, boxConf[0], layer, false, true, false);
		overlays[boxKey].box.visible = false;
		drawDepth--;
	});
	const textPos = confScoreScreen["TextPos"].split("|");
	const txtX = parseInt(textPos[0]);
	const txtY = parseInt(textPos[1]);
	Object.keys(confScoreScreen["Text"]).forEach(function (txtKey, index) {
		const txtConf = confScoreScreen["Text"][txtKey].split("|");
		const valX = parseInt(txtConf[1]);
		const valY = parseInt(txtConf[2]);
		overlays[txtKey] = overlays[txtKey] || new ScoreScreenOverlay(txtKey, index * revealDelay);
		overlays[txtKey].val = new RygameObject(valX, valY, 0, drawDepth, null, layer, false, true, false);
		drawDepth--;
		let textImage = (txtKey === "Score" ? backFont : font).createTextImage(txtConf[0]);
		const x = txtKey === "Score" ? 305 : txtX;
		const y = txtKey === "Score" ? 195 : txtY;
		overlays[txtKey].txt = new RygameObject(x - textImage.width / 2, y, 0, drawDepth, null, layer, false, true, false);
		overlays[txtKey].txt.drawSurface = textImage;
		overlays[txtKey].txt.rect = new Rect(overlays[txtKey].txt.drawSurface.width, overlays[txtKey].txt.drawSurface.height);
		overlays[txtKey].txt.visible = false;
		overlays[txtKey].txtDelay = txtKey === "Score" ? 0 : 3078; // original value but rounded to milliseconds
		drawDepth--;
	});

	const vertSpacing = parseInt(confScoreScreen["VertSpacing"]);
	this.missionTitle = new RygameObject(GameManager.screenWidth / 2, vertSpacing, 0, drawDepth, null, layer, false, true, false);
	drawDepth--;

	let completeImage = this.titleFont.createTextImage(confScoreScreen["CompleteText"]);
	this.completeText = new RygameObject((GameManager.screenWidth - completeImage.width) / 2, vertSpacing * 2, 0, drawDepth, null, layer, false, true, false);
	this.completeText.drawSurface = completeImage;
	this.completeText.rect = new Rect(this.completeText.drawSurface.width, this.completeText.drawSurface.height);
	this.completeText.visible = false;
	drawDepth--;

	let failedImage = this.titleFont.createTextImage(confScoreScreen["FailedText"]);
	this.failedText = new RygameObject((GameManager.screenWidth - failedImage.width) / 2, vertSpacing * 2, 0, drawDepth, null, layer, false, true, false);
	this.failedText.drawSurface = failedImage;
	this.failedText.rect = new Rect(this.failedText.drawSurface.width, this.failedText.drawSurface.height);
	this.failedText.visible = false;
	drawDepth--;

	let quitImage = this.titleFont.createTextImage(confScoreScreen["QuitText"]);
	this.quitText = new RygameObject((GameManager.screenWidth - quitImage.width) / 2, vertSpacing * 2, 0, drawDepth, null, layer, false, true, false);
	this.quitText.drawSurface = quitImage;
	this.quitText.rect = new Rect(this.quitText.drawSurface.width, this.quitText.drawSurface.height);
	this.quitText.visible = false;
	drawDepth--;

	const confSaveButton = confScoreScreen["SaveButton"].split("|");
	const normalSaveSurface = GameManager.getImage(confSaveButton[0]);
	const brightenedSaveSurface = GameManager.getImage(confSaveButton[1]);
	// TODO jump to save menu
	this.saveButton = new ImageButton(parseInt(confSaveButton[confSaveButton.length - 2]), parseInt(confSaveButton[confSaveButton.length - 1]), drawDepth, normalSaveSurface, brightenedSaveSurface, layer, null);
	this.saveButton.darkenedSurface = GameManager.getImage(confSaveButton[2]);
	this.saveButton.unavailableSurface = GameManager.getImage(confSaveButton[3]);
	this.saveButton.visible = false;
	drawDepth--;

	const confAdvanceButton = confScoreScreen["AdvanceButton"].split("|");
	const normalAdvSurface = GameManager.getImage(confAdvanceButton[0]);
	const brightenedAdvSurface = GameManager.getImage(confAdvanceButton[1]);
	this.advanceButton = new ImageButton(parseInt(confAdvanceButton[confAdvanceButton.length - 2]), parseInt(confAdvanceButton[confAdvanceButton.length - 1]), drawDepth, normalAdvSurface, brightenedAdvSurface, layer, goToLevelSelect);
	this.advanceButton.darkenedSurface = GameManager.getImage(confAdvanceButton[2]);
	this.advanceButton.unavailableSurface = GameManager.getImage(confAdvanceButton[3]);
	this.advanceButton.visible = false;
	drawDepth--;
}
