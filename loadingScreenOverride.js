function drawLoadingScreen(curResource, totalResources) {
	var canv = document.getElementById('canvas');
	var ctx = canv.getContext('2d');
	var loadingBarX = 175;
	var loadingBarY = 560;
	var loadingBarWidth = 448;
	var loadingBarHeight = 16;
	var percentage = curResource / totalResources;
	ctx.drawImage(GameManager.images["loading bar.png"], loadingBarX, loadingBarY);
	//draw loading bar gradient in 1 pixel long vertical slices
	for (let x = 0; x < percentage * loadingBarWidth; ++x) {
		var curPercentage = x / loadingBarWidth;
		var green = 255;
		var red = 255;
		var blue = 0;
		if (curPercentage <= .5) { //if we are less than half way, transition red from 0 to 255
			red = 255 * (curPercentage / .5);
		} else { //if we are more than half way, transition green from 255 to 0
			green = 255 * ((1 - curPercentage) / .5);
		}
		ctx.fillStyle = 'rgb(' + Math.floor(red) + ', ' + Math.floor(green) + ', ' + Math.floor(blue) + ')';
		ctx.fillRect(loadingBarX + x, loadingBarY, 1, loadingBarHeight);

	}
	ctx.drawImage(GameManager.images["loading screen.png"], 0, 0)

}

overrideLoadingScreen = drawLoadingScreen;