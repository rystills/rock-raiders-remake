function MusicPlayer() {
	this.trackNum = 0;
}

MusicPlayer.prototype.playRandomSong = function() {
	if (this.trackNum == 0 || GameManager.sounds["song" + this.trackNum + "-reduced noise"].paused) { //don't do anything if we are already playing a song
		var newTrackNum = this.trackNum;
		while (newTrackNum == this.trackNum) {
			this.trackNum = randomInt(1, 3);
		}
		GameManager.sounds["song" + this.trackNum + "-reduced noise"].play();
	}
};

MusicPlayer.prototype.update = function() {
	if (GameManager.sounds["song" + this.trackNum + "-reduced noise"].paused) {
		this.playRandomSong();
	}
};