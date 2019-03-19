makeChild("HealthBar", "RygameObject");

/**
 * update the healthbar, redrawing it if the value remaining has changed
 */
HealthBar.prototype.update = function () {
	this.setCenterX(this.raider.centerX());
	this.y = this.raider.y - 12;
	if (this.prevHp !== this.raider.hp) {
		this.prevHp = this.raider.hp;
		this.updateBar();
	}
};

/**
 * redraw the healthbar (called automatically in update when the remaining value has changed)
 */
HealthBar.prototype.updateBar = function () {
	//have the outline be a fair bit darker than the filling
	this.drawSurface.fillStyle = "rgb(0,135,0)";
	this.drawSurface.fillRect(0, 0, this.barWidth + 2 * this.barBorderSize, this.barHeight + 2 * this.barBorderSize);
	this.drawSurface.fillStyle = "red";
	this.drawSurface.fillRect(this.barBorderSize, this.barBorderSize, this.barWidth, this.barHeight);
	this.drawSurface.fillStyle = "rgb(0,255,0)";
	this.drawSurface.fillRect(this.barBorderSize, this.barBorderSize, this.barWidth * (this.raider.hp / this.raider.maxHp), this.barHeight);
};

/**
 * healthbar class: maintain a visual representation of a Raider's remaining hp
 * @param raider: the raider whose hp this bar represents
 * @param barWidth: the total width of this bar (in pixels)
 * @param barHeight: the total height of this bar (in pixels)
 * @param barBorderSize: the size of this bar's border (in pixels)
 */
function HealthBar(raider, barWidth, barHeight, barBorderSize) {
	if (barWidth == null) {
		barWidth = 38;
	}
	if (barHeight == null) {
		barHeight = 10;
	}
	if (barBorderSize == null) {
		barBorderSize = 1;
	}
	//set update depth very high and render depth very low, so that healthbars draw in front and update late
	RygameObject.call(this, 0, 0, 100000, -100000, null, gameLayer);
	this.raider = raider;
	this.prevHp = raider.hp;
	this.barWidth = barWidth;
	this.barHeight = barHeight;
	this.barBorderSize = barBorderSize;
	this.drawSurface = createContext(this.barWidth + 2 * this.barBorderSize, this.barHeight + 2 * this.barBorderSize, false);
	this.rect = new Rect(this.barWidth + 2 * this.barBorderSize, this.barHeight + 2 * this.barBorderSize);
	this.updateBar();
}