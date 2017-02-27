//note that text files (such as levels or assets) should be stored in .js files and in variables rather than in text files, as text files cannot be loaded from the machine without user interference due to safety restrictions
//currently no way to dynamically load / unload, will look into this later
//load type (dir or file),file type (img, snd, or js),directory (blank = root),extension or file name (blank = all file types)
//due to security concerns, javascript cannot search a dir for files, so load type is no longer a thing
//sounds will always come in both mp4 and ogg form for browser compatibility, so don't need to specify extension here
object = {
		assets: [
		  //~images~
		  //collectables
          ["img", "images", "ore 1 (1).png"], //ore
          ["img", "images", "energy crystal 1 (1).png"], //energy crystal
          
          //spaces
          ["img", "images", "ground 1 (1).png"], //ground
          ["img", "images", "power path 1 (1).png"], //power path
          ["img", "images", "lava 1 (1).png"], //lava
          ["img", "images", "water 1 (1).png"], //water
          ["img", "images", "energy crystal seam 1 (1).png"], //energy crystal seam
          ["img", "images", "ore seam 1 (1).png"], //ore seam
          ["img", "images", "recharge seam 1 (1).png"], //recharge seam
          ["img", "images", "dirt 1 (1).png"], //dirt
          ["img", "images", "loose rock 1 (1).png"], //loose rock
          ["img", "images", "hard rock 1 (1).png"], //hard rock
          ["img", "images", "solid rock 1 (1).png"], //solid rock
          ["img", "images", "rubble 1 (1).png"], //rubble swept 0 times. 4 sweeps required to clear fully
          ["img", "images", "rubble 2 (1).png"], //rubble swept 1 time. 3 sweeps required to clear fully
          ["img", "images", "rubble 3 (1).png"], //rubble swept 2 times. 2 sweeps required to clear fully
          ["img", "images", "rubble 4 (1).png"], //rubble swept 3 times. 1 sweep required to clear fully
          ["img", "images", "building site 1 (1).png"], //building site
          
          //buildings
          ["img", "images", "teleport pad 1 (1).png"], //teleport pad
          ["img", "images", "tool store 1 (1).png"], //tool store
          ["img", "images", "power station topLeft 1 (1).png"], //top-left image for power station
          ["img", "images", "power station topRight 1 (1).png"], //top-right image for power station
          ["img", "images", "power station powerPath 1 (1).png"], //bottom-right image for power station - power path with resource collection bin hanging over it
          ["img", "images", "geological center left 1 (1).png"], //left image for geological center
          ["img", "images", "geological center right 1 (1).png"], //left image for geological center
          
          //NPCs
          ["img", "images", "raider 1 (1).png"], //rock raider
          
          //buttons
          ["img", "images", "teleport raider button 1 (1).png"], //teleport rock raider button
          ["img", "images", "grab item button 1 (1).png"], //button to instruct a raider to pick up item (collectable, dynamite, etc..)
          ["img", "images", "drill wall button 1 (1).png"], //button to instruct a raider to drill a wall
          ["img", "images", "Reinforce.png"], //button to instruct a raider to reinforce a wall
          ["img", "images", "clear rubble button 1 (1).png"], //button to instruct a raider to clear rubble
          ["img", "images", "get shovel button 1 (1).png"], //button to instruct a raider to get a shovel from the nearest toolstore
          ["img", "images", "build power path button 1 (1).png"], //button to instruct a raider to build a power path
          ["img", "images", "cancel selection button 1 (1).png"], //cancel selection button
          ["img", "images", "unload minifig button 1 (1).png"], //unload minifig button (drops held object)
          ["img", "images", "stop minifig button 1 (1).png"], //stop minifig button (stops any performed task)
          ["img", "images", "SlimySlugHole.jpg"], //hole out of which slimy slugs can emerge
          ["img", "images", "upgrade button 1 (1).png"], //button to upgrade a raider or building
          ["img", "images", "get_Hammer.png"], //button to instruct a raider to get a hammer from the nearest toolstore
          ["img", "images", "open building menu button 1 (1).png"], //button to open up the building menu
          
          //building buttons
          ["img", "images", "ToolStation.png"], //button to select to build tool store from building menu
          ["img", "images", "SMteleport.png"], //button to select to build teleport pad from building menu
          ["img", "images", "dock.png"], //button to select to build dock from building menu
          ["img", "images", "PowerStation.png"], //button to select to build power station from building menu
          ["img", "images", "barracks.png"], //button to select to build support station from building menu
          ["img", "images", "Upgrade.png"], //button to select to build upgrade station from building menu
          ["img", "images", "Geo.png"], //button to select to build geological center from building menu
          ["img", "images", "Orerefinery.png"], //button to select to build ore refinery from building menu
          ["img", "images", "Gunstation.png"], //button to select to build mining laser from building menu
          ["img", "images", "LargeTeleporter.png"], //button to select to build super teleport from building menu
          
          //effects
          ["img", "images", "landslide 1 (1).png"], //image that appears during a landslide
          
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