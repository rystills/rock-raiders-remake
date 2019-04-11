/**
 * returns one of the three in-game tracks at random
 */
MusicPlayer.prototype.getNextRandomTrack = function () {
	return "song" + (randomInt(1, this.numberOfRandomTracks)) + "-reduced noise";
};

/**
 * Convenience function for better error handling. Starts playing a sound from beginning.
 * @param trackName A HTML audio element to start playing
 */
MusicPlayer.prototype.startTrack = function (trackName) {
	this.currentTrackName = trackName;
	if (this.currentTrackName) {
		const track = GameManager.sounds[this.currentTrackName];
		track.currentTime = 0;
		track.volume = this.musicVolume;
		track.addEventListener("ended", function () {
			that.stopTrack(track);
			that.startTrack(that.randomMode ? that.getNextRandomTrack() : trackName);
		});
		const that = this;
		const playPromise = track.play();
		if (playPromise !== undefined) {
			// Chromium returns a promise and throws an exception, if the user didn't interact with the site, before play() is called
			playPromise.then(() => {
				// in case the last play throw an exception and the volume changed since initial startTrack was called
				track.volume = this.musicVolume;
			}).catch(() => setTimeout(function () { // retry start automatically
				if (that.currentTrackName === trackName) {
					that.startTrack(trackName);
				} // else Track changed in the mean time
			}, 2000));
		}
	}
};

/**
 * Convenience function for better state handling. Stops playing a sound and resets its state.
 * @param sound A HTML audio element to stop from playing
 */
MusicPlayer.prototype.stopTrack = function (sound) {
	if (sound) {
		sound.pause();
		sound.currentTime = 0;
		sound.ended = true;
	}
};

/**
 * Stops the currently playing track and starts a new one.
 * @param trackName: The sound track to play. No name means random
 */
MusicPlayer.prototype.changeTrack = function (trackName) {
	if (this.currentTrackName) { // currently playing a track? Stop it!
		this.stopTrack(GameManager.sounds[this.currentTrackName]);
	}
	this.randomMode = false;
	if (!trackName) {
		this.randomMode = true;
		trackName = this.getNextRandomTrack();
	}
	this.startTrack(trackName);
};

MusicPlayer.prototype.setMusicVolume = function (volume) {
	this.musicVolume = volume;
	setValue("musicVolume", this.musicVolume);
	if (this.currentTrackName) { // currently playing a track? Stop it!
		GameManager.sounds[this.currentTrackName].volume = this.musicVolume;
	}
};

/**
 * MusicPlayer constructor: start the track number at 0 (main menu music)
 */
function MusicPlayer() {
	this.numberOfRandomTracks = 3;
	this.currentTrackName = undefined;
	this.randomMode = false;
	this.musicVolume = getValue("musicVolume", 0.5);
}
