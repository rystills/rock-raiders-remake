/**
 * play one of the three in-game tracks at random
 */
MusicPlayer.prototype.playRandomSong = function() {
	//don't do anything if we are already playing a song
	if (this.trackNum == 0 || GameManager.sounds["song" + this.trackNum + "-reduced noise"].paused) {
		var newTrackNum = this.trackNum;
		while (newTrackNum == this.trackNum) {
			this.trackNum = randomInt(1, 3);
		}
		GameManager.sounds["song" + this.trackNum + "-reduced noise"].play();
	}
};

/**
 * update the music player, changing tracks when necessary and choosing a new in-game theme once the previous song ends
 */
MusicPlayer.prototype.update = function() {
	if (this.trackNum == 0) {
		if (GameManager.sounds["menu theme"].paused) {
			GameManager.sounds["menu theme"].play();
		}
	}
	else if (this.trackNum == -1) {
		if (GameManager.sounds["score screen"].paused) {
			GameManager.sounds["score screen"].play();
		}
	}
	else if (GameManager.sounds["song" + this.trackNum + "-reduced noise"].paused) {
		this.playRandomSong();
	}
};

/**
 * stop the currently playing music as the game transitions to a new level
 */
MusicPlayer.prototype.changeLevels = function() {
	if (this.trackNum == 0) {
		GameManager.sounds["menu theme"].pause();
		GameManager.sounds["menu theme"].currentTime = 0;
	}
	else if (this.trackNum == -1) {
		GameManager.sounds["score screen"].pause();
		GameManager.sounds["score screen"].currentTime = 0;
	}
	else {
		GameManager.sounds["song" + this.trackNum + "-reduced noise"].pause();
		GameManager.sounds["song" + this.trackNum + "-reduced noise"].currentTime = 0;
	}
};

/**
 * MusicPlayer constructor: start the track number at 0 (main menu music)
 */
function MusicPlayer() {
	this.trackNum = 0;
}