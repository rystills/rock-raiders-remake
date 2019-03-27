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
	const img = new Image();

	img.onload = function () {
		const context = createContext(img.naturalWidth, img.naturalHeight, false);
		context.drawImage(img, 0, 0);
		GameManager.images[name] = context;
		if (callback != null) {
			callback();
		}
	};

	GameManager.images[name] = img;
	img.src = path;
}

function loadAlphaImageAsset(path, name, callback) {
	const img = new Image();

	img.onload = function () {
		const context = createContext(img.naturalWidth, img.naturalHeight, false);
		context.drawImage(img, 0, 0);
		const imgData = context.getImageData(0, 0, context.width, context.height);
		for (let n = 0; n < imgData.data.length; n += 4) {
			if (imgData.data[n] <= 2 && imgData.data[n + 1] <= 2 && imgData.data[n + 2] <= 2) { // some bitmaps contain 2/2/2 as "black" alpha background
				imgData.data[n + 3] = 0;
			}
		}
		context.putImageData(imgData, 0, 0);
		GameManager.images[name] = context;
		if (callback != null) {
			callback();
		}
	};

	img.src = path;
}

function loadConfigurationAsset(path, name, callback) {
	const result = {};
	const ancestry = [];
	let activeObject = result;
	console.log("Parsing configuration from " + path);
	const xhr = new XMLHttpRequest();
	xhr.open('GET', path, true);
	xhr.responseType = 'arraybuffer'; // jQuery cant handle response type arraybuffer
	xhr.onload = function () {
		if (this.status === 200) {
			const data = this.response;
			const buffer = new Uint8Array(data);
			let isComment = false;
			let keyVal = 0; // 0 = looking for key, 1 = inside key, 1 = looking for value, 2 = inside value
			let key = "";
			let value = "";
			// debug output is a bad idea here, buffer size is about 232.611 characters and has 6781 lines
			for (let seek = 0; seek < buffer.length; seek++) {
				let charCode = buffer[seek];
				if (charCode === 123 && key === "FullName") { // dirty workaround but in the original file { (123) was used instead of Ä (142)
					charCode = 142;
				}
				let charStr = String.fromCharCode(charCode);
				if (charCode === 130) {
					charStr = "ä";
				} else if (charCode === 142) {
					charStr = "Ä";
				} else if (charCode === 162) {
					charStr = "ö";
				} else if (charCode === 167) {
					charStr = "Ü";
				} else if (charCode === 171) {
					charStr = "ü";
				} else if (charCode === 195) {
					charStr = "ß";
				}
				if (charStr === ";") {
					isComment = true;
				} else if (charCode === 10 || charCode === 13) {
					isComment = false;
				}
				if (!isComment) {
					if (charCode > 32) { // not a whitespace
						if (keyVal === 0) { // looking for key
							if (charStr === "}") {
								activeObject = ancestry.pop();
							} else {
								keyVal++;
								key = charStr;
							}
						} else if (keyVal === 1) { // inside key
							key += charStr;
						} else if (keyVal === 2) { // looking for value
							if (charStr === "{") { // start of a new object key is identifier
								ancestry.push(activeObject);
								activeObject = {};
								ancestry[ancestry.length - 1][key] = activeObject;
								keyVal = 0; // start looking for a key again
							} else {
								keyVal++;
								value = charStr;
							}
						} else if (keyVal === 3) { // inside value
							value += charStr;
						}
					} else { // some whitespace
						if (keyVal === 1) {
							keyVal++;
						} else if (keyVal === 3) {
							keyVal = 0;
							const splitVal = value.replace(/\\/g, "/").split(/[:|]/);
							activeObject[key] = splitVal.length > 1 ? splitVal : splitVal[0];
						}
					}
				}
			}
			GameManager.configuration = result;
			if (callback != null) {
				callback();
			}
		}
	};
	xhr.send();
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
		snd.oncanplay = callback(srcType); // FIXME this is NOT executed onload but immediately, callback() is an actual function call
	}

	GameManager.sounds[name] = snd;
	snd.src = path + srcType;
}

/**
 * load in the asset file, to begin the chain of asset loading
 */
