makeChild("BuildingPlacer","RygameObject");
BuildingPlacer.prototype.update = function() {
	if (this.visible) {
//		this.x = GameManager.mousePos.x - (GameManager.mousePos.x % tileSize) - (gameLayer.cameraX % tileSize);
//		this.y = GameManager.mousePos.y - (GameManager.mousePos.y % tileSize) - (gameLayer.cameraY % tileSize);
		/*this.x = GameManager.mousePos.x;// + gameLayer.cameraX;
		this.x -= (this.x % tileSize);
		this.x -= (gameLayer.cameraX % tileSize);
		this.y = GameManager.mousePos.y;// + gameLayer.cameraY;
		this.y -= (this.y % tileSize);
		this.y -= (gameLayer.cameraY % tileSize);*/
		this.x = GameManager.mousePos.x;
		this.x += (gameLayer.cameraX % tileSize);
		this.x = Math.floor(this.x / tileSize) * tileSize;
		this.x -= (gameLayer.cameraX % tileSize);
		this.y = GameManager.mousePos.y;
		this.y += (gameLayer.cameraY % tileSize);
		this.y = Math.floor(this.y / tileSize) * tileSize;
		this.y -= (gameLayer.cameraY % tileSize);
	}
};

function BuildingPlacer(type) {
	RygameObject.call(this,0,0,1000000,10000,null,gameLayer,false); //update after Space, and draw in front of space
	this.buildingType = type;
	this.drawSurface = createContext(tileSize,tileSize,false);
	this.drawSurface.globalAlpha=.25;
	this.drawSurface.fillStyle = "rgb(255,0,0)";
	this.drawSurface.fillRect(0,0,this.drawSurface.canvas.width,this.drawSurface.canvas.height); //darken screen while awaitingStart
	this.visible = false;
}