makeChild("TileSelectedGraphic","RygameObject");

TileSelectedGraphic.prototype.update = function() {
	if (selection.length != 0 && selectionType != "raider") {
		this.visible = true;
		this.x = selection[0].x; //todo: support multi-selection here rather than just the first selected object
		this.y = selection[0].y;
		if (selection[0].drawSurface.canvas.width != this.drawSurface.canvas.width || selection[0].drawSurface.canvas.height != this.drawSurface.canvas.height) {
			this.resizeDrawSurface(selection[0].drawSurface.canvas.width, selection[0].drawSurface.canvas.height);
		}
	}
	else {
		this.visible = false;
	}
};

TileSelectedGraphic.prototype.resizeDrawSurface = function(width,height) {
	this.drawSurface.canvas.width = width;
	this.drawSurface.canvas.height = height;
		this.redrawSelectedGraphic();
}

TileSelectedGraphic.prototype.redrawSelectedGraphic = function() {
	this.drawSurface.globalAlpha=0.3;
	this.drawSurface.fillStyle = "rgb(0,255,0)";
	this.drawSurface.fillRect(0,0,this.drawSurface.canvas.width,this.drawSurface.canvas.height);
	this.drawSurface.globalAlpha=1;
}

TileSelectedGraphic.prototype.withinLayerBounds = function() {
	//override withinLayerBounds to return true as we do not actually maintain a valid rect, and will therefore be considered out-of-bounds and not rendered otherwise
	return true;
};

function TileSelectedGraphic() {
	RygameObject.call(this,0,0,500000,5000,null,gameLayer); //depth between Space and BuildingPlacer
	
	this.drawSurface = createContext(tileSize,tileSize,false);
	this.redrawSelectedGraphic()
}