function loadAssetFile() {
	// begin loading assets
	startTime = new Date();
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

	setLoadingMessage("loading rygame.js");
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
 * @returns
 */
function loadAssetNext() {
	if (assetNum !== -1 && this.debug) {
		console.log("RyConsole: '" + GameManager.scriptObjects["assets.js"].assets[assetNum][2] +
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
			// update the loading text to the name of the next file, appending .ogg as the default extension for sound files
			let loadString = "loading " + curAsset[2] + (curAsset[0] === "snd" ? ".ogg" : "");
			// remove 'undefined' from the end of the loading string if it gets appended in the browser
			if (loadString.slice(-9) === "undefined") {
				loadString = loadString.slice(0, -9);
			}
			setLoadingMessage(loadString);
		}

		let appendString = "";
		if (curAsset[1] !== "") {
			appendString += curAsset[1] + "/";
		}
		if (curAsset[0] === "js") {
			lastScriptName = curAsset[2];
			loadScriptAsset(appendString + curAsset[2], loadAssetNext);
		} else if (curAsset[0] === "img") {
			loadImageAsset(appendString + curAsset[2], curAsset[2].toLowerCase(), loadAssetNext);
		} else if (curAsset[0] === "snd") {
			loadSoundAsset(appendString + curAsset[2], curAsset[2], loadAssetNext);
		} else if (curAsset[0] === "wad0bmp") {
			loadImageAsset(wad0File.getEntry(curAsset[1]), curAsset[1].toLowerCase(), loadAssetNext);
		} else if (curAsset[0] === "wad0alpha") {
			loadAlphaImageAsset(wad0File.getEntry(curAsset[1]), curAsset[1].toLowerCase(), loadAssetNext);
		} else if (curAsset[0] === "wad1txt") {
			loadConfigurationAsset(wad1File.getEntry(curAsset[1]), curAsset[1], loadAssetNext);
		}
	} else {
		finishLoading();
	}
}

/**
 * Read WAD file as binary blob from the given URL and parse it on success
 * @param url the url to the WAD file, can be local file url (file://...) too
 */
function loadWadFile(url) {
	return new Promise(resolve => {
		console.log("Loading wad file from " + url);
		const xhr = new XMLHttpRequest();
		xhr.open('GET', url, true);
		xhr.responseType = 'arraybuffer'; // jQuery cant handle response type arraybuffer
		xhr.onload = function () {
			if (this.status === 200) {
				resolve(parseWadFile(this.response));
			}
		};
		xhr.send();
	})
}

/**
 * Validate and parse the given data object as binary blob of a WAD file
 * @param data binary blob
 * @returns {WadHandler} Returns a handler for this WAD file on success
 */
function parseWadFile(data) {
	const dataView = new DataView(data);
	const buffer = new Int8Array(data);
	let pos = 0;
	if (String.fromCharCode.apply(null, buffer.slice(pos, 4)) !== "WWAD") {
		throw "Invalid WAD0 file provided";
	}
	if (this.debug)
		console.log("WAD0 file seems legit");
	pos = 4;
	const numberOfEntries = dataView.getInt32(pos, true);
	if (this.debug)
		console.log(numberOfEntries);
	pos = 8;

	const wad = new WadHandler(buffer);

	let bufferStart = pos;
	for (let i = 0; i < numberOfEntries; pos++) {
		if (buffer[pos] === 0) {
			wad.entries[i] = String.fromCharCode.apply(null, buffer.slice(bufferStart, pos)).replace(/\\/g, "/").toLowerCase();
			bufferStart = pos + 1;
			i++;
		}
	}
	if (this.debug)
		console.log(wad.entries);
	for (let i = 0; i < numberOfEntries; pos++) {
		if (buffer[pos] === 0) {
			bufferStart = pos + 1;
			i++;
		}
	}
	if (this.debug)
		console.log("Offset after absolute original names is " + pos);

	for (let i = 0; i < numberOfEntries; i++) {
		wad.fLength[i] = dataView.getInt32(pos + 8, true);
		wad.fStart[i] = dataView.getInt32(pos + 12, true);
		pos += 16;
	}
	if (this.debug) {
		console.log(wad.fLength);
		console.log(wad.fStart);
	}
	return wad;
}

/**
 * Returns the entries content by name extracted from the managed WAD file
 * @param entryName Entry name to be extracted
 * @returns {string} Returns the local object url to the extracted data
 */
WadHandler.prototype.getEntry = function (entryName) {
	entryName = entryName.toLowerCase();
	for (let i = 0; i < this.entries.length; i++) {
		if (this.entries[i] === entryName) {
			return URL.createObjectURL(new Blob([this.buffer.slice(this.fStart[i], this.fStart[i] + this.fLength[i])], {'type': 'image/bmp'}));
		}
	}
	throw "Entry '" + entryName + "' not found in wad file";
};

/**
 * Handles the extraction of single files from a bigger WAD data blob
 * @param buffer A data blob which contains the raw data in one piece
 * @constructor
 */
function WadHandler(buffer) {
	this.buffer = buffer;
	this.entries = [];
	this.fLength = [];
	this.fStart = [];
}

/**
 * Start the game by using locally provided WAD files
 */
function startGameFileLocal() {
	const wad0Url = URL.createObjectURL(document.getElementById('wad0-file').files[0]);
	const wad1Url = URL.createObjectURL(document.getElementById('wad1-file').files[0]);
	loadWadFiles(wad0Url, wad1Url);
}

/**
 * Start the game by downloading and using remotely available WAD files
 */
function startGameUrl() {
	setLoadingMessage("Downloading WAD files... please wait", 20, loadingCanvas.height - 30);
	const antiCorsPrefix = "https://cors-anywhere.herokuapp.com/"; // BAD IDEA! This enables MID attacks! But it's just a game... and nobody cares...
	loadWadFiles(antiCorsPrefix + document.getElementById('wad0-url').value, antiCorsPrefix + document.getElementById('wad1-url').value);
}

/**
 * Private helper method, which combines file loading and waits for them to become ready before continuing
 * @param wad0Url Url to parse the LegoRR0.wad file from
 * @param wad1Url Url to parse the LegoRR1.wad file from
 */
function loadWadFiles(wad0Url, wad1Url) {
	$('#wadfiles_select_modal').modal('hide');
	Promise.all([loadWadFile(wad0Url), loadWadFile(wad1Url)]).then(wadFiles => {
		wad0File = wadFiles[0];
		wad1File = wadFiles[1];
		storeFilesInCache();
		loadAssetFile();
	});
}

function openLocalCache(onopen) {
	const request = indexedDB.open("RockRaidersRemake");
	let db = null;
	request.onupgradeneeded = function (event) {
		db = event.target.result;
		if (db.objectStoreNames.contains('wadfiles')) {
			db.deleteObjectStore('wadfiles');
		}
		db.createObjectStore("wadfiles");
	};
	request.onsuccess = function (event) {
		db = db ? db : event.target.result;
		const transaction = db.transaction(["wadfiles"], "readwrite");
		const objectStore = transaction.objectStore("wadfiles");
		onopen(objectStore);
	};
}

function storeFilesInCache() {
	openLocalCache((objectStore) => {
		objectStore.put(wad0File, "wad0");
		objectStore.put(wad1File, "wad1");
		console.log("Cached files");
	});
}

function startWithCachedFiles(onerror) {
	setLoadingMessage("loading WAD files from cache");
	openLocalCache((objectStore) => {
		const request1 = objectStore.get("wad0");
		request1.onerror = onerror;
		request1.onsuccess = function () {
			if (request1.result === undefined) {
				onerror();
				return;
			}
			wad0File = new WadHandler(); // class info are runtime info and not stored in cache => use copy constructor
			for (let prop in request1.result) wad0File[prop] = request1.result[prop];
			const request2 = objectStore.get("wad1");
			request2.onerror = onerror;
			request2.onsuccess = function () {
				if (request2.result === undefined) {
					onerror();
					return;
				}
				wad1File = new WadHandler(); // class info are runtime info and not stored in cache => use copy constructor
				for (let prop in request2.result) wad1File[prop] = request2.result[prop];
				loadAssetFile();
			};
		};
	});
}

function setLoadingMessage(text) {
	// clear the lower portion of the canvas and update the loading status to display rygame.js
	loadingContext.fillStyle = "black";
	loadingContext.fillRect(0, loadingCanvas.height - 70, loadingCanvas.width, 50);
	loadingContext.fillStyle = 'white';
	loadingContext.fillText(text, 20, loadingCanvas.height - 30);
}

// if a script assigns a function to this variable, the function will be called when refreshing the screen after each asset load
overrideLoadingScreen = null;

// Any JS file containing an object named 'object' will have the contents of that object stored in GameManager.scriptObjects
// if the file contains additional code, it will still be executed immediately as normal. Example: object = { list : [0,1,7] };
object = null;
let assetObject = null;

let assetNum = -1;
let lastScriptName = "";
let wad0File;
let wad1File;

const loadingCanvas = document.getElementById('rygameCanvas');
const loadingContext = loadingCanvas.getContext('2d');

// clear the screen to black
loadingContext.fillStyle = "black";
loadingContext.fillRect(0, 0, loadingCanvas.width, loadingCanvas.height);

// draw the loading title
loadingContext.font = "48px Arial";
loadingContext.fillStyle = 'white';
loadingContext.fillText("Loading Rock Raiders", 5, loadingCanvas.height - 80);

// hard-code the first loading message as assets will always be stored in assets.js
loadingContext.font = "30px Arial";
loadingContext.fillStyle = 'white';
loadingContext.fillText("loading", 20, loadingCanvas.height - 30);
