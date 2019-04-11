// note that text files (such as levels or assets) should be stored in .js files and in variables rather than in text files, as text files cannot be loaded from the machine without user interference due to safety restrictions
// currently no way to dynamically load / unload, will look into this later
// load type (dir or file),file type (img, snd, or js),directory (blank = root),extension or file name (blank = all file types)
// due to security concerns, javascript cannot search a dir for files, so load type is no longer a thing
// sounds will always come in both mp4 and ogg form for browser compatibility, so don't need to specify extension here
object = {
	assets: [
		["js", "gui", "BitmapFont.js"], // important, must be loaded before creating UI elements
		["js", "", "nerp.js"],
		["wad0nerp", "Levels", "nerpnrn.h"], // included by other nrn scripts

		// ~images~
		// menu resources
		["wad0bmp", "Interface/FrontEnd/MenuBGpic.bmp"], // main menu background
		["wad0font", "Interface/FrontEnd/Menu_Font_LO.bmp"], // main menu font
		["wad0font", "Interface/FrontEnd/Menu_Font_HI.bmp"], // (highlighted) main menu font
		["wad0font", "Interface/Fonts/Font5_Hi.bmp"],
		["wad0bmp", "Interface/Frontend/LP_Normal.bmp"], // back button in level select view
		["wad0bmp", "Interface/Frontend/LP_Glow.bmp"], // back button in level select view (hovered)
		["wad0bmp", "Interface/Frontend/LP_Dull.bmp"], // back button in level select view (pressed)
		["wad0alpha", "Interface/Frontend/LowerPanel.bmp"], // lower panel in level select view
		["wad0bmp", "Interface/Frontend/SaveLoad.bmp"],

		// level images
		["wad0bmp", "Interface/LEVELPICKER/Levelpick.bmp"], // level select menu background
		["wad0bmp", "Interface/LEVELPICKER/LevelpickT.bmp"], // tutorial level select menu background

		// pointers/cursors
		["wad0alpha", "Interface/Pointers/Aclosed.bmp"],

		// collectables
		["img", "images\\objects", "ore.png"], // ore
		["img", "images\\objects", "energy crystal.png"], // energy crystal

		// vehicle images
		["img", "images\\vehicles", "hover scout.png"], // hover scout
		["img", "images\\vehicles", "small digger.png"], // small digger
		["img", "images\\vehicles", "small transport truck.png"], // small transport truck

		// other holdable objects
		["img", "images\\objects", "dynamite.png"], // dynamite

		// effects
		["img", "images\\effects", "dynamite explosion.png"], // explosion created by a dynamite blast

		// spaces
		["img", "images\\spaces", "building site.png"], // building site

		// buildings
		["img", "images\\buildings", "teleport pad.png"], // teleport pad
		["img", "images\\buildings", "tool store.png"], // tool store
		["img", "images\\buildings", "power station topLeft.png"], // top-left image for power station
		["img", "images\\buildings", "power station topRight.png"], // top-right image for power station
		["img", "images\\buildings", "power station powerPath.png"], // bottom-right image for power station - power path with resource collection bin hanging over it
		["img", "images\\buildings", "geological center left.png"], // left image for geological center
		["img", "images\\buildings", "geological center right.png"], // right image for geological center
		["img", "images\\buildings", "docks.png"], // docks
		["img", "images\\buildings", "support station.png"], // support station
		["img", "images\\buildings", "upgrade station left.png"], // left image for upgrade station
		["img", "images\\buildings", "upgrade station right.png"], // right image for upgrade station
		["img", "images\\buildings", "ore refinery left.png"], // left image for ore refinery
		["img", "images\\buildings", "ore refinery right.png"], // right image for ore refinery
		["img", "images\\buildings", "mining laser left.png"], // left image for mining laser
		["img", "images\\buildings", "mining laser right.png"], // right image for mining laser
		["img", "images\\buildings", "super teleport topLeft.png"], // top-left image for super teleport
		["img", "images\\buildings", "super teleport topRight.png"], // top-right image for super teleport

		// NPCs
		["img", "images\\objects", "raider.png"], // rock raider

		// held tools and skills images FIXME replace with wadbmp
		["img", "images\\skills_and_tools", "have drill.png"], // image indicating that a raider is currently carrying a drill in this tool slot
		["img", "images\\skills_and_tools", "have shovel.png"], // image indicating that a raider is currently carrying a shovel in this tool slot
		["img", "images\\skills_and_tools", "have hammer.png"], // image indicating that a raider is currently carrying a hammer in this tool slot
		["img", "images\\skills_and_tools", "have wrench.png"], // image indicating that a raider is currently carrying a wrench in this tool slot
		["img", "images\\skills_and_tools", "have freezer.png"], // image indicating that a raider is currently carrying a freezer beam in this tool slot
		["img", "images\\skills_and_tools", "have pusher.png"], // image indicating that a raider is currently carrying a pusher beam in this tool slot
		["img", "images\\skills_and_tools", "have laser.png"], // image indicating that a raider is currently carrying a laser beam in this tool slot
		["img", "images\\skills_and_tools", "have blaster.png"], // image indicating that a raider is currently carrying a sonic blaster in this tool slot
		["img", "images\\skills_and_tools", "have am nothing.png"], // image indicating that a raider is not currently carrying a tool or does not have a skill in this slot
		["img", "images\\skills_and_tools", "am pilot.png"], // image indicating that a raider is a pilot
		["img", "images\\skills_and_tools", "am driver.png"], // image indicating that a raider is a driver
		["img", "images\\skills_and_tools", "am explosives expert.png"], // image indicating that a raider is an explosives expert
		["img", "images\\skills_and_tools", "am sailor.png"], // image indicating that a raider is a sailor
		["img", "images\\skills_and_tools", "am geologist.png"], // image indicating that a raider is a geologist
		["img", "images\\skills_and_tools", "am engineer.png"], // image indicating that a raider is an engineer

		// interface
		["wad0alpha", "Interface/RightPanel/CrystalSideBar.bmp"], // right side overlay showing crystal and ore count
		["wad0alpha", "Interface/RightPanel/CrystalSideBar_Ore.bmp"], // image representing a single piece of ore on the overlay
		["wad0alpha", "Interface/RightPanel/NoSmallCrystal.bmp"], // image representing no energy crystal on the overlay
		["wad0alpha", "Interface/RightPanel/SmallCrystal.bmp"], // image representing a single energy crystal on the overlay
		["wad0alpha", "Interface/RightPanel/UsedCrystal.bmp"], // image representing a single in use energy crystal on the overlay

		// effects
		["img", "images\\objects", "landslide.png"], // image that appears during a landslide

		// ~sounds~
		["snd", "sounds", "Crystaldrop"], // drop crystal
		["snd", "sounds", "Rockdrop"], // drop ore
		["snd", "sounds", "drtdrillc"], // raider drill (drill any wall type)
		["snd", "sounds", "dig"], // raider shovel (sweep rubble)
		["snd", "sounds", "ROKBREK1"], // wall break sound
		["snd", "sounds", "song1-reduced noise"], // song 1
		["snd", "sounds", "song2-reduced noise"], // song 2
		["snd", "sounds", "song3-reduced noise"], // song 3
		["snd", "sounds", "menu theme"], // menu song
		["snd", "sounds", "score screen"], // score screen song
		["snd", "sounds", "hurt1"], // raider hurt sound 1
		["snd", "sounds", "lanslide"], // landslide sound

		// ~scripts~
		["js", "classes", "Collectable.js"], // Collectable class
		["js", "classes", "Dynamite.js"], // Dynamite class
		["js", "classes", "HealthBar.js"], // Health Bar class
		["js", "classes", "Raider.js"], // Raider class
		["js", "classes", "Space.js"], // Space class
		["js", "classes", "LandSlide.js"], // Land Slide class
		["js", "classes", "BuildingPlacer.js"], // Widget for building-placement class
		["js", "classes", "TileSelectedGraphic.js"], // simple class which shows the tile highlight graphic depending on selection
		["js", "classes", "Task.js"], // Task class
		["js", "classes", "MusicPlayer.js"], // Music Manager class

		// vehicles
		["js", "classes\\vehicles", "Vehicle.js"], // Vehicle base class
		["js", "classes\\vehicles", "HoverScout.js"], // hover scout class
		["js", "classes\\vehicles", "SmallDigger.js"], // small digger class
		["js", "classes\\vehicles", "SmallTransportTruck.js"], // small transport truck class

		// gui element scripts
		// load scripts in the end, so images have been loaded before and are ready to use
		["js", "gui", "MainMenu.js"], // GUI elements used in the main menu
		["js", "gui", "Ingame.js"], // GUI elements used in-game
		["js", "gui", "ScoreScreen.js"] // GUI elements used in the score screen
	]
};