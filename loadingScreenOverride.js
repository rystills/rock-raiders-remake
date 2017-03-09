function drawLoadingScreen(curResource, totalResources) {
	var canv = document.getElementById('canvas');
	var ctx = canv.getContext('2d');
	var loadingBarX = 175;
	var loadingBarY = 560;
	var loadingBarWidth = 448;
	var loadingBarHeight = 16;
	ctx.drawImage(GameManager.images["loading bar.png"],loadingBarX,loadingBarY);
	ctx.fillRect(loadingBarX,loadingBarY,loadingBarWidth * (curResource/totalResources),loadingBarHeight);
	ctx.drawImage(GameManager.images["loading screen.png"],0,0)
	
}

overrideLoadingScreen = drawLoadingScreen;