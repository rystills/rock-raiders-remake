function drawLoadingScreen(curResource, totalResources) {
	const ctx = GameManager.canvas.getContext('2d');
	const loadingImg = GameManager.getImage("Languages/Loading.bmp").canvas;
	const screenZoom = ctx.canvas.width / loadingImg.width;
	const loadingBarX = 142 * screenZoom;
	const loadingBarY = 450 * screenZoom;
	const loadingBarWidth = 353 * curResource / totalResources * screenZoom;
	const loadingBarHeight = 9 * screenZoom;
	ctx.drawImage(loadingImg, 0, 0, ctx.canvas.width, ctx.canvas.height);
	ctx.drawImage(GameManager.getImage("Interface/FrontEnd/gradient.bmp").canvas, loadingBarX, loadingBarY, loadingBarWidth, loadingBarHeight);
}

overrideLoadingScreen = drawLoadingScreen;