makeChild("MainMenuButton", "ImageButton");

function MainMenuButton(centerX, centerY, text, fontNormal, fontBright, layer, runMethod, optionalArgs = null) {
	let normalSurface = fontNormal.createTextImage(text);
	const x = centerX - normalSurface.canvas.width / 2;
	const y = centerY - normalSurface.canvas.height / 2;
	ImageButton.call(this, x, y, normalSurface, fontBright.createTextImage(text), layer, runMethod, false);
	this.optionalArgs = optionalArgs;
}

makeChild("LevelButton", "ImageButton");

function LevelButton(x, y, levelImageName, layer, levelName, levelNum) {
	ImageButton.call(this, x, y, GameManager.getImage("G" + levelImageName),
		GameManager.getImage(levelImageName), layer, resetLevelVars, true);
	this.unavailableSurface = GameManager.getImage(levelImageName + "G");
	this.optionalArgs = [levelName];
	this.additionalRequirement = levelIsUnlocked;
	this.additionalRequirementArgs = [levelNum];
}
