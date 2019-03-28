/**
 * play one of the three in-game tracks at random
 */
MusicPlayer.prototype.startRandomTrack = function () {
	// select next random track
	this.currentRandomTrack = (this.currentRandomTrack + randomInt(1, this.numberOfRandomTracks - 1)) % this.numberOfRandomTracks;
	const that = this;
	this.startTrack("song" + (this.currentRandomTrack + 1) + "-reduced noise", function () {
		that.startRandomTrack();
	});
};

/**
 * Convenience function for better error handling. Starts playing a sound from beginning.
 * @param trackName A HTML audio element to start playing
 * @param onendedCallback Callback that is triggered if the selected track ends, useful for endless loops
 */
MusicPlayer.prototype.startTrack = function (trackName, onendedCallback) {
	if (typeof (trackName) === 'string' || trackName instanceof String) {
		this.lastTrackName = trackName;
	}
	if (this.lastTrackName) {
		const track = GameManager.sounds[this.lastTrackName];
		track.currentTime = 0;
		track.addEventListener("ended", onendedCallback);
		// at least Chromium throws an error, if the user didn't interact with the site, before play() is called
		const that = this;
		track.play().catch((e) => setTimeout(function () {
			that.startTrack(trackName, onendedCallback);
		}, 2000)); // retry again in 2 seconds
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
	this.lastTrackName = undefined;
};

/**
 * Stops the currently playing track and starts a new one.
 * @param trackName: The sound track to play. No name means random
 */
MusicPlayer.prototype.changeTrack = function (trackName) {
	if (this.lastTrackName) { // currently playing a track? Stop it!
		this.stopTrack(GameManager.sounds[this.lastTrackName]);
	}
	if (trackName) {
		const that = this;
		this.startTrack(trackName, function repeat() {
			that.startTrack(trackName, repeat);
		});
	} else {
		this.startRandomTrack();
	}
};

/**
 * MusicPlayer constructor: start the track number at 0 (main menu music)
 */
function MusicPlayer() {
	this.numberOfRandomTracks = 3;
	this.currentRandomTrack = 0;
	this.lastTrackName = undefined;
}
