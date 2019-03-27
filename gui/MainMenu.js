makeChild("MainMenuButton", "ImageButton");

function MainMenuButton(centerX, centerY, text, fontNormal, fontBright, layer, runMethod, optionalArgs = null) {
	let normalSurface = fontNormal.createTextImage(text);
	const x = centerX - normalSurface.width / 2;
	const y = centerY - normalSurface.height / 2;
	ImageButton.call(this, x, y, 0, normalSurface, fontBright.createTextImage(text), layer, runMethod, optionalArgs, false);
}

makeChild("LevelButton", "ImageButton");

function LevelButton(x, y, levelImageName, layer, levelName, levelNum) {
	const path = levelImageName.startsWith("Tutorial") ? "Levels/TutorialLevels/" : "Levels/GameLevels/";
	ImageButton.call(this, x, y, 0, GameManager.getImage(path + "G" + levelImageName + ".bmp"),
		GameManager.getImage(path + levelImageName + ".bmp"), layer, resetLevelVars, [levelName], true);
	this.unavailableSurface = GameManager.getImage(path + levelImageName + "G.bmp");
	this.additionalRequirement = levelIsUnlocked;
	this.additionalRequirementArgs = [levelNum];
}
