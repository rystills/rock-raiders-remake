function MusicPlayer() {
	this.trackNum = 0;
}

MusicPlayer.prototype.playRandomSong = function() {
	var newTrackNum = this.trackNum;
	while (newTrackNum == this.trackNum) {
		this.trackNum = randomInt(1, 3);
	}
	GameManager.sounds["song" + this.trackNum + "-reduced noise"].play();
};

MusicPlayer.prototype.update = function() {
	if (GameManager.sounds["song" + this.trackNum + "-reduced noise"].paused) {
		this.playRandomSong();
	}
};