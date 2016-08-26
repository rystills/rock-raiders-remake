var urlBase = document.URL.substring(0,document.URL.lastIndexOf("/")).split("%20").join(" ") + "/"; //remove the "xyz.html" segment of the url
console.log("RyConsole: current directory detected as '" + urlBase + "'");

function loadScriptAsset(url, callback) //note: this function is partially copied from a stackOverflow answer, hence the out of character comments
    {
    // Adding the script tag to the head as suggested before
    var head = document.getElementsByTagName('head')[0];
    var script = document.createElement('script');
    script.type = 'text/javascript';
    
    if (callback != null) {
    	//script.onreadystatechange = callback;
        script.onload = callback;
    }
    
    script.src = url;

    // Then bind the event to the callback function.
    // There are several events for cross browser compatibility.
    
    // Fire the loading
    head.appendChild(script);
}
//TODO: CLEAN UP THESE MESSY FUNCTIONS. THEYRE FROM THE OLD HTML.
function loadImageAsset(url, name, callback) {
	//var head = document.getElementsByTagName('head')[0];
	var img = document.createElement('IMG');
	
	if (callback != null) {
    	//img.onreadystatechange = callback;
        img.onload = callback;
    }
	
	 GameManager.images[name] = img;
	
	img.src = url;
	//head.appendChild(img);
}
function loadSoundAsset(urlNoExt, name, callback) {
	var snd = document.createElement('audio');
	var srcType = ".ogg";
	if (!(snd.canPlayType && snd.canPlayType('audio/ogg'))) { //use ogg if supported, otherwise fall back to mp4 (cover all modern browsers)
		srcType = ".m4a";
	}
	
	if (callback != null) {
		snd.oncanplay = callback(srcType);
    }
	
	GameManager.sounds[name] = snd;
	
	snd.src = urlNoExt + srcType;
}

var loadAssetFile = function() {
	//load in the asset file
	loadScriptAsset("assets.js", loadRygame);
};
var loadRygame = function() {
	console.log("RyConsole: 'assets.js' successfully loaded from directory '' as type 'js'");
	assetObject = object;
	object = null;
	
	ctx.fillStyle = "black";
	ctx.fillRect(0,400,canv.width,200);
	ctx.fillStyle = 'white';
	ctx.fillText("loading rygame.js",20,580);	
	
	loadScriptAsset(urlBase + "rygame.js", loadAssets);
};
var loadAssets = function() {
	console.log("RyConsole: 'rygame.js' successfully loaded from directory '' as type 'js'");
	GameManager.scriptObjects["assets.js"] = assetObject;
	assetObject = null;
	object = null;
	loadAssetNext();
	
};
var loadAssetNext = function(fileExtension) {
	if (assetNum != -1) {
		console.log("RyConsole: '" + GameManager.scriptObjects["assets.js"].assets[assetNum][2] + (typeof fileExtension == 'undefined' ? "" : fileExtension) + "' successfully loaded from directory '" + GameManager.scriptObjects["assets.js"].assets[assetNum][1] + "' as type '" + GameManager.scriptObjects["assets.js"].assets[assetNum][0] + "'");
	}
	if (lastScriptName != "") {
		if (object != null) { //a script doesn't have to have an object to store in the GameManager. if it doesn't have one, don't do anything
			GameManager.scriptObjects[lastScriptName] = object;
			object = null;
		}
		lastScriptName = "";
	}
	assetNum++;
	if (assetNum < GameManager.scriptObjects["assets.js"].assets.length) {
		
		ctx.fillStyle = "black";
		ctx.fillRect(0,400,canv.width,200);
		ctx.fillStyle = 'white';
		ctx.fillText("loading " + GameManager.scriptObjects["assets.js"].assets[assetNum][2] + (typeof fileExtension == 'undefined' ? "" : fileExtension),20,580);	
		
		appendString = "";
		if (GameManager.scriptObjects["assets.js"].assets[assetNum][1] != "") {
			appendString += GameManager.scriptObjects["assets.js"].assets[assetNum][1] + "/";
		}
		if (GameManager.scriptObjects["assets.js"].assets[assetNum][0] == "js") {
			lastScriptName = GameManager.scriptObjects["assets.js"].assets[assetNum][2];
			loadScriptAsset(urlBase + appendString + GameManager.scriptObjects["assets.js"].assets[assetNum][2], loadAssetNext);
		}
		else if (GameManager.scriptObjects["assets.js"].assets[assetNum][0] == "img") {
			loadImageAsset(urlBase  + appendString + GameManager.scriptObjects["assets.js"].assets[assetNum][2], GameManager.scriptObjects["assets.js"].assets[assetNum][2], loadAssetNext);
		}
		else if (GameManager.scriptObjects["assets.js"].assets[assetNum][0] == "snd") {
			loadSoundAsset(urlBase + appendString + GameManager.scriptObjects["assets.js"].assets[assetNum][2], GameManager.scriptObjects["assets.js"].assets[assetNum][2], loadAssetNext);
		}
		
	}
	
};
object = null;
assetNum=-1;
lastScriptName = "";
var canv = document.getElementById('canvas');
var ctx = canv.getContext('2d');

ctx.fillStyle = "black";
ctx.fillRect(0,0,canv.width,canv.height);

ctx.font = "74px Arial";
ctx.fillStyle = 'white';
ctx.fillText("Loading Rock Raiders...",5,310);

ctx.font = "30px Arial";

ctx.fillStyle = 'white';
ctx.fillText("loading assets.js",20,580);
loadAssetFile();
//note that any JS file containing an object named object will have the contents of that object loaded into GameManager.scriptObjects, to be used as needed, in addition to the file being loaded in and executed immediately as normal. Example: object = { list : [0,1,7] };