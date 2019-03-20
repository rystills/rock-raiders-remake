function drawLoadingScreen(curResource, totalResources) {
	const ctx = document.getElementById('canvas').getContext('2d');
	const loadingBarX = 142;
	const loadingBarY = 450;
	const loadingBarWidth = 353 * curResource / totalResources;
	const loadingBarHeight = 9;
	ctx.drawImage(GameManager.images["loading screen.png"], 0, 0);
	ctx.drawImage(GameManager.images["loading bar.png"], loadingBarX, loadingBarY, loadingBarWidth, loadingBarHeight);
}

overrideLoadingScreen = drawLoadingScreen;