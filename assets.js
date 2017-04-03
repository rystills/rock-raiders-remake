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
          ["img", "images\\objects", "ore 1 (1).png"], //ore
          ["img", "images\\objects", "energy crystal 1 (1).png"], //energy crystal
          
          //other holdable objects
          ["img", "images\\objects", "dynamite 1 (1).png"], //dynamite
          
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
          ["img", "images\\spaces", "SlimySlugHole.png"], //hole out of which slimy slugs can emerge
          ["img", "images\\spaces", "reinforcement 1 (1).png"], //reinforcement overlay for reinforced walls
          
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
          ["img", "images\\buttons", "use dynamite 1 (1).png"], //button to instruct a raider to blow up a wall using dynamite
          
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
          ["js", "classes", "Dynamite.js"], //Dynamite class
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
          
          //Tutorial level 1 files
          ["js", "levels", "Info_M01.js"], //info file for first tutorial level
          ["js", "levels", "M01.js"], //terrain map file of first tutorial level from original game converted using map converter
          ["js", "levels", "Dugg_M01.js"], //predug map file of first tutorial level from original game converted using map converter
          ["js", "levels", "Cror_M01.js"], //cryore map file of first tutorial level from original game converted using map converter
          ["js", "levels", "High_M01.js"], //surface map file of first tutorial level from original game converted using map converter
          ["js", "levels", "Path_M01.js"], //path map file of first tutorial level from original game converted using map converter
          ["js", "levels", "Surf_M01.js"], //terrain map file of first tutorial level from original game converted using map converter
          
          //Tutorial level 2 files
          ["js", "levels", "Info_D01.js"], //info file for second tutorial level
          ["js", "levels", "D01.js"], //terrain map file of second tutorial level from original game converted using map converter
          ["js", "levels", "Dugg_D01.js"], //predug map file of second tutorial level from original game converted using map converter
          ["js", "levels", "Cror_D01.js"], //cryore map file of second tutorial level from original game converted using map converter
          ["js", "levels", "High_D01.js"], //surface map file of second tutorial level from original game converted using map converter
          ["js", "levels", "Path_D01.js"], //path map file of second tutorial level from original game converted using map converter
          ["js", "levels", "Surf_D01.js"], //terrain map file of second tutorial level from original game converted using map converter
        
          //Tutorial level 3 files
          ["js", "levels", "Info_B01.js"], //info file for third tutorial level
          ["js", "levels", "B01.js"], //terrain map file of third tutorial level from original game converted using map converter
          ["js", "levels", "Dugg_B01.js"], //predug map file of third tutorial level from original game converted using map converter
          ["js", "levels", "Cror_B01.js"], //cryore map file of third tutorial level from original game converted using map converter
          ["js", "levels", "High_B01.js"], //surface map file of third tutorial level from original game converted using map converter
          ["js", "levels", "Path_B01.js"], //path map file of third tutorial level from original game converted using map converter
          ["js", "levels", "Surf_B01.js"], //terrain map file of third tutorial level from original game converted using map converter
          
          //Tutorial level 4 files
          ["js", "levels", "Info_M02.js"], //info file for fourth tutorial level
          ["js", "levels", "M02.js"], //terrain map file of fourth tutorial level from original game converted using map converter
          ["js", "levels", "Dugg_M02.js"], //predug map file of fourth tutorial level from original game converted using map converter
          ["js", "levels", "Cror_M02.js"], //cryore map file of fourth tutorial level from original game converted using map converter
          ["js", "levels", "High_M02.js"], //surface map file of fourth tutorial level from original game converted using map converter
          ["js", "levels", "Path_M02.js"], //path map file of fourth tutorial level from original game converted using map converter
          ["js", "levels", "Surf_M02.js"], //terrain map file of fourth tutorial level from original game converted using map converter
         
          //Tutorial level 5 files
          ["js", "levels", "Info_D02.js"], //info file for fifth tutorial level
          ["js", "levels", "D02.js"], //terrain map file of fifth tutorial level from original game converted using map converter
          ["js", "levels", "Dugg_D02.js"], //predug map file of fifth tutorial level from original game converted using map converter
          ["js", "levels", "Cror_D02.js"], //cryore map file of fifth tutorial level from original game converted using map converter
          ["js", "levels", "High_D02.js"], //surface map file of fifth tutorial level from original game converted using map converter
          ["js", "levels", "Path_D02.js"], //path map file of fifth tutorial level from original game converted using map converter
          ["js", "levels", "Surf_D02.js"], //terrain map file of fifth tutorial level from original game converted using map converter
          
          //Tutorial level 6 files
          ["js", "levels", "Info_B02.js"], //info file for sixth tutorial level
          ["js", "levels", "B02.js"], //terrain map file of sixth tutorial level from original game converted using map converter
          ["js", "levels", "Dugg_B02.js"], //predug map file of sixth tutorial level from original game converted using map converter
          ["js", "levels", "Cror_B02.js"], //cryore map file of sixth tutorial level from original game converted using map converter
          ["js", "levels", "High_B02.js"], //surface map file of sixth tutorial level from original game converted using map converter
          ["js", "levels", "Path_B02.js"], //path map file of sixth tutorial level from original game converted using map converter
          ["js", "levels", "Surf_B02.js"], //terrain map file of sixth tutorial level from original game converted using map converter
          
          //Tutorial level 7 files
          ["js", "levels", "Info_D03.js"], //info file for seventh tutorial level
          ["js", "levels", "D03.js"], //terrain map file of seventh tutorial level from original game converted using map converter
          ["js", "levels", "Dugg_D03.js"], //predug map file of seventh tutorial level from original game converted using map converter
          ["js", "levels", "Cror_D03.js"], //cryore map file of seventh tutorial level from original game converted using map converter
          ["js", "levels", "High_D03.js"], //surface map file of seventh tutorial level from original game converted using map converter
          ["js", "levels", "Path_D03.js"], //path map file of seventh tutorial level from original game converted using map converter
          ["js", "levels", "Surf_D03.js"], //terrain map file of seventh tutorial level from original game converted using map converter
          
          //Tutorial level 8 files
          ["js", "levels", "Info_DE1.js"], //info file for eigth tutorial level
          ["js", "levels", "DE1.js"], //terrain map file of eigth tutorial level from original game converted using map converter
          ["js", "levels", "Dugg_DE1.js"], //predug map file of eigth tutorial level from original game converted using map converter
          ["js", "levels", "Cror_DE1.js"], //cryore map file of eigth tutorial level from original game converted using map converter
          ["js", "levels", "High_DE1.js"], //surface map file of eigth tutorial level from original game converted using map converter
          ["js", "levels", "Path_DE1.js"], //path map file of eigth tutorial level from original game converted using map converter
          ["js", "levels", "Surf_DE1.js"], //terrain map file of eigth tutorial level from original game converted using map converter
          

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
		  ["js", "levels", "Fall_02.js"], //fallin file of second level from original game converted using map converter
          ["js", "levels", "02.js"], //OL file of second level from original game converted using map converter
          
          //level 3 files
          ["js", "levels", "Surf_03.js"], //terrain map file of third level from original game converted using map converter
          ["js", "levels", "Cror_03.js"], //cryore map file of third level from original game converted using map converter
          ["js", "levels", "High_03.js"], //surface map file of third level from original game converted using map converter
          ["js", "levels", "Info_03.js"], //info file for third level
          ["js", "levels", "Dugg_03.js"], //predug file of third level from original game converted using map converter
          ["js", "levels", "path_03.js"], //path file of third level from original game converted using map converter
          ["js", "levels", "Fall_03.js"], //fallin file of third level from original game converted using map converter
          ["js", "levels", "03.js"], //OL file of third level from original game converted using map converter
		  
		  //level 4 files
          ["js", "levels", "Surf_04.js"], //terrain map file of fourth level from original game converted using map converter
          ["js", "levels", "Cror_04.js"], //cryore map file of fourth level from original game converted using map converter
          ["js", "levels", "High_04.js"], //surface map file of fourth level from original game converted using map converter
          ["js", "levels", "Info_04.js"], //info file for fourth level
          ["js", "levels", "Dugg_04.js"], //predug file of fourth level from original game converted using map converter
          ["js", "levels", "Fall_04.js"], //fallin file of fourth level from original game converted using map converter
          ["js", "levels", "04.js"], //OL file of fourth level from original game converted using map converter
		  
		  //level 5 files
          ["js", "levels", "Surf_05.js"], //terrain map file of fifth level from original game converted using map converter
          ["js", "levels", "Cror_05.js"], //cryore map file of fifth level from original game converted using map converter
          ["js", "levels", "High_05.js"], //surface map file of fifth level from original game converted using map converter
          ["js", "levels", "Info_05.js"], //info file for fifth level
          ["js", "levels", "Dugg_05.js"], //predug file of fifth level from original game converted using map converter
          ["js", "levels", "fall_05.js"], //fallin file of fifth level from original game converted using map converter
          ["js", "levels", "05.js"], //OL file of fifth level from original game converted using map converter
		  
		  //level 6 files
          ["js", "levels", "Surf_06.js"], //terrain map file of sixth level from original game converted using map converter
          ["js", "levels", "Cror_06.js"], //cryore map file of sixth level from original game converted using map converter
          ["js", "levels", "High_06.js"], //surface map file of sixth level from original game converted using map converter
          ["js", "levels", "Info_06.js"], //info file for sixth level
          ["js", "levels", "Dugg_06.js"], //predug file of sixth level from original game converted using map converter
          ["js", "levels", "Fall_06.js"], //fallin file of sixth level from original game converted using map converter
          ["js", "levels", "06.js"], //OL file of sixth level from original game converted using map converter
		  
		  //level 7 files
          ["js", "levels", "Surf_07.js"], //terrain map file of seventh level from original game converted using map converter
          ["js", "levels", "Cror_07.js"], //cryore map file of seventh level from original game converted using map converter
          ["js", "levels", "High_07.js"], //surface map file of seventh level from original game converted using map converter
          ["js", "levels", "Info_07.js"], //info file for seventh level
          ["js", "levels", "Dugg_07.js"], //predug file of seventh level from original game converted using map converter
          ["js", "levels", "07.js"], //OL file of seventh level from original game converted using map converter
		  
		  //level 8 files
          ["js", "levels", "Surf_08.js"], //terrain map file of eigth level from original game converted using map converter
          ["js", "levels", "Cror_08.js"], //cryore map file of eigth level from original game converted using map converter
          ["js", "levels", "High_08.js"], //surface map file of eigth level from original game converted using map converter
          ["js", "levels", "Info_08.js"], //info file for eigth level
          ["js", "levels", "Dugg_08.js"], //predug file of eigth level from original game converted using map converter
          ["js", "levels", "fall_08.js"], //fallin file of eigth level from original game converted using map converter
          ["js", "levels", "08.js"], //OL file of eigth level from original game converted using map converter
		  
		  //level 9 files
          ["js", "levels", "surf_09.js"], //terrain map file of ninth level from original game converted using map converter
          ["js", "levels", "Cror_09.js"], //cryore map file of ninth level from original game converted using map converter
          ["js", "levels", "high_09.js"], //surface map file of ninth level from original game converted using map converter
          ["js", "levels", "Info_09.js"], //info file for ninth level
          ["js", "levels", "dugg_09.js"], //predug file of ninth level from original game converted using map converter
          ["js", "levels", "Path_09.js"], //path file of ninth level from original game converted using map converter
          ["js", "levels", "fall_09.js"], //fallin file of ninth level from original game converted using map converter
          ["js", "levels", "09.js"], //OL file of ninth level from original game converted using map converter
		  
		  //level 10 files
          ["js", "levels", "Surf_10.js"], //terrain map file of tenth level from original game converted using map converter
          ["js", "levels", "Cror_10.js"], //cryore map file of tenth level from original game converted using map converter
          ["js", "levels", "High_10.js"], //surface map file of tenth level from original game converted using map converter
          ["js", "levels", "Info_10.js"], //info file for tenth level
          ["js", "levels", "Dugg_10.js"], //predug file of tenth level from original game converted using map converter
          ["js", "levels", "Fall_10.js"], //fallin file of tenth level from original game converted using map converter
          ["js", "levels", "10.js"], //OL file of tenth level from original game converted using map converter
		  
		  //level 11 files
          ["js", "levels", "Surf_11.js"], //terrain map file of eleventh level from original game converted using map converter
          ["js", "levels", "cror_11.js"], //cryore map file of eleventh level from original game converted using map converter
          ["js", "levels", "high_11.js"], //surface map file of eleventh level from original game converted using map converter
          ["js", "levels", "Info_11.js"], //info file for eleventh level
          ["js", "levels", "Dugg_11.js"], //predug file of eleventh level from original game converted using map converter
          ["js", "levels", "path_11.js"], //path file of eleventh level from original game converted using map converter
          ["js", "levels", "Fall_11.js"], //fallin file of eleventh level from original game converted using map converter
          ["js", "levels", "11.js"], //OL file of eleventh level from original game converted using map converter
		  
		  //level 12 files
          ["js", "levels", "Surf_12.js"], //terrain map file of twelfth level from original game converted using map converter
          ["js", "levels", "cror_12.js"], //cryore map file of twelfth level from original game converted using map converter
          ["js", "levels", "high_12.js"], //surface map file of twelfth level from original game converted using map converter
          ["js", "levels", "Info_12.js"], //info file for twelfth level
          ["js", "levels", "Dugg_12.js"], //predug file of twelfth level from original game converted using map converter
          ["js", "levels", "path_12.js"], //path file of twelfth level from original game converted using map converter
          ["js", "levels", "12.js"], //OL file of twelfth level from original game converted using map converter
		  
		  //level 13 files
          ["js", "levels", "Surf_13.js"], //terrain map file of thirteenth level from original game converted using map converter
          ["js", "levels", "Cror_13.js"], //cryore map file of thirteenth level from original game converted using map converter
          ["js", "levels", "High_13.js"], //surface map file of thirteenth level from original game converted using map converter
          ["js", "levels", "Info_13.js"], //info file for thirteenth level
          ["js", "levels", "Dugg_13.js"], //predug file of thirteenth level from original game converted using map converter
          ["js", "levels", "13.js"], //OL file of thirteenth level from original game converted using map converter
		  
		  //level 14 files
          ["js", "levels", "surf_14.js"], //terrain map file of fourteenth level from original game converted using map converter
          ["js", "levels", "cror_14.js"], //cryore map file of fourteenth level from original game converted using map converter
          ["js", "levels", "high_14.js"], //surface map file of fourteenth level from original game converted using map converter
          ["js", "levels", "Info_14.js"], //info file for fourteenth level
          ["js", "levels", "dugg_14.js"], //predug file of fourteenth level from original game converted using map converter
          ["js", "levels", "14.js"], //OL file of fourteenth level from original game converted using map converter
		  
		  //level 15 files
          ["js", "levels", "Surf_15.js"], //terrain map file of fifteenth level from original game converted using map converter
          ["js", "levels", "Cror_15.js"], //cryore map file of fifteenth level from original game converted using map converter
          ["js", "levels", "High_15.js"], //surface map file of fifteenth level from original game converted using map converter
          ["js", "levels", "Info_15.js"], //info file for fifteenth level
          ["js", "levels", "Dugg_15.js"], //predug file of fifteenth level from original game converted using map converter
          ["js", "levels", "fall_15.js"], //fallin file of fifteenth level from original game converted using map converter
          ["js", "levels", "15.js"], //OL file of fifteenth level from original game converted using map converter
		  
		  //level 16 files
          ["js", "levels", "surf_16.js"], //terrain map file of sixteenth level from original game converted using map converter
          ["js", "levels", "cror_16.js"], //cryore map file of sixteenth level from original game converted using map converter
          ["js", "levels", "high_16.js"], //surface map file of sixteenth level from original game converted using map converter
          ["js", "levels", "Info_16.js"], //info file for sixteenth level
          ["js", "levels", "dugg_16.js"], //predug file of sixteenth level from original game converted using map converter
          ["js", "levels", "path_16.js"], //path file of sixteenth level from original game converted using map converter
          ["js", "levels", "16.js"], //OL file of sixteenth level from original game converted using map converter
		  
		  //level 17 files
          ["js", "levels", "Surf_17.js"], //terrain map file of seventeenth level from original game converted using map converter
          ["js", "levels", "cror_17.js"], //cryore map file of seventeenth level from original game converted using map converter
          ["js", "levels", "high_17.js"], //surface map file of seventeenth level from original game converted using map converter
          ["js", "levels", "Info_17.js"], //info file for seventeenth level
          ["js", "levels", "Dugg_17.js"], //predug file of seventeenth level from original game converted using map converter
          ["js", "levels", "path_17.js"], //path file of seventeenth level from original game converted using map converter
          ["js", "levels", "17.js"], //OL file of seventeenth level from original game converted using map converter
		  
		  //level 18 files
          ["js", "levels", "surf_18.js"], //terrain map file of eighteenth level from original game converted using map converter
          ["js", "levels", "cror_18.js"], //cryore map file of eighteenth level from original game converted using map converter
          ["js", "levels", "high_18.js"], //surface map file of eighteenth level from original game converted using map converter
          ["js", "levels", "Info_18.js"], //info file for eighteenth level
          ["js", "levels", "dugg_18.js"], //predug file of eighteenth level from original game converted using map converter
          ["js", "levels", "Path_18.js"], //path file of eighteenth level from original game converted using map converter
          ["js", "levels", "fall_18.js"], //fallin file of eighteenth level from original game converted using map converter
          ["js", "levels", "18.js"], //OL file of eighteenth level from original game converted using map converter
		  
		  //level 19 files
          ["js", "levels", "surf_19.js"], //terrain map file of nineteenth level from original game converted using map converter
          ["js", "levels", "cror_19.js"], //cryore map file of nineteenth level from original game converted using map converter
          ["js", "levels", "high_19.js"], //surface map file of nineteenth level from original game converted using map converter
          ["js", "levels", "Info_19.js"], //info file for nineteenth level
          ["js", "levels", "dugg_19.js"], //predug file of nineteenth level from original game converted using map converter
          ["js", "levels", "19.js"], //OL file of nineteenth level from original game converted using map converter
		  
		  //level 20 files
          ["js", "levels", "surf_20.js"], //terrain map file of twentieth level from original game converted using map converter
          ["js", "levels", "high_20.js"], //surface map file of twentieth level from original game converted using map converter
          ["js", "levels", "Info_20.js"], //info file for twentieth level
          ["js", "levels", "dugg_20.js"], //predug file of twentieth level from original game converted using map converter
          ["js", "levels", "fall_20.js"], //fallin file of twentieth level from original game converted using map converter
          ["js", "levels", "20.js"], //OL file of twentieth level from original game converted using map converter
		  
		  //level 21 files
          ["js", "levels", "surf_21.js"], //terrain map file of twentyfirst level from original game converted using map converter
          ["js", "levels", "cror_21.js"], //cryore map file of twentyfirst level from original game converted using map converter
          ["js", "levels", "high_21.js"], //surface map file of twentyfirst level from original game converted using map converter
          ["js", "levels", "Info_21.js"], //info file for twentyfirst level
          ["js", "levels", "dugg_21.js"], //predug file of twentyfirst level from original game converted using map converter
          ["js", "levels", "path_21.js"], //path file of twentyfirst level from original game converted using map converter
          ["js", "levels", "Fall_21.js"], //fallin file of twentyfirst level from original game converted using map converter
          ["js", "levels", "21.js"], //OL file of twentyfirst level from original game converted using map converter
		  
		  //level 22 files
          ["js", "levels", "surf_22.js"], //terrain map file of twentysecond level from original game converted using map converter
          ["js", "levels", "cror_22.js"], //cryore map file of twentysecond level from original game converted using map converter
          ["js", "levels", "high_22.js"], //surface map file of twentysecond level from original game converted using map converter
          ["js", "levels", "Info_22.js"], //info file for twentysecond level
          ["js", "levels", "dugg_22.js"], //predug file of twentysecond level from original game converted using map converter
          ["js", "levels", "22.js"], //OL file of twentysecond level from original game converted using map converter
		  
		  //level 23 files
          ["js", "levels", "Surf_23.js"], //terrain map file of twentythird level from original game converted using map converter
          ["js", "levels", "Cror_23.js"], //cryore map file of twentythird level from original game converted using map converter
          ["js", "levels", "High_23.js"], //surface map file of twentythird level from original game converted using map converter
          ["js", "levels", "Info_23.js"], //info file for twentythird level
          ["js", "levels", "Dugg_23.js"], //predug file of twentythird level from original game converted using map converter
          ["js", "levels", "Path_23.js"], //path file of twentythird level from original game converted using map converter
          ["js", "levels", "23.js"], //OL file of twentythird level from original game converted using map converter
		  
		  //level 24 files
          ["js", "levels", "surf_24.js"], //terrain map file of twentyfourth level from original game converted using map converter
          ["js", "levels", "cror_24.js"], //cryore map file of twentyfourth level from original game converted using map converter
          ["js", "levels", "high_24.js"], //surface map file of twentyfourth level from original game converted using map converter
          ["js", "levels", "Info_24.js"], //info file for twentyfourth level
          ["js", "levels", "dugg_24.js"], //predug file of twentyfourth level from original game converted using map converter
          ["js", "levels", "24.js"], //OL file of twentyfourth level from original game converted using map converter
		  
		  //level 25 files
          ["js", "levels", "surf_25.js"], //terrain map file of twentyfifth level from original game converted using map converter
          ["js", "levels", "cror_25.js"], //cryore map file of twentyfifth level from original game converted using map converter
          ["js", "levels", "high_25.js"], //surface map file of twentyfifth level from original game converted using map converter
          ["js", "levels", "Info_25.js"], //info file for twentyfifth level
          ["js", "levels", "dugg_25.js"], //predug file of twentyfifth level from original game converted using map converter
          ["js", "levels", "path_25.js"], //path file of twentyfifth level from original game converted using map converter
          ["js", "levels", "25.js"], //OL file of twentyfifth level from original game converted using map converter
          
          //core
          ["js", "", "rockRaiders.js"] //main game file (put last as this contains the main game loop)
          ]
};