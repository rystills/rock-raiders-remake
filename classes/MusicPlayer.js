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
	if (this.trackNum == 0) {
		if (GameManager.sounds["menu theme"].paused) {
			GameManager.sounds["menu theme"].play();
		}
	}
	else if (GameManager.sounds["song" + this.trackNum + "-reduced noise"].paused) {
		this.playRandomSong();
	}
};

MusicPlayer.prototype.changeLevels = function() {
	if (this.trackNum == 0) {
		GameManager.sounds["menu theme"].pause();
		GameManager.sounds["menu theme"].currentTime = 0;
	}
	else {
		GameManager.sounds["song" + this.trackNum + "-reduced noise"].pause();
		GameManager.sounds["song" + this.trackNum + "-reduced noise"].currentTime = 0;
	}
};