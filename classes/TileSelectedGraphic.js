makeChild("TileSelectedGraphic", "RygameObject");

/**
 * update the selected tile effect to match the position and size of whatever is currently selected
 */
TileSelectedGraphic.prototype.update = function () {
	if (selection.length !== 0 && selectionType !== "raider") {
		this.visible = true;
		if (selection[0].drawSurface.width !== this.drawSurface.width && selection[0].drawSurface.height !== this.drawSurface.height) {
			const maxDim = Math.max(selection[0].drawSurface.width, selection[0].drawSurface.height);
			this.resizeDrawSurface(maxDim, maxDim);
			this.rect.width = maxDim;
			this.rect.height = maxDim;
		}
		// for the time being we only care about the first selection
		this.setCenterX(selection[0].centerX());
		this.setCenterY(selection[0].centerY());
	} else {
		this.visible = false;
	}
};

/**
 * resize the selected tile effect's draw surface to the input dimensions
 * @param width: the newly desired surface width
 * @param height: the newly desired surface height
 */
TileSelectedGraphic.prototype.resizeDrawSurface = function (width, height) {
	this.drawSurface.canvas.width = width;
	this.drawSurface.width = width;
	this.drawSurface.canvas.height = height;
	this.drawSurface.height = height;
	this.redrawSelectedGraphic();
};

/**
 * redraw the selected effect to our drawSurface (only necessary after changing dimensions)
 */
TileSelectedGraphic.prototype.redrawSelectedGraphic = function () {
	this.drawSurface.globalAlpha = 0.15;
	this.drawSurface.fillStyle = "blue";
	this.drawSurface.fillRect(0, 0, this.drawSurface.width, this.drawSurface.height);
	this.drawSurface.globalAlpha = 1;
};

/**
 * override withinLayerBounds to pretend we are always in-bounds, and therefore should be rendered
 */
TileSelectedGraphic.prototype.withinLayerBounds = function () {
	return true;
};

/**
 * TileSelectedGraphic constructor: create our drawSurface and initialize the selected graphic with our starting dimensions
 */
function TileSelectedGraphic() {
	// default to a render depth between Space and BuildingPlacer
	RygameObject.call(this, 0, 0, 500000, drawDepthSelectedSpace, null, gameLayer);

	this.drawSurface = createContext(tileSize, tileSize, false);
	this.rect.width = tileSize;
	this.rect.height = tileSize;
	this.redrawSelectedGraphic()
}