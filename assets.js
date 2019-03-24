// note that text files (such as levels or assets) should be stored in .js files and in variables rather than in text files, as text files cannot be loaded from the machine without user interference due to safety restrictions
// currently no way to dynamically load / unload, will look into this later
// load type (dir or file),file type (img, snd, or js),directory (blank = root),extension or file name (blank = all file types)
// due to security concerns, javascript cannot search a dir for files, so load type is no longer a thing
// sounds will always come in both mp4 and ogg form for browser compatibility, so don't need to specify extension here
object = {
	assets: [
		// loading screen resources
		["wad0bmp", "Languages/Loading.bmp", "loading screen.png"], // loading screen image
		["wad0bmp", "Interface/FrontEnd/gradient.bmp", "loading bar.png"], // loading bar container image
		["js", "", "loadingScreenOverride.js"], // script to override loading screen to Rock Raiders loading screen

		// ~images~
		// menu resources
		["wad0bmp", "Interface/FrontEnd/MenuBGpic.bmp", "MenuBGpic.png"], // main menu background
		["wad0bmp", "Interface/FrontEnd/Menu_Font_LO.bmp", "Menu_Font_LO.bmp"], // main menu font
		["wad0bmp", "Interface/FrontEnd/Menu_Font_HI.bmp", "Menu_Font_HI.bmp"], // (highlighted) main menu font
		["wad0bmp", "Interface/Frontend/LP_Normal.bmp", "LP_Normal.bmp"], // back button in level select view
		["wad0bmp", "Interface/Frontend/LP_Glow.bmp", "LP_Glow.bmp"], // back button in level select view (hovered)
		["wad0bmp", "Interface/Frontend/LP_Dull.bmp", "LP_Dull.bmp"], // back button in level select view (pressed)
		["wad0alpha", "Interface/Frontend/LowerPanel.bmp", "LowerPanel.bmp"], // lower panel in level select view

		// level images
		["wad0bmp", "Interface/LEVELPICKER/Levelpick.bmp", "Levelpick.png"], // level select menu background
		["wad0alpha", "Levels/TutorialLevels/GTutorial01.bmp", "GTutorial01"], // tutorial 1 image
		["wad0alpha", "Levels/TutorialLevels/Tutorial01.bmp", "Tutorial01"],
		["wad0alpha", "Levels/TutorialLevels/Tutorial01G.bmp", "Tutorial01G"],
		["wad0alpha", "Levels/TutorialLevels/GTutorial02.bmp", "GTutorial02"], // tutorial 2 image
		["wad0alpha", "Levels/TutorialLevels/Tutorial02.bmp", "Tutorial02"],
		["wad0alpha", "Levels/TutorialLevels/Tutorial02G.bmp", "Tutorial02G"],
		["wad0alpha", "Levels/TutorialLevels/GTutorial03.bmp", "GTutorial03"], // tutorial 3 image
		["wad0alpha", "Levels/TutorialLevels/Tutorial03.bmp", "Tutorial03"],
		["wad0alpha", "Levels/TutorialLevels/Tutorial03G.bmp", "Tutorial03G"],
		["wad0alpha", "Levels/TutorialLevels/GTutorial04.bmp", "GTutorial04"], // tutorial 4 image
		["wad0alpha", "Levels/TutorialLevels/Tutorial04.bmp", "Tutorial04"],
		["wad0alpha", "Levels/TutorialLevels/Tutorial04G.bmp", "Tutorial04G"],
		["wad0alpha", "Levels/TutorialLevels/GTutorial05.bmp", "GTutorial05"], // tutorial 5 image
		["wad0alpha", "Levels/TutorialLevels/Tutorial05.bmp", "Tutorial05"],
		["wad0alpha", "Levels/TutorialLevels/Tutorial05G.bmp", "Tutorial05G"],
		["wad0alpha", "Levels/TutorialLevels/GTutorial06.bmp", "GTutorial06"], // tutorial 6 image
		["wad0alpha", "Levels/TutorialLevels/Tutorial06.bmp", "Tutorial06"],
		["wad0alpha", "Levels/TutorialLevels/Tutorial06G.bmp", "Tutorial06G"],
		["wad0alpha", "Levels/TutorialLevels/GTutorial07.bmp", "GTutorial07"], // tutorial 7 image
		["wad0alpha", "Levels/TutorialLevels/Tutorial07.bmp", "Tutorial07"],
		["wad0alpha", "Levels/TutorialLevels/Tutorial07G.bmp", "Tutorial07G"],
		["wad0alpha", "Levels/TutorialLevels/GTutorial08.bmp", "GTutorial08"], // tutorial 8 image
		["wad0alpha", "Levels/TutorialLevels/Tutorial08.bmp", "Tutorial08"],
		["wad0alpha", "Levels/TutorialLevels/Tutorial08G.bmp", "Tutorial08G"],
		["wad0alpha", "Levels/GameLevels/GLevel01.bmp", "GLevel01"], // level 1 image
		["wad0alpha", "Levels/GameLevels/Level01.bmp", "Level01"],
		["wad0alpha", "Levels/GameLevels/Level01G.bmp", "Level01G"],
		["wad0alpha", "Levels/GameLevels/GLevel02.bmp", "GLevel02"], // level 2 image
		["wad0alpha", "Levels/GameLevels/Level02.bmp", "Level02"],
		["wad0alpha", "Levels/GameLevels/Level02G.bmp", "Level02G"],
		["wad0alpha", "Levels/GameLevels/GLevel03.bmp", "GLevel03"], // level 3 image
		["wad0alpha", "Levels/GameLevels/Level03.bmp", "Level03"],
		["wad0alpha", "Levels/GameLevels/Level03G.bmp", "Level03G"],
		["wad0alpha", "Levels/GameLevels/GLevel04.bmp", "GLevel04"], // level 4 image
		["wad0alpha", "Levels/GameLevels/Level04.bmp", "Level04"],
		["wad0alpha", "Levels/GameLevels/Level04G.bmp", "Level04G"],
		["wad0alpha", "Levels/GameLevels/GLevel05.bmp", "GLevel05"], // level 5 image
		["wad0alpha", "Levels/GameLevels/Level05.bmp", "Level05"],
		["wad0alpha", "Levels/GameLevels/Level05G.bmp", "Level05G"],
		["wad0alpha", "Levels/GameLevels/GLevel06.bmp", "GLevel06"], // level 6 image
		["wad0alpha", "Levels/GameLevels/Level06.bmp", "Level06"],
		["wad0alpha", "Levels/GameLevels/Level06G.bmp", "Level06G"],
		["wad0alpha", "Levels/GameLevels/GLevel07.bmp", "GLevel07"], // level 7 image
		["wad0alpha", "Levels/GameLevels/Level07.bmp", "Level07"],
		["wad0alpha", "Levels/GameLevels/Level07G.bmp", "Level07G"],
		["wad0alpha", "Levels/GameLevels/GLevel08.bmp", "GLevel08"], // level 8 image
		["wad0alpha", "Levels/GameLevels/Level08.bmp", "Level08"],
		["wad0alpha", "Levels/GameLevels/Level08G.bmp", "Level08G"],
		["wad0alpha", "Levels/GameLevels/GLevel09.bmp", "GLevel09"], // level 9 image
		["wad0alpha", "Levels/GameLevels/Level09.bmp", "Level09"],
		["wad0alpha", "Levels/GameLevels/Level09G.bmp", "Level09G"],
		["wad0alpha", "Levels/GameLevels/GLevel10.bmp", "GLevel10"], // level 10 image
		["wad0alpha", "Levels/GameLevels/Level10.bmp", "Level10"],
		["wad0alpha", "Levels/GameLevels/Level10G.bmp", "Level10G"],
		["wad0alpha", "Levels/GameLevels/GLevel11.bmp", "GLevel11"], // level 11 image
		["wad0alpha", "Levels/GameLevels/Level11.bmp", "Level11"],
		["wad0alpha", "Levels/GameLevels/Level11G.bmp", "Level11G"],
		["wad0alpha", "Levels/GameLevels/GLevel12.bmp", "GLevel12"], // level 12 image
		["wad0alpha", "Levels/GameLevels/Level12.bmp", "Level12"],
		["wad0alpha", "Levels/GameLevels/Level12G.bmp", "Level12G"],
		["wad0alpha", "Levels/GameLevels/GLevel13.bmp", "GLevel13"], // level 13 image
		["wad0alpha", "Levels/GameLevels/Level13.bmp", "Level13"],
		["wad0alpha", "Levels/GameLevels/Level13G.bmp", "Level13G"],
		["wad0alpha", "Levels/GameLevels/GLevel14.bmp", "GLevel14"], // level 14 image
		["wad0alpha", "Levels/GameLevels/Level14.bmp", "Level14"],
		["wad0alpha", "Levels/GameLevels/Level14G.bmp", "Level14G"],
		["wad0alpha", "Levels/GameLevels/GLevel15.bmp", "GLevel15"], // level 15 image
		["wad0alpha", "Levels/GameLevels/Level15.bmp", "Level15"],
		["wad0alpha", "Levels/GameLevels/Level15G.bmp", "Level15G"],
		["wad0alpha", "Levels/GameLevels/GLevel16.bmp", "GLevel16"], // level 16 image
		["wad0alpha", "Levels/GameLevels/Level16.bmp", "Level16"],
		["wad0alpha", "Levels/GameLevels/Level16G.bmp", "Level16G"],
		["wad0alpha", "Levels/GameLevels/GLevel17.bmp", "GLevel17"], // level 17 image
		["wad0alpha", "Levels/GameLevels/Level17.bmp", "Level17"],
		["wad0alpha", "Levels/GameLevels/Level17G.bmp", "Level17G"],
		["wad0alpha", "Levels/GameLevels/GLevel18.bmp", "GLevel18"], // level 18 image
		["wad0alpha", "Levels/GameLevels/Level18.bmp", "Level18"],
		["wad0alpha", "Levels/GameLevels/Level18G.bmp", "Level18G"],
		["wad0alpha", "Levels/GameLevels/GLevel19.bmp", "GLevel19"], // level 19 image
		["wad0alpha", "Levels/GameLevels/Level19.bmp", "Level19"],
		["wad0alpha", "Levels/GameLevels/Level19G.bmp", "Level19G"],
		["wad0alpha", "Levels/GameLevels/GLevel20.bmp", "GLevel20"], // level 20 image
		["wad0alpha", "Levels/GameLevels/Level20.bmp", "Level20"],
		["wad0alpha", "Levels/GameLevels/Level20G.bmp", "Level20G"],
		["wad0alpha", "Levels/GameLevels/GLevel21.bmp", "GLevel21"], // level 21 image
		["wad0alpha", "Levels/GameLevels/Level21.bmp", "Level21"],
		["wad0alpha", "Levels/GameLevels/Level21G.bmp", "Level21G"],
		["wad0alpha", "Levels/GameLevels/GLevel22.bmp", "GLevel22"], // level 22 image
		["wad0alpha", "Levels/GameLevels/Level22.bmp", "Level22"],
		["wad0alpha", "Levels/GameLevels/Level22G.bmp", "Level22G"],
		["wad0alpha", "Levels/GameLevels/GLevel23.bmp", "GLevel23"], // level 23 image
		["wad0alpha", "Levels/GameLevels/Level23.bmp", "Level23"],
		["wad0alpha", "Levels/GameLevels/Level23G.bmp", "Level23G"],
		["wad0alpha", "Levels/GameLevels/GLevel24.bmp", "GLevel24"], // level 24 image
		["wad0alpha", "Levels/GameLevels/Level24.bmp", "Level24"],
		["wad0alpha", "Levels/GameLevels/Level24G.bmp", "Level24G"],
		["wad0alpha", "Levels/GameLevels/GLevel25.bmp", "GLevel25"], // level 25 image
		["wad0alpha", "Levels/GameLevels/Level25.bmp", "Level25"],
		["wad0alpha", "Levels/GameLevels/Level25G.bmp", "Level25G"],

		// pointers/cursors
		["wad0alpha", "Interface/Pointers/Aclosed.bmp", "Aclosed.bmp"],

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

		// small vehicle buttons
		["wad0bmp", "Interface/Icons/hoverboard.bmp", "make hoverboard.png"], // make hoverscout button
		["wad0bmp", "Interface/Icons/SmallCat.bmp", "make SmallCat.png"], // make rapid rider button
		["wad0bmp", "Interface/Icons/SmallDigger.bmp", "make SmallDigger.png"], // make small digger button
		["wad0bmp", "Interface/Icons/SmallHeli.bmp", "make SmallHeli.png"], // make tunnel scout button
		["wad0bmp", "Interface/Icons/SmallMWP.bmp", "make SmallMWP.png"], // make small mobile laser cutter button
		["wad0bmp", "Interface/Icons/SmallTruck.bmp", "make SmallTruck.png"], // make small transport truck button

		// large vehicle buttons
		["wad0bmp", "Interface/Icons/Bulldozer.bmp", "make Bulldozer.png"], // make loader dozer button
		["wad0bmp", "Interface/Icons/LargeCatamaran.bmp", "make LargeCatamaran.png"], // make cargo carrier button
		["wad0bmp", "Interface/Icons/largeDigger.bmp", "make largeDigger.png"], // make large digger button
		["wad0bmp", "Interface/Icons/LargeMWP.bmp", "make LargeMWP.png"], // make large mobile laser cutter button
		["wad0bmp", "Interface/Icons/WalkerDigger.bmp", "make WalkerDigger.png"], // make granite grinder button

		// spaces
		["img", "images\\spaces", "ground.png"], // ground
		["img", "images\\spaces", "building power path.png"], // power path that is part of a building
		["img", "images\\spaces", "power path building site.png"], // building site for a lone (non-building) power path
		["img", "images\\spaces", "power path.png"], // power path created by the player (not part of a building)
		["img", "images\\spaces", "lava.png"], // lava
		["img", "images\\spaces", "water.png"], // water
		["img", "images\\spaces", "energy crystal seam.png"], // energy crystal seam
		["img", "images\\spaces", "ore seam.png"], // ore seam
		["img", "images\\spaces", "recharge seam.png"], // recharge seam
		["img", "images\\spaces", "dirt.png"], // dirt
		["img", "images\\spaces", "loose rock.png"], // loose rock
		["img", "images\\spaces", "hard rock.png"], // hard rock
		["img", "images\\spaces", "solid rock.png"], // solid rock
		["img", "images\\spaces", "rubble 1.png"], // rubble swept 0 times. 4 sweeps required to clear fully
		["img", "images\\spaces", "rubble 2.png"], // rubble swept 1 time. 3 sweeps required to clear fully
		["img", "images\\spaces", "rubble 3.png"], // rubble swept 2 times. 2 sweeps required to clear fully
		["img", "images\\spaces", "rubble 4.png"], // rubble swept 3 times. 1 sweep required to clear fully
		["img", "images\\spaces", "building site.png"], // building site
		["img", "images\\spaces", "SlimySlugHole.png"], // hole out of which slimy slugs can emerge
		["img", "images\\spaces", "reinforcement.png"], // reinforcement overlay for reinforced walls

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

		// buttons
		["wad0bmp", "Interface/Icons/minifigures.bmp", "teleport raider button.png"], // teleport rock raider button
		["wad0bmp", "Interface/Menus/MF_Pickup.bmp", "grab item button.png"], // button to instruct a raider to pick up item (collectable, dynamite, etc..)
		["wad0bmp", "Interface/Menus/drill.bmp", "drill wall button.png"], // button to instruct a raider to drill a wall
		["wad0bmp", "Interface/Menus/Reinforce.bmp", "Reinforce.png"], // button to instruct a raider to reinforce a wall
		["wad0bmp", "Interface/Menus/ClearRubble.bmp", "clear rubble button.png"], // button to instruct a raider to clear rubble
		["wad0bmp", "Interface/Menus/buildpath.bmp", "build power path button.png"], // button to instruct a raider to build a power path
		["wad0bmp", "Interface/Menus/diguppath.bmp", "diguppath"], // button to destroy a power path
		["wad0bmp", "Interface/Menus/UnloadMinifigure.bmp", "unload minifig button.png"], // unload minifig button (drops held object)
		["wad0bmp", "Interface/Menus/STOPeverything.bmp", "stop minifig button.png"], // stop minifig button (stops any performed task)
		["wad0bmp", "Interface/Menus/Upgrade.bmp", "upgrade button.png"], // button to upgrade a raider or building
		["wad0bmp", "Interface/Menus/telepbuilding.bmp", "telepbuilding"], // button to upgrade a raider or building
		["wad0bmp", "Interface/Menus/building.bmp", "open building menu button.png"], // button to open up the building menu
		["wad0bmp", "Interface/Menus/BIGvehicle.bmp", "open large vehicle menu button.png"], // button to open up the large vehicle menu
		["wad0bmp", "Interface/Menus/SMvehicle.bmp", "open small vehicle menu button.png"], // button to open up the small vehicle menu
		["wad0bmp", "Interface/Menus/dynamite.bmp", "use dynamite.png"], // button to instruct a raider to blow up a wall using dynamite
		["wad0bmp", "Interface/Menus/exit.bmp", "exit vehicle.png"], // button to instruct a raider to exit the current vehicle

		// grab item buttons FIXME replace with wadbmp
		["img", "images\\buttons", "getTool.png"], // button to open the 'get tool' raider submenu
		["img", "images\\buttons", "get_Drill.png"], // button to instruct a raider to get a drill from the nearest toolstore
		["img", "images\\buttons", "get_Shovel.png"], // button to instruct a raider to get a shovel from the nearest toolstore
		["img", "images\\buttons", "get_Hammer.png"], // button to instruct a raider to get a hammer from the nearest toolstore
		["img", "images\\buttons", "get_Wrench.png"], // button to instruct a raider to get a wrench from the nearest toolstore
		["img", "images\\buttons", "get_Freezer.png"], // button to instruct a raider to get a freezer beam from the nearest toolstore
		["img", "images\\buttons", "get_Pusher.png"], // button to instruct a raider to get a pusher beam from the nearest toolstore
		["img", "images\\buttons", "get_Laser.png"], // button to instruct a raider to get a laser beam from the nearest toolstore
		["img", "images\\buttons", "get_Sonic_Blaster.png"], // button to instruct a raider to get a sonic blaster from the nearest toolstore

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

		// building buttons FIXME replace with wadbmp
		["img", "images\\buttons", "make ToolStation.png"], // button to select to build tool store from building menu
		["img", "images\\buttons", "make SMteleport.png"], // button to select to build teleport pad from building menu
		["img", "images\\buttons", "make docks.png"], // button to select to build docks from building menu
		["img", "images\\buttons", "make PowerStation.png"], // button to select to build power station from building menu
		["img", "images\\buttons", "make barracks.png"], // button to select to build support station from building menu
		["img", "images\\buttons", "make Upgrade.png"], // button to select to build upgrade station from building menu
		["img", "images\\buttons", "make Geo.png"], // button to select to build geological center from building menu
		["img", "images\\buttons", "make Orerefinery.png"], // button to select to build ore refinery from building menu
		["img", "images\\buttons", "make Gunstation.png"], // button to select to build mining laser from building menu
		["img", "images\\buttons", "make LargeTeleporter.png"], // button to select to build super teleport from building menu

		// interface
		["wad0alpha", "Interface/RightPanel/CrystalSideBar.bmp", "CrystalSideBar"], // right side overlay showing crystal and ore count
		["wad0alpha", "Interface/RightPanel/CrystalSideBar_Ore.bmp", "CrystalSideBar_Ore"], // image representing a single piece of ore on the overlay
		["wad0alpha", "Interface/RightPanel/NoSmallCrystal.bmp", "NoSmallCrystal"], // image representing no energy crystal on the overlay
		["wad0alpha", "Interface/RightPanel/SmallCrystal.bmp", "SmallCrystal"], // image representing a single energy crystal on the overlay
		["wad0alpha", "Interface/RightPanel/UsedCrystal.bmp", "UsedCrystal"], // image representing a single in use energy crystal on the overlay

		["wad0alpha", "Interface/IconPanel/IconPanel1.bmp", "IconPanel1"], // top right menu with space for 1 item and back button
		["wad0alpha", "Interface/IconPanel/IconPanel2.bmp", "IconPanel2"], // top right menu with space for 2 items and back button
		["wad0alpha", "Interface/IconPanel/IconPanel3.bmp", "IconPanel3"], // top right menu with space for 3 items and back button
		["wad0alpha", "Interface/IconPanel/IconPanel3WOBack.bmp", "IconPanel3WOBack"], // top right menu with space for 3 items without back button
		["wad0alpha", "Interface/IconPanel/IconPanel4.bmp", "IconPanel4"], // top right menu with space for 4 items and back button
		["wad0alpha", "Interface/IconPanel/IconPanel4WOBack.bmp", "IconPanel4WOBack"], // top right menu with space for 4 items without back button
		["wad0alpha", "Interface/IconPanel/IconPanel5.bmp", "IconPanel5"], // top right menu with space for 5 items and back button
		["wad0alpha", "Interface/IconPanel/IconPanel6.bmp", "IconPanel6"], // top right menu with space for 6 items and back button
		["wad0alpha", "Interface/IconPanel/IconPanel7.bmp", "IconPanel7"], // top right menu with space for 7 items and back button
		["wad0alpha", "Interface/IconPanel/IconPanel8.bmp", "IconPanel8"], // top right menu with space for 8 items and back button
		["wad0alpha", "Interface/IconPanel/IconPanel9.bmp", "IconPanel9"], // top right menu with space for 9 items and back button
		["wad0alpha", "Interface/IconPanel/IconPanel10.bmp", "IconPanel10"], // top right menu with space for 10 items and back button
		["wad0alpha", "Interface/IconPanel/IconPanel11.bmp", "IconPanel11"], // top right menu with space for 11 items and back button
		["wad0alpha", "Interface/IconPanel/IconPanel11.bmp", "IconPanel12"], // same as IconPanel4 possibly obsolete

		["wad0alpha", "Interface/IconPanel/Back_HL.bmp", "Back_HL"], // back button image used in top right icon panel
		["wad0alpha", "Interface/IconPanel/Back_PR.bmp", "Back_PR"], // back button image used in top right icon panel

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

		// gui elements
		["js", "gui", "MainMenu.js"], // GUI elements used in the main menu

		// level data list files
		["js", "levels", "levels.js"], // list of names of playable levels, to be used by the main menu for level selection

		// core
		["js", "", "rockRaiders.js"] // main game file (put last as this contains the main game loop)
	]
};