//note that text files (such as levels or assets) should be stored in .js files and in variables rather than in text files, as text files cannot be loaded from the machine without user interference due to safety restrictions
//currently no way to dynamically load / unload, will look into this later
//load type (dir or file),file type (img, snd, or js),directory (blank = root),extension or file name (blank = all file types)
//due to security concerns, javascript cannot search a dir for files, so load type is no longer a thing
//sounds will always come in both mp4 and ogg form for browser compatibility, so don't need to specify extension here
object = {
	assets: [
		//loading screen resources
		["img", "images\\menus", "loading screen.png"], //loading screen image
		["img", "images\\menus", "loading bar.png"], //loading bar container image
		["js", "", "loadingScreenOverride.js"], //script to override loading screen to Rock Raiders loading screen

		//~images~
		//menu resources
		["img", "images\\menus", "MenuBGpic.png"], //main menu background

		//level images
		["img", "images\\level_select", "Levelpick.png"], //level select menu background
		["img", "images\\level_select", "Tutorial01.png"], //tutorial 1 image
		["img", "images\\level_select", "Tutorial02.png"], //tutorial 2 image
		["img", "images\\level_select", "Tutorial03.png"], //tutorial 3 image
		["img", "images\\level_select", "Tutorial04.png"], //tutorial 4 image
		["img", "images\\level_select", "Tutorial05.png"], //tutorial 5 image
		["img", "images\\level_select", "Tutorial06.png"], //tutorial 6 image
		["img", "images\\level_select", "Tutorial07.png"], //tutorial 7 image
		["img", "images\\level_select", "Tutorial08.png"], //tutorial 8 image
		["img", "images\\level_select", "Level01.png"], //level 1 image
		["img", "images\\level_select", "Level02.png"], //level 2 image
		["img", "images\\level_select", "Level03.png"], //level 3 image
		["img", "images\\level_select", "Level04.png"], //level 4 image
		["img", "images\\level_select", "Level05.png"], //level 5 image
		["img", "images\\level_select", "Level06.png"], //level 6 image
		["img", "images\\level_select", "Level07.png"], //level 7 image
		["img", "images\\level_select", "Level08.png"], //level 8 image
		["img", "images\\level_select", "Level09.png"], //level 9 image
		["img", "images\\level_select", "Level10.png"], //level 10 image
		["img", "images\\level_select", "Level11.png"], //level 11 image
		["img", "images\\level_select", "Level12.png"], //level 12 image
		["img", "images\\level_select", "Level13.png"], //level 13 image
		["img", "images\\level_select", "Level14.png"], //level 14 image
		["img", "images\\level_select", "Level15.png"], //level 15 image
		["img", "images\\level_select", "Level16.png"], //level 16 image
		["img", "images\\level_select", "Level17.png"], //level 17 image
		["img", "images\\level_select", "Level18.png"], //level 18 image
		["img", "images\\level_select", "Level19.png"], //level 19 image
		["img", "images\\level_select", "Level20.png"], //level 20 image
		["img", "images\\level_select", "Level21.png"], //level 21 image
		["img", "images\\level_select", "Level22.png"], //level 22 image
		["img", "images\\level_select", "Level23.png"], //level 23 image
		["img", "images\\level_select", "Level24.png"], //level 24 image
		["img", "images\\level_select", "Level25.png"], //level 25 image

		//collectables
		["img", "images\\objects", "ore.png"], //ore
		["img", "images\\objects", "energy crystal.png"], //energy crystal

		//vehicle images
		["img", "images\\vehicles", "hover scout.png"], //hover scout
		["img", "images\\vehicles", "small digger.png"], //small digger
		["img", "images\\vehicles", "small transport truck.png"], //small transport truck

		//other holdable objects
		["img", "images\\objects", "dynamite.png"], //dynamite

		//effects
		["img", "images\\effects", "dynamite explosion.png"], //explosion created by a dynamite blast

		//small vehicle buttons
		["img", "images\\vehicles", "make hoverboard.png"], //make hoverscout button
		["img", "images\\vehicles", "make SmallCat.png"], //make rapid rider button
		["img", "images\\vehicles", "make SmallDigger.png"], //make small digger button
		["img", "images\\vehicles", "make SmallHeli.png"], //make tunnel scout button
		["img", "images\\vehicles", "make SmallMWP.png"], //make small mobile laser cutter button
		["img", "images\\vehicles", "make SmallTruck.png"], //make small transport truck button

		//large vehicle buttons
		["img", "images\\vehicles", "make Bulldozer.png"], //make loader dozer button
		["img", "images\\vehicles", "make LargeCatamaran.png"], //make cargo carrier button
		["img", "images\\vehicles", "make largeDigger.png"], //make large digger button
		["img", "images\\vehicles", "make LargeMWP.png"], //make large mobile laser cutter button
		["img", "images\\vehicles", "make WalkerDigger.png"], //make granite grinder button

		//spaces
		["img", "images\\spaces", "ground.png"], //ground
		["img", "images\\spaces", "building power path.png"], //power path that is part of a building
		["img", "images\\spaces", "power path building site.png"], //building site for a lone (non-building) power path
		["img", "images\\spaces", "power path.png"], //power path created by the player (not part of a building)
		["img", "images\\spaces", "lava.png"], //lava
		["img", "images\\spaces", "water.png"], //water
		["img", "images\\spaces", "energy crystal seam.png"], //energy crystal seam
		["img", "images\\spaces", "ore seam.png"], //ore seam
		["img", "images\\spaces", "recharge seam.png"], //recharge seam
		["img", "images\\spaces", "dirt.png"], //dirt
		["img", "images\\spaces", "loose rock.png"], //loose rock
		["img", "images\\spaces", "hard rock.png"], //hard rock
		["img", "images\\spaces", "solid rock.png"], //solid rock
		["img", "images\\spaces", "rubble 1.png"], //rubble swept 0 times. 4 sweeps required to clear fully
		["img", "images\\spaces", "rubble 2.png"], //rubble swept 1 time. 3 sweeps required to clear fully
		["img", "images\\spaces", "rubble 3.png"], //rubble swept 2 times. 2 sweeps required to clear fully
		["img", "images\\spaces", "rubble 4.png"], //rubble swept 3 times. 1 sweep required to clear fully
		["img", "images\\spaces", "building site.png"], //building site
		["img", "images\\spaces", "SlimySlugHole.png"], //hole out of which slimy slugs can emerge
		["img", "images\\spaces", "reinforcement.png"], //reinforcement overlay for reinforced walls

		//buildings
		["img", "images\\buildings", "teleport pad.png"], //teleport pad
		["img", "images\\buildings", "tool store.png"], //tool store
		["img", "images\\buildings", "power station topLeft.png"], //top-left image for power station
		["img", "images\\buildings", "power station topRight.png"], //top-right image for power station
		["img", "images\\buildings", "power station powerPath.png"], //bottom-right image for power station - power path with resource collection bin hanging over it
		["img", "images\\buildings", "geological center left.png"], //left image for geological center
		["img", "images\\buildings", "geological center right.png"], //right image for geological center
		["img", "images\\buildings", "docks.png"], //docks
		["img", "images\\buildings", "support station.png"], //support station
		["img", "images\\buildings", "upgrade station left.png"], //left image for upgrade station
		["img", "images\\buildings", "upgrade station right.png"], //right image for upgrade station
		["img", "images\\buildings", "ore refinery left.png"], //left image for ore refinery
		["img", "images\\buildings", "ore refinery right.png"], //right image for ore refinery
		["img", "images\\buildings", "mining laser left.png"], //left image for mining laser
		["img", "images\\buildings", "mining laser right.png"], //right image for mining laser
		["img", "images\\buildings", "super teleport topLeft.png"], //top-left image for super teleport
		["img", "images\\buildings", "super teleport topRight.png"], //top-right image for super teleport

		//NPCs
		["img", "images\\objects", "raider.png"], //rock raider

		//buttons
		["img", "images\\buttons", "teleport raider button.png"], //teleport rock raider button
		["img", "images\\buttons", "grab item button.png"], //button to instruct a raider to pick up item (collectable, dynamite, etc..)
		["img", "images\\buttons", "drill wall button.png"], //button to instruct a raider to drill a wall
		["img", "images\\buttons", "Reinforce.png"], //button to instruct a raider to reinforce a wall
		["img", "images\\buttons", "clear rubble button.png"], //button to instruct a raider to clear rubble
		["img", "images\\buttons", "build power path button.png"], //button to instruct a raider to build a power path
		["img", "images\\buttons", "cancel selection button.png"], //cancel selection button
		["img", "images\\buttons", "unload minifig button.png"], //unload minifig button (drops held object)
		["img", "images\\buttons", "stop minifig button.png"], //stop minifig button (stops any performed task)
		["img", "images\\buttons", "upgrade button.png"], //button to upgrade a raider or building
		["img", "images\\buttons", "open building menu button.png"], //button to open up the building menu
		["img", "images\\buttons", "open large vehicle menu button.png"], //button to open up the large vehicle menu
		["img", "images\\buttons", "open small vehicle menu button.png"], //button to open up the small vehicle menu
		["img", "images\\buttons", "use dynamite.png"], //button to instruct a raider to blow up a wall using dynamite
		["img", "images\\buttons", "exit vehicle.png"], //button to instruct a raider to exit the current vehicle

		//grab item buttons
		["img", "images\\buttons", "getTool.png"], //button to open the 'get tool' raider submenu
		["img", "images\\buttons", "get_Drill.png"], //button to instruct a raider to get a drill from the nearest toolstore
		["img", "images\\buttons", "get_Shovel.png"], //button to instruct a raider to get a shovel from the nearest toolstore
		["img", "images\\buttons", "get_Hammer.png"], //button to instruct a raider to get a hammer from the nearest toolstore
		["img", "images\\buttons", "get_Wrench.png"], //button to instruct a raider to get a wrench from the nearest toolstore
		["img", "images\\buttons", "get_Freezer.png"], //button to instruct a raider to get a freezer beam from the nearest toolstore
		["img", "images\\buttons", "get_Pusher.png"], //button to instruct a raider to get a pusher beam from the nearest toolstore
		["img", "images\\buttons", "get_Laser.png"], //button to instruct a raider to get a laser beam from the nearest toolstore
		["img", "images\\buttons", "get_Sonic_Blaster.png"], //button to instruct a raider to get a sonic blaster from the nearest toolstore

		//held tools and skills images
		["img", "images\\skills_and_tools", "have drill.png"], //image indicating that a raider is currently carrying a drill in this tool slot
		["img", "images\\skills_and_tools", "have shovel.png"], //image indicating that a raider is currently carrying a shovel in this tool slot
		["img", "images\\skills_and_tools", "have hammer.png"], //image indicating that a raider is currently carrying a hammer in this tool slot
		["img", "images\\skills_and_tools", "have wrench.png"], //image indicating that a raider is currently carrying a wrench in this tool slot
		["img", "images\\skills_and_tools", "have freezer.png"], //image indicating that a raider is currently carrying a freezer beam in this tool slot
		["img", "images\\skills_and_tools", "have pusher.png"], //image indicating that a raider is currently carrying a pusher beam in this tool slot
		["img", "images\\skills_and_tools", "have laser.png"], //image indicating that a raider is currently carrying a laser beam in this tool slot
		["img", "images\\skills_and_tools", "have blaster.png"], //image indicating that a raider is currently carrying a sonic blaster in this tool slot
		["img", "images\\skills_and_tools", "have am nothing.png"], //image indicating that a raider is not currently carrying a tool or does not have a skill in this slot
		["img", "images\\skills_and_tools", "am pilot.png"], //image indicating that a raider is a pilot
		["img", "images\\skills_and_tools", "am driver.png"], //image indicating that a raider is a driver
		["img", "images\\skills_and_tools", "am explosives expert.png"], //image indicating that a raider is an explosives expert
		["img", "images\\skills_and_tools", "am sailor.png"], //image indicating that a raider is a sailor
		["img", "images\\skills_and_tools", "am geologist.png"], //image indicating that a raider is a geologist
		["img", "images\\skills_and_tools", "am engineer.png"], //image indicating that a raider is an engineer

		//building buttons
		["img", "images\\buttons", "make ToolStation.png"], //button to select to build tool store from building menu
		["img", "images\\buttons", "make SMteleport.png"], //button to select to build teleport pad from building menu
		["img", "images\\buttons", "make docks.png"], //button to select to build docks from building menu
		["img", "images\\buttons", "make PowerStation.png"], //button to select to build power station from building menu
		["img", "images\\buttons", "make barracks.png"], //button to select to build support station from building menu
		["img", "images\\buttons", "make Upgrade.png"], //button to select to build upgrade station from building menu
		["img", "images\\buttons", "make Geo.png"], //button to select to build geological center from building menu
		["img", "images\\buttons", "make Orerefinery.png"], //button to select to build ore refinery from building menu
		["img", "images\\buttons", "make Gunstation.png"], //button to select to build mining laser from building menu
		["img", "images\\buttons", "make LargeTeleporter.png"], //button to select to build super teleport from building menu

		//interface
		["img", "images\\overlay", "CrystalSideBar.png"], //right side overlay showing crystal and ore count
		["img", "images\\overlay", "CrystalSideBar_Ore.png"], //image representing a single piece of ore on the overlay
		["img", "images\\overlay", "NoSmallCrystal.png"], //image representing no energy crystal on the overlay
		["img", "images\\overlay", "SmallCrystal.png"], //image representing a single energy crystal on the overlay

		//effects
		["img", "images\\objects", "landslide.png"], //image that appears during a landslide

		//~sounds~
		["snd", "sounds", "Crystaldrop"], //drop crystal
		["snd", "sounds", "Rockdrop"], //drop ore
		["snd", "sounds", "drtdrillc"], //raider drill (drill any wall type)
		["snd", "sounds", "dig"], //raider shovel (sweep rubble)
		["snd", "sounds", "ROKBREK1"], //wall break sound
		["snd", "sounds", "song1-reduced noise"], //song 1
		["snd", "sounds", "song2-reduced noise"], //song 2
		["snd", "sounds", "song3-reduced noise"], //song 3
		["snd", "sounds", "menu theme"], //menu song
		["snd", "sounds", "score screen"], //score screen song
		["snd", "sounds", "hurt1"], //raider hurt sound 1
		["snd", "sounds", "lanslide"], //landslide sound

		//~scripts~
		["js", "classes", "Collectable.js"], //Collectable class
		["js", "classes", "Dynamite.js"], //Dynamite class
		["js", "classes", "HealthBar.js"], //Health Bar class
		["js", "classes", "Raider.js"], //Raider class
		["js", "classes", "Space.js"], //Space class
		["js", "classes", "LandSlide.js"], //Land Slide class
		["js", "classes", "BuildingPlacer.js"], //Widget for building-placement class
		["js", "classes", "TileSelectedGraphic.js"], //simple class which shows the tile highlight graphic depending on selection
		["js", "classes", "Task.js"], //Task class
		["js", "classes", "MusicPlayer.js"], //Music Manager class

		//vehicles
		["js", "classes\\vehicles", "Vehicle.js"], //Vehicle base class
		["js", "classes\\vehicles", "HoverScout.js"], //hover scout class
		["js", "classes\\vehicles", "SmallDigger.js"], //small digger class
		["js", "classes\\vehicles", "SmallTransportTruck.js"], //small transport truck class

		//level data list files
		["js", "levels", "levels.js"], //list of names of playable levels, to be used by the main menu for level selection

		//core
		["js", "", "rockRaiders.js"] //main game file (put last as this contains the main game loop)
	]
};