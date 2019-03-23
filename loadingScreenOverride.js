function drawLoadingScreen(curResource, totalResources) {
	const ctx = GameManager.canvas.getContext('2d');
	let screenZoom = GameManager.getScreenZoom();
	const loadingBarX = 142 * screenZoom;
	const loadingBarY = 450 * screenZoom;
	const loadingBarWidth = 353 * curResource / totalResources * screenZoom;
	const loadingBarHeight = 9 * screenZoom;
	ctx.drawImage(GameManager.getImage("loading screen.png"), 0, 0, GameManager.screenWidth, GameManager.screenHeight);
	ctx.drawImage(GameManager.getImage("loading bar.png"), loadingBarX, loadingBarY, loadingBarWidth, loadingBarHeight);
}

overrideLoadingScreen = drawLoadingScreen;