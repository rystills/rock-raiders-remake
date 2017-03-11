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
		  ["js","","loadingScreenOverride.js"], //script to override loading screen to Rock Raiders loading screen
			
		  //~images~
		  //menu resources
          ["img", "images\\menus", "MenuBGpic.png"], //main menu background
          
          //level images
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
          ["img", "images\\objects", "ore 1 (1).png"], //ore
          ["img", "images\\objects", "energy crystal 1 (1).png"], //energy crystal
          
          //spaces
          ["img", "images\\spaces", "ground 1 (1).png"], //ground
          ["img", "images\\spaces", "power path 1 (1).png"], //power path
          ["img", "images\\spaces", "lava 1 (1).png"], //lava
          ["img", "images\\spaces", "water 1 (1).png"], //water
          ["img", "images\\spaces", "energy crystal seam 1 (1).png"], //energy crystal seam
          ["img", "images\\spaces", "ore seam 1 (1).png"], //ore seam
          ["img", "images\\spaces", "recharge seam 1 (1).png"], //recharge seam
          ["img", "images\\spaces", "dirt 1 (1).png"], //dirt
          ["img", "images\\spaces", "loose rock 1 (1).png"], //loose rock
          ["img", "images\\spaces", "hard rock 1 (1).png"], //hard rock
          ["img", "images\\spaces", "solid rock 1 (1).png"], //solid rock
          ["img", "images\\spaces", "rubble 1 (1).png"], //rubble swept 0 times. 4 sweeps required to clear fully
          ["img", "images\\spaces", "rubble 2 (1).png"], //rubble swept 1 time. 3 sweeps required to clear fully
          ["img", "images\\spaces", "rubble 3 (1).png"], //rubble swept 2 times. 2 sweeps required to clear fully
          ["img", "images\\spaces", "rubble 4 (1).png"], //rubble swept 3 times. 1 sweep required to clear fully
          ["img", "images\\spaces", "building site 1 (1).png"], //building site
          ["img", "images\\spaces", "SlimySlugHole.jpg"], //hole out of which slimy slugs can emerge
          
          //buildings
          ["img", "images\\buildings", "teleport pad 1 (1).png"], //teleport pad
          ["img", "images\\buildings", "tool store 1 (1).png"], //tool store
          ["img", "images\\buildings", "power station topLeft 1 (1).png"], //top-left image for power station
          ["img", "images\\buildings", "power station topRight 1 (1).png"], //top-right image for power station
          ["img", "images\\buildings", "power station powerPath 1 (1).png"], //bottom-right image for power station - power path with resource collection bin hanging over it
          ["img", "images\\buildings", "geological center left 1 (1).png"], //left image for geological center
          ["img", "images\\buildings", "geological center right 1 (1).png"], //right image for geological center
          ["img", "images\\buildings", "docks 1 (1).png"], //docks
          ["img", "images\\buildings", "support station 1 (1).png"], //support station
          ["img", "images\\buildings", "upgrade station left 1 (1).png"], //left image for upgrade station
          ["img", "images\\buildings", "upgrade station right 1 (1).png"], //right image for upgrade station
          ["img", "images\\buildings", "ore refinery left 1 (1).png"], //left image for ore refinery
          ["img", "images\\buildings", "ore refinery right 1 (1).png"], //right image for ore refinery
          ["img", "images\\buildings", "mining laser left 1 (1).png"], //left image for mining laser
          ["img", "images\\buildings", "mining laser right 1 (1).png"], //right image for mining laser
          ["img", "images\\buildings", "super teleport topLeft 1 (1).png"], //top-left image for super teleport
          ["img", "images\\buildings", "super teleport topRight 1 (1).png"], //top-right image for super teleport
          
          //NPCs
          ["img", "images\\objects", "raider 1 (1).png"], //rock raider
          
          //buttons
          ["img", "images\\buttons", "teleport raider button 1 (1).png"], //teleport rock raider button
          ["img", "images\\buttons", "grab item button 1 (1).png"], //button to instruct a raider to pick up item (collectable, dynamite, etc..)
          ["img", "images\\buttons", "drill wall button 1 (1).png"], //button to instruct a raider to drill a wall
          ["img", "images\\buttons", "Reinforce.png"], //button to instruct a raider to reinforce a wall
          ["img", "images\\buttons", "clear rubble button 1 (1).png"], //button to instruct a raider to clear rubble
          ["img", "images\\buttons", "build power path button 1 (1).png"], //button to instruct a raider to build a power path
          ["img", "images\\buttons", "cancel selection button 1 (1).png"], //cancel selection button
          ["img", "images\\buttons", "unload minifig button 1 (1).png"], //unload minifig button (drops held object)
          ["img", "images\\buttons", "stop minifig button 1 (1).png"], //stop minifig button (stops any performed task)
          ["img", "images\\buttons", "upgrade button 1 (1).png"], //button to upgrade a raider or building
          ["img", "images\\buttons", "open building menu button 1 (1).png"], //button to open up the building menu
          
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
          ["img", "images\\buttons", "ToolStation.png"], //button to select to build tool store from building menu
          ["img", "images\\buttons", "SMteleport.png"], //button to select to build teleport pad from building menu
          ["img", "images\\buttons", "docks.png"], //button to select to build docks from building menu
          ["img", "images\\buttons", "PowerStation.png"], //button to select to build power station from building menu
          ["img", "images\\buttons", "barracks.png"], //button to select to build support station from building menu
          ["img", "images\\buttons", "Upgrade.png"], //button to select to build upgrade station from building menu
          ["img", "images\\buttons", "Geo.png"], //button to select to build geological center from building menu
          ["img", "images\\buttons", "Orerefinery.png"], //button to select to build ore refinery from building menu
          ["img", "images\\buttons", "Gunstation.png"], //button to select to build mining laser from building menu
          ["img", "images\\buttons", "LargeTeleporter.png"], //button to select to build super teleport from building menu
          
          //effects
          ["img", "images\\objects", "landslide 1 (1).png"], //image that appears during a landslide
          
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
          ["js", "classes", "HealthBar.js"], //Health Bar class
          ["js", "classes", "Raider.js"], //Raider class
          ["js", "classes", "Space.js"], //Space class
          ["js", "classes", "LandSlide.js"], //Land Slide class
          ["js", "classes", "BuildingPlacer.js"], //Widget for building-placement class
          ["js", "classes", "TileSelectedGraphic.js"], //simple class which shows the tile highlight graphic depending on selection
          ["js", "classes", "Task.js"], //Task class
          ["js", "classes", "MusicPlayer.js"], //Music Manager class
          
          //level data list files
          ["js", "levels", "levelList.js"], //list of names of playable levels, to be used by the main menu for level selection
          ["js", "levels", "objectiveText.js"], //list of objective, failure, completion, and crystalFailure messages for each level
          
          //test level files
          ["js", "levels", "test level 1.js"], //1st test level (deprecated)
          ["js", "levels", "test level 2.js"], //2nd test level (deprecated)          
          
          //level 1 files
          ["js", "levels", "Surf_01.js"], //terrain map file of first level from original game converted using map converter
          ["js", "levels", "Cror_01.js"], //cryore map file of first level from original game converted using map converter
          ["js", "levels", "High_01.js"], //surface map file of first level from original game converted using map converter
          ["js", "levels", "Info_01.js"], //info file for first level
          ["js", "levels", "Dugg_01.js"], //predug file of first level from original game converted using map converter
          ["js", "levels", "01.js"], //OL file of first level from original game converted using map converter
          ["snd", "sounds", "Misobj01"], //mission objective audio clip
          ["snd", "sounds", "suc01"], //win audio clip
          ["snd", "sounds", "fail01"], //lose audio clip
          ["snd", "sounds", "failcrys"], //lose due to too few crystals remain audio clip (eaten by monster, fallen into lava, etc..)
          
          //level 2 files
          ["js", "levels", "Surf_02.js"], //terrain map file of second level from original game converted using map converter
          ["js", "levels", "Cror_02.js"], //cryore map file of second level from original game converted using map converter
          ["js", "levels", "High_02.js"], //surface map file of second level from original game converted using map converter
          ["js", "levels", "Info_02.js"], //info file for second level
          ["js", "levels", "Dugg_02.js"], //predug file of second level from original game converted using map converter
          ["js", "levels", "02.js"], //OL file of second level from original game converted using map converter
          
          //level 3 files
          ["js", "levels", "Surf_03.js"], //terrain map file of third level from original game converted using map converter
          ["js", "levels", "Cror_03.js"], //cryore map file of third level from original game converted using map converter
          ["js", "levels", "High_03.js"], //surface map file of third level from original game converted using map converter
          ["js", "levels", "Info_03.js"], //info file for third level
          ["js", "levels", "Dugg_03.js"], //predug file of third level from original game converted using map converter
          ["js", "levels", "path_03.js"], //path file of third level from original game converted using map converter
          ["js", "levels", "Fall_02.js"], //fallin file of second level from original game converted using map converter
          ["js", "levels", "Fall_03.js"], //fallin file of third level from original game converted using map converter
          ["js", "levels", "03.js"], //OL file of third level from original game converted using map converter
          
          //core
          ["js", "", "rockRaiders.js"] //main game file (put last as this contains the main game loop)
          ]
};