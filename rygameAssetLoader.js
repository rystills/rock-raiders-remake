//var urlBase = "http:\/\/ryans.x10.mx";
//if (document.URL.slice(0,5) == "file:") { //mirroring the change that we perform to the urls in the html file
	//urlBase = document.URL.substring(0,document.URL.lastIndexOf("site%20development")).replace("%20"," ") + "site development";
var urlBase = document.URL.substring(0,document.URL.lastIndexOf("/")).split("%20").join(" ") + "/"; //remove the "xyz.html" segment of the url
console.log("RyConsole: full directory detected as '" + urlBase + "'");
//}
function loadScriptAsset(url, callback)
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
	
	//not sure if this is necessary to do for images
	//head.appendChild(img);
}
function loadSoundAsset(url, name, callback) {
	//TODO: FILL THIS IN AS SOUNDS ARE REINTRODUCED TO RYJS
}

/*var loadGame = function() {
    var head = document.getElementsByTagName('head')[0];
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = urlBase + "rockRaiders.js";
    head.appendChild(script);
};*/
var loadAssetFile = function() {
	//load in the asset file
	loadScriptAsset("assets.js", loadRygame);
};
var loadRygame = function() {
	console.log("RyConsole: 'assets.js' successfully loaded from directory '' as type 'js'");
	assetObject = object;
	object = null;
	/*urlBase += "/";
	if (assetObject.rootDirectory != "") {
		urlBase += assetObject.rootDirectory + "/";
	}*/
	//console.log("RyConsole: URL base set to " + urlBase + " from assets.js");
	loadScriptAsset(urlBase + "rygame.js", loadAssets);
};
var loadAssets = function() {
	GameManager.scriptObjects["assets.js"] = assetObject;
	assetObject = null;
	object = null;
	loadAssetNext();
	
};
var loadAssetNext = function() {
	if (assetNum != -1) {
		console.log("RyConsole: '" + GameManager.scriptObjects["assets.js"].assets[assetNum][2] + "' successfully loaded from directory '" + GameManager.scriptObjects["assets.js"].assets[assetNum][1] + "' as type '" + GameManager.scriptObjects["assets.js"].assets[assetNum][0] + "'");
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
loadAssetFile();
//TODO: MAKE THE GAME WORK WITHOUT HAVING TO REFRESH TO LOAD IMAGES (should be fixed now, need to verify)
//NOTE THAT IF JS FILES HAVE AN OBJECT NAMED OBJECT IT WILL BE LOADED INTO THE GAME MANAGER AS A SCRIPT OBJECT. OTHERWISE, THE CLASS WILL SIMPLY BE LOADED IN AS NORMAL. THIS MEANS YOURE FREE TO USE JS FILES NORMALLY, BUT YOU ALSO HAVE THE OPTION TO TREAT THEM LIKE SINGLE OBJECTS THAT YOURE LOADING IN (not sure if this is really justifiable as a useful feature, will have to see)