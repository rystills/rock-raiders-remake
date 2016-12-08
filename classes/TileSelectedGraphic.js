makeChild("TileSelectedGraphic","RygameObject");

TileSelectedGraphic.prototype.update = function() {
	if (selection.length != 0 && selectionType != "raider") {
		this.visible = true;
		this.x = selection[0].x; //todo: support multi-selection here rather than just the first selected object
		this.y = selection[0].y;
	}
	else {
		this.visible = false;
	}
};

function TileSelectedGraphic() {
	RygameObject.call(this,0,0,500000,5000,null,gameLayer); //depth between Space and BuildingPlacer
	
	this.drawSurface = createContext(tileSize,tileSize,false);
	this.drawSurface.globalAlpha=0.3;
	this.drawSurface.fillStyle = "rgb(0,255,0)";
	this.drawSurface.fillRect(0,0,tileSize,tileSize);
	this.drawSurface.globalAlpha=1;
}