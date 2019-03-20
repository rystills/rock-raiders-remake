/**
 * load a script asset from the input path, setting the callback function to the input callback
 * @param path: the path from which to load the script asset
 * @param callback: the callback function to be called once the script has finished loading
 */
function loadScriptAsset(path, callback) {
	const script = document.createElement('script');
	script.type = 'text/javascript';

	if (callback != null) {
		script.onload = callback;
	}

	script.src = path;

	// begin loading the script by appending it to the document head
	document.getElementsByTagName('head')[0].appendChild(script);
}

/**
 * indicate that loading has finished, and display the total loading time
 */
function finishLoading() {
	// remove globals used during loading phase so as not to clutter the memory, if even only by a small amount
	delete object;
	console.log("RyConsole: Loading complete! Total load time: " + (new Date().getTime() / 1000 - startTime.getTime() / 1000).toFixed(2).toString() + " seconds.");
	delete startTime;
}

/**
 * load an image asset from the input path, setting the callback function to the input callback
 * @param path: the path from which to load the image asset
 * @param name: the name that should be used when referencing the image in the GameManager images dict
 * @param callback: the callback function to be called once the image has finished loading
 */
function loadImageAsset(path, name, callback) {
	const img = document.createElement('img');

	if (callback != null) {
		img.onload = callback;
	}

	GameManager.images[name] = img;
	img.src = path;
}

/**
 * load a sound asset from the input path, setting the callback function to the input callback
 * @param path: the path from which to load the sound asset
 * @param name: the name that should be used when referencing the sound in the GameManager sounds dict
 * @param callback:  the callback function to be called once the sound has finished loading
 */
function loadSoundAsset(path, name, callback) {
	const snd = document.createElement('audio');
	let srcType = ".ogg";
	// use ogg if supported, otherwise fall back to mp4 (cover all modern browsers)
	if (!(snd.canPlayType && snd.canPlayType('audio/ogg'))) {
		srcType = ".m4a";
	}

	if (callback != null) {
		snd.oncanplay = callback(srcType);
	}

	GameManager.sounds[name] = snd;

	snd.src = path + srcType;
}

/**
 * load in the asset file, to begin the chain of asset loading
 */
function loadAssetFile() {
	loadScriptAsset("assets.js", loadRygame);
}

/**
 * load in the main rygame JS file
 * @returns
 */
function loadRygame() {
	console.log("RyConsole: 'assets.js' successfully loaded from directory '' as type 'js'");
	assetObject = object;
	this.object = null;

	// clear the lower portion of the canvas and update the loading status to display rygame.js
	ctx.fillStyle = "black";
	ctx.fillRect(0, 400, canvas.width, 200);
	ctx.fillStyle = 'white';
	ctx.fillText("loading rygame.js", 20, 580);

	loadScriptAsset("rygame.js", loadAssets);
}

/**
 * begin loading assets one by one from assets.js
 */
function loadAssets() {
	console.log("RyConsole: 'rygame.js' successfully loaded from directory '' as type 'js'");
	GameManager.scriptObjects["assets.js"] = assetObject;
	assetObject = null;
	this.object = null;
	loadAssetNext();
}

/**
 * load the next asset from assets.js
 * @param fileExtension: the file extension of the previously loaded asset
 * @returns
 */
function loadAssetNext(fileExtension) {
	if (assetNum !== -1) {
		console.log("RyConsole: '" + GameManager.scriptObjects["assets.js"].assets[assetNum][2] + (typeof fileExtension === 'object' ? "" : fileExtension) +
			"' successfully loaded from directory '" + GameManager.scriptObjects["assets.js"].assets[assetNum][1] + "' as type '" +
			GameManager.scriptObjects["assets.js"].assets[assetNum][0] + "'");
	}
	if (lastScriptName !== "") {
		// if the most recently loaded JS file contained an object, store it in the GameManager
		if (object != null) {
			GameManager.scriptObjects[lastScriptName] = object;
			this.object = null;
		}
		lastScriptName = "";
	}
	assetNum++;
	if (assetNum < GameManager.scriptObjects["assets.js"].assets.length) {
		const curAsset = GameManager.scriptObjects["assets.js"].assets[assetNum];
		if (overrideLoadingScreen) {
			overrideLoadingScreen(assetNum, GameManager.scriptObjects["assets.js"].assets.length);
		} else {
			ctx.fillStyle = "black";
			ctx.fillRect(0, 400, canvas.width, 200);
			ctx.fillStyle = 'white';
			// update the loading text to the name of the next file, appending .ogg as the default extension for sound files
			let loadString = "loading " + curAsset[2] + (curAsset[0] === "snd" ? ".ogg" : "");
			// remove 'undefined' from the end of the loading string if it gets appended in the browser
			if (loadString.slice(-9) === "undefined") {
				loadString = loadString.slice(0, -9);
			}
			ctx.fillText(loadString, 20, 580);

		}

		let appendString = "";
		if (curAsset[1] !== "") {
			appendString += curAsset[1] + "/";
		}
		if (curAsset[0] === "js") {
			lastScriptName = curAsset[2];
			loadScriptAsset(appendString + curAsset[2], loadAssetNext);
		} else if (curAsset[0] === "img") {
			loadImageAsset(appendString + curAsset[2], curAsset[2], loadAssetNext);
		} else if (curAsset[0] === "snd") {
			loadSoundAsset(appendString + curAsset[2], curAsset[2], loadAssetNext);
		}
	} else {
		finishLoading();
	}

}

// if a script assigns a function to this variable, the function will be called when refreshing the screen after each asset load
overrideLoadingScreen = null;

// Any JS file containing an object named 'object' will have the contents of that object stored in GameManager.scriptObjects
// if the file contains additional code, it will still be executed immediately as normal. Example: object = { list : [0,1,7] };
object = null;
let assetObject = null;

let assetNum = -1;
let lastScriptName = "";
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// clear the screen to black
ctx.fillStyle = "black";
ctx.fillRect(0, 0, canvas.width, canvas.height);

// draw the loading title
ctx.font = "74px Arial";
ctx.fillStyle = 'white';
ctx.fillText("Loading Rock Raiders...", 5, 310);

// hard-code the first loading message as assets will always be stored in assets.js
ctx.font = "30px Arial";
ctx.fillStyle = 'white';
ctx.fillText("loading assets.js", 20, 580);

// begin loading assets
startTime = new Date();
loadAssetFile();