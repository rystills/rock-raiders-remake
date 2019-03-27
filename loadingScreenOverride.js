function drawLoadingScreen(curResource, totalResources) {
	const ctx = GameManager.canvas.getContext('2d');
	let screenZoom = GameManager.getScreenZoom();
	const loadingBarX = 142 * screenZoom;
	const loadingBarY = 450 * screenZoom;
	const loadingBarWidth = 353 * curResource / totalResources * screenZoom;
	const loadingBarHeight = 9 * screenZoom;
	ctx.drawImage(GameManager.getImage("Languages/Loading.bmp"), 0, 0, ctx.canvas.width, ctx.canvas.height);
	ctx.drawImage(GameManager.getImage("Interface/FrontEnd/gradient.bmp"), loadingBarX, loadingBarY, loadingBarWidth, loadingBarHeight);
}

overrideLoadingScreen = drawLoadingScreen;