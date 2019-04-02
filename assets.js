// note that text files (such as levels or assets) should be stored in .js files and in variables rather than in text files, as text files cannot be loaded from the machine without user interference due to safety restrictions
// currently no way to dynamically load / unload, will look into this later
// load type (dir or file),file type (img, snd, or js),directory (blank = root),extension or file name (blank = all file types)
// due to security concerns, javascript cannot search a dir for files, so load type is no longer a thing
// sounds will always come in both mp4 and ogg form for browser compatibility, so don't need to specify extension here
object = {
	assets: [
		// loading screen resources
		["wad0bmp", "Languages/Loading.bmp"], // loading screen image
		["wad0bmp", "Interface/FrontEnd/gradient.bmp"], // loading bar container image
		["js", "", "loadingScreenOverride.js"], // script to override loading screen to Rock Raiders loading screen
		["js", "gui", "BitmapFont.js"], // important, must be loaded before creating UI elements

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
		["wad0alpha", "Levels/TutorialLevels/GTutorial01.bmp"], // tutorial 1 image
		["wad0alpha", "Levels/TutorialLevels/Tutorial01.bmp"],
		["wad0alpha", "Levels/TutorialLevels/Tutorial01G.bmp"],
		["wad0alpha", "Levels/TutorialLevels/GTutorial02.bmp"], // tutorial 2 image
		["wad0alpha", "Levels/TutorialLevels/Tutorial02.bmp"],
		["wad0alpha", "Levels/TutorialLevels/Tutorial02G.bmp"],
		["wad0alpha", "Levels/TutorialLevels/GTutorial03.bmp"], // tutorial 3 image
		["wad0alpha", "Levels/TutorialLevels/Tutorial03.bmp"],
		["wad0alpha", "Levels/TutorialLevels/Tutorial03G.bmp"],
		["wad0alpha", "Levels/TutorialLevels/GTutorial04.bmp"], // tutorial 4 image
		["wad0alpha", "Levels/TutorialLevels/Tutorial04.bmp"],
		["wad0alpha", "Levels/TutorialLevels/Tutorial04G.bmp"],
		["wad0alpha", "Levels/TutorialLevels/GTutorial05.bmp"], // tutorial 5 image
		["wad0alpha", "Levels/TutorialLevels/Tutorial05.bmp"],
		["wad0alpha", "Levels/TutorialLevels/Tutorial05G.bmp"],
		["wad0alpha", "Levels/TutorialLevels/GTutorial06.bmp"], // tutorial 6 image
		["wad0alpha", "Levels/TutorialLevels/Tutorial06.bmp"],
		["wad0alpha", "Levels/TutorialLevels/Tutorial06G.bmp"],
		["wad0alpha", "Levels/TutorialLevels/GTutorial07.bmp"], // tutorial 7 image
		["wad0alpha", "Levels/TutorialLevels/Tutorial07.bmp"],
		["wad0alpha", "Levels/TutorialLevels/Tutorial07G.bmp"],
		["wad0alpha", "Levels/TutorialLevels/GTutorial08.bmp"], // tutorial 8 image
		["wad0alpha", "Levels/TutorialLevels/Tutorial08.bmp"],
		["wad0alpha", "Levels/TutorialLevels/Tutorial08G.bmp"],
		["wad0alpha", "Levels/GameLevels/GLevel01.bmp"], // level 1 image
		["wad0alpha", "Levels/GameLevels/Level01.bmp"],
		["wad0alpha", "Levels/GameLevels/Level01G.bmp"],
		["wad0alpha", "Levels/GameLevels/GLevel02.bmp"], // level 2 image
		["wad0alpha", "Levels/GameLevels/Level02.bmp"],
		["wad0alpha", "Levels/GameLevels/Level02G.bmp"],
		["wad0alpha", "Levels/GameLevels/GLevel03.bmp"], // level 3 image
		["wad0alpha", "Levels/GameLevels/Level03.bmp"],
		["wad0alpha", "Levels/GameLevels/Level03G.bmp"],
		["wad0alpha", "Levels/GameLevels/GLevel04.bmp"], // level 4 image
		["wad0alpha", "Levels/GameLevels/Level04.bmp"],
		["wad0alpha", "Levels/GameLevels/Level04G.bmp"],
		["wad0alpha", "Levels/GameLevels/GLevel05.bmp"], // level 5 image
		["wad0alpha", "Levels/GameLevels/Level05.bmp"],
		["wad0alpha", "Levels/GameLevels/Level05G.bmp"],
		["wad0alpha", "Levels/GameLevels/GLevel06.bmp"], // level 6 image
		["wad0alpha", "Levels/GameLevels/Level06.bmp"],
		["wad0alpha", "Levels/GameLevels/Level06G.bmp"],
		["wad0alpha", "Levels/GameLevels/GLevel07.bmp"], // level 7 image
		["wad0alpha", "Levels/GameLevels/Level07.bmp"],
		["wad0alpha", "Levels/GameLevels/Level07G.bmp"],
		["wad0alpha", "Levels/GameLevels/GLevel08.bmp"], // level 8 image
		["wad0alpha", "Levels/GameLevels/Level08.bmp"],
		["wad0alpha", "Levels/GameLevels/Level08G.bmp"],
		["wad0alpha", "Levels/GameLevels/GLevel09.bmp"], // level 9 image
		["wad0alpha", "Levels/GameLevels/Level09.bmp"],
		["wad0alpha", "Levels/GameLevels/Level09G.bmp"],
		["wad0alpha", "Levels/GameLevels/GLevel10.bmp"], // level 10 image
		["wad0alpha", "Levels/GameLevels/Level10.bmp"],
		["wad0alpha", "Levels/GameLevels/Level10G.bmp"],
		["wad0alpha", "Levels/GameLevels/GLevel11.bmp"], // level 11 image
		["wad0alpha", "Levels/GameLevels/Level11.bmp"],
		["wad0alpha", "Levels/GameLevels/Level11G.bmp"],
		["wad0alpha", "Levels/GameLevels/GLevel12.bmp"], // level 12 image
		["wad0alpha", "Levels/GameLevels/Level12.bmp"],
		["wad0alpha", "Levels/GameLevels/Level12G.bmp"],
		["wad0alpha", "Levels/GameLevels/GLevel13.bmp"], // level 13 image
		["wad0alpha", "Levels/GameLevels/Level13.bmp"],
		["wad0alpha", "Levels/GameLevels/Level13G.bmp"],
		["wad0alpha", "Levels/GameLevels/GLevel14.bmp"], // level 14 image
		["wad0alpha", "Levels/GameLevels/Level14.bmp"],
		["wad0alpha", "Levels/GameLevels/Level14G.bmp"],
		["wad0alpha", "Levels/GameLevels/GLevel15.bmp"], // level 15 image
		["wad0alpha", "Levels/GameLevels/Level15.bmp"],
		["wad0alpha", "Levels/GameLevels/Level15G.bmp"],
		["wad0alpha", "Levels/GameLevels/GLevel16.bmp"], // level 16 image
		["wad0alpha", "Levels/GameLevels/Level16.bmp"],
		["wad0alpha", "Levels/GameLevels/Level16G.bmp"],
		["wad0alpha", "Levels/GameLevels/GLevel17.bmp"], // level 17 image
		["wad0alpha", "Levels/GameLevels/Level17.bmp"],
		["wad0alpha", "Levels/GameLevels/Level17G.bmp"],
		["wad0alpha", "Levels/GameLevels/GLevel18.bmp"], // level 18 image
		["wad0alpha", "Levels/GameLevels/Level18.bmp"],
		["wad0alpha", "Levels/GameLevels/Level18G.bmp"],
		["wad0alpha", "Levels/GameLevels/GLevel19.bmp"], // level 19 image
		["wad0alpha", "Levels/GameLevels/Level19.bmp"],
		["wad0alpha", "Levels/GameLevels/Level19G.bmp"],
		["wad0alpha", "Levels/GameLevels/GLevel20.bmp"], // level 20 image
		["wad0alpha", "Levels/GameLevels/Level20.bmp"],
		["wad0alpha", "Levels/GameLevels/Level20G.bmp"],
		["wad0alpha", "Levels/GameLevels/GLevel21.bmp"], // level 21 image
		["wad0alpha", "Levels/GameLevels/Level21.bmp"],
		["wad0alpha", "Levels/GameLevels/Level21G.bmp"],
		["wad0alpha", "Levels/GameLevels/GLevel22.bmp"], // level 22 image
		["wad0alpha", "Levels/GameLevels/Level22.bmp"],
		["wad0alpha", "Levels/GameLevels/Level22G.bmp"],
		["wad0alpha", "Levels/GameLevels/GLevel23.bmp"], // level 23 image
		["wad0alpha", "Levels/GameLevels/Level23.bmp"],
		["wad0alpha", "Levels/GameLevels/Level23G.bmp"],
		["wad0alpha", "Levels/GameLevels/GLevel24.bmp"], // level 24 image
		["wad0alpha", "Levels/GameLevels/Level24.bmp"],
		["wad0alpha", "Levels/GameLevels/Level24G.bmp"],
		["wad0alpha", "Levels/GameLevels/GLevel25.bmp"], // level 25 image
		["wad0alpha", "Levels/GameLevels/Level25.bmp"],
		["wad0alpha", "Levels/GameLevels/Level25G.bmp"],

		// score screen
		["wad0bmp", "Interface/reward/RSGREY.bmp"], // score screen background
		["wad0alpha", "Interface/reward/RSCRYSTALS.bmp"],
		["wad0alpha", "Interface/reward/RSORE.bmp"],
		["wad0alpha", "Interface/reward/RSDIGGING.bmp"],
		["wad0alpha", "Interface/reward/RSBUILDING.bmp"],
		["wad0alpha", "Interface/reward/RSCAVERN.bmp"],
		["wad0alpha", "Interface/reward/RSMINFIG.bmp"],
		["wad0alpha", "Interface/reward/RSMONSTER.bmp"],
		["wad0alpha", "Interface/reward/RSOXYGEN.bmp"],
		["wad0alpha", "Interface/reward/RSTIME.bmp"],
		["wad0alpha", "Interface/reward/CAPT.bmp"],
		["wad0font", "Interface/Fonts/FSFont.bmp"],
		["wad0font", "Interface/Fonts/RSWritten.bmp"],
		["wad0bmp", "Interface/Reward/GBcrystals.bmp"],
		["wad0bmp", "Interface/Reward/GBore.bmp"],
		["wad0bmp", "Interface/Reward/GBdigging.bmp"],
		["wad0bmp", "Interface/Reward/GBbuilding.bmp"],
		["wad0bmp", "Interface/Reward/GBcavern.bmp"],
		["wad0bmp", "Interface/Reward/GBminfig.bmp"],
		["wad0bmp", "Interface/Reward/GBmonster.bmp"],
		["wad0bmp", "Interface/Reward/GBoxygen.bmp"],
		["wad0bmp", "Interface/Reward/GBtime.bmp"],
		["wad0bmp", "Interface/Reward/btn_save.bmp"],
		["wad0bmp", "Interface/Reward/btn_save_hi.bmp"],
		["wad0bmp", "Interface/Reward/btn_save_in.bmp"],
		["wad0bmp", "Interface/Reward/btn_save_dim.bmp"],
		["wad0bmp", "Interface/Reward/btn_adv.bmp"],
		["wad0bmp", "Interface/Reward/btn_adv_hi.bmp"],
		["wad0bmp", "Interface/Reward/btn_adv_in.bmp"],
		["wad0bmp", "Interface/Reward/btn_adv_dim.bmp"],

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

		// small vehicle buttons
		["wad0bmp", "Interface/Icons/hoverboard.bmp"], // make hoverscout button
		["wad0bmp", "Interface/Icons/SmallCat.bmp"], // make rapid rider button
		["wad0bmp", "Interface/Icons/SmallDigger.bmp"], // make small digger button
		["wad0bmp", "Interface/Icons/SmallHeli.bmp"], // make tunnel scout button
		["wad0bmp", "Interface/Icons/SmallMWP.bmp"], // make small mobile laser cutter button
		["wad0bmp", "Interface/Icons/SmallTruck.bmp"], // make small transport truck button

		// large vehicle buttons
		["wad0bmp", "Interface/Icons/Bulldozer.bmp"], // make loader dozer button
		["wad0bmp", "Interface/Icons/LargeCatamaran.bmp"], // make cargo carrier button
		["wad0bmp", "Interface/Icons/largeDigger.bmp"], // make large digger button
		["wad0bmp", "Interface/Icons/LargeMWP.bmp"], // make large mobile laser cutter button
		["wad0bmp", "Interface/Icons/WalkerDigger.bmp"], // make granite grinder button

		// spaces
		["wad0bmp", "World/WorldTextures/RockSplit/ROCK00.BMP"], // ground
		["wad0bmp", "World/WorldTextures/RockSplit/ROCK76.BMP"], // power path that is part of a building
		["wad0bmp", "World/WorldTextures/RockSplit/Rock61.bmp"], // building site for a lone (non-building) power path
		["wad0bmp", "World/WorldTextures/RockSplit/Rock60.bmp"], // all sides power path created by the player (not part of a building)
		["wad0bmp", "World/WorldTextures/RockSplit/ROCK46.BMP"], // lava
		["wad0bmp", "World/WorldTextures/RockSplit/Rock45.bmp"], // water
		["wad0bmp", "World/WorldTextures/RockSplit/Rock20.bmp"], // energy crystal seam
		["wad0bmp", "World/WorldTextures/RockSplit/Rock40.bmp"], // ore seam
		["wad0bmp", "World/WorldTextures/RockSplit/Rock67.bmp"], // recharge seam
		["wad0bmp", "World/WorldTextures/RockSplit/ROCK01.BMP"], // dirt
		["wad0bmp", "World/WorldTextures/RockSplit/ROCK02.BMP"], // gravel
		["wad0bmp", "World/WorldTextures/RockSplit/ROCK03.BMP"], // loose rock
		["wad0bmp", "World/WorldTextures/RockSplit/ROCK04.BMP"], // hard rock
		["wad0bmp", "World/WorldTextures/RockSplit/ROCK05.BMP"], // solid rock
		["wad0bmp", "World/WorldTextures/RockSplit/ROCK31.BMP"], // dirt corner inverted
		["wad0bmp", "World/WorldTextures/RockSplit/ROCK32.BMP"], // gravel corner inverted
		["wad0bmp", "World/WorldTextures/RockSplit/ROCK33.BMP"], // loose rock corner inverted
		["wad0bmp", "World/WorldTextures/RockSplit/ROCK34.BMP"], // hard rock corner inverted
		["wad0bmp", "World/WorldTextures/RockSplit/ROCK35.BMP"], // solid rock corner inverted
		["wad0bmp", "World/WorldTextures/RockSplit/ROCK51.BMP"], // dirt corner
		["wad0bmp", "World/WorldTextures/RockSplit/ROCK52.BMP"], // gravel corner
		["wad0bmp", "World/WorldTextures/RockSplit/ROCK53.BMP"], // loose rock corner
		["wad0bmp", "World/WorldTextures/RockSplit/ROCK54.BMP"], // hard rock corner
		["wad0bmp", "World/WorldTextures/RockSplit/ROCK55.BMP"], // solid rock corner
		["wad0bmp", "World/WorldTextures/RockSplit/ROCK10.BMP"], // rubble swept 0 times. 4 sweeps required to clear fully
		["wad0bmp", "World/WorldTextures/RockSplit/Rock11.bmp"], // rubble swept 1 time. 3 sweeps required to clear fully
		["wad0bmp", "World/WorldTextures/RockSplit/Rock12.bmp"], // rubble swept 2 times. 2 sweeps required to clear fully
		["wad0bmp", "World/WorldTextures/RockSplit/Rock13.bmp"], // rubble swept 3 times. 1 sweep required to clear fully
		["img", "images\\spaces", "building site.png"], // building site
		["wad0bmp", "World/WorldTextures/RockSplit/Rock30.bmp"], // hole out of which slimy slugs can emerge
		["wad0bmp", "World/WorldTextures/RockSplit/rock24.bmp"], // reinforcement overlay for reinforced walls
		["wad0bmp", "World/WorldTextures/RockSplit/ROCK70.BMP"], // rock theme non touched cover

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
		["wad0bmp", "Interface/Icons/minifigures.bmp"], // teleport rock raider button
		["wad0bmp", "Interface/Menus/MF_Pickup.bmp"], // button to instruct a raider to pick up item (collectable, dynamite, etc..)
		["wad0bmp", "Interface/Menus/drill.bmp"], // button to instruct a raider to drill a wall
		["wad0bmp", "Interface/Menus/Reinforce.bmp"], // button to instruct a raider to reinforce a wall
		["wad0bmp", "Interface/Menus/ClearRubble.bmp"], // button to instruct a raider to clear rubble
		["wad0bmp", "Interface/Menus/buildpath.bmp"], // button to instruct a raider to build a power path
		["wad0bmp", "Interface/Menus/diguppath.bmp"], // button to destroy a power path
		["wad0bmp", "Interface/Menus/UnloadMinifigure.bmp"], // unload minifig button (drops held object)
		["wad0bmp", "Interface/Menus/STOPeverything.bmp"], // stop minifig button (stops any performed task)
		["wad0bmp", "Interface/Menus/Upgrade.bmp"], // button to upgrade a raider or building
		["wad0bmp", "Interface/Menus/telepbuilding.bmp"], // button to upgrade a raider or building
		["wad0bmp", "Interface/Menus/building.bmp"], // button to open up the building menu
		["wad0bmp", "Interface/Menus/BIGvehicle.bmp"], // button to open up the large vehicle menu
		["wad0bmp", "Interface/Menus/SMvehicle.bmp"], // button to open up the small vehicle menu
		["wad0bmp", "Interface/Menus/dynamite.bmp"], // button to instruct a raider to blow up a wall using dynamite
		["wad0bmp", "Interface/Menus/exit.bmp"], // button to instruct a raider to exit the current vehicle

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
		["wad0alpha", "Interface/RightPanel/CrystalSideBar.bmp"], // right side overlay showing crystal and ore count
		["wad0alpha", "Interface/RightPanel/CrystalSideBar_Ore.bmp"], // image representing a single piece of ore on the overlay
		["wad0alpha", "Interface/RightPanel/NoSmallCrystal.bmp"], // image representing no energy crystal on the overlay
		["wad0alpha", "Interface/RightPanel/SmallCrystal.bmp"], // image representing a single energy crystal on the overlay
		["wad0alpha", "Interface/RightPanel/UsedCrystal.bmp"], // image representing a single in use energy crystal on the overlay

		["wad0alpha", "Interface/IconPanel/IconPanel1.bmp"], // top right menu with space for 1 item and back button
		["wad0alpha", "Interface/IconPanel/IconPanel2.bmp"], // top right menu with space for 2 items and back button
		["wad0alpha", "Interface/IconPanel/IconPanel3.bmp"], // top right menu with space for 3 items and back button
		["wad0alpha", "Interface/IconPanel/IconPanel3WOBack.bmp"], // top right menu with space for 3 items without back button
		["wad0alpha", "Interface/IconPanel/IconPanel4.bmp"], // top right menu with space for 4 items and back button
		["wad0alpha", "Interface/IconPanel/IconPanel4WOBack.bmp"], // top right menu with space for 4 items without back button
		["wad0alpha", "Interface/IconPanel/IconPanel5.bmp"], // top right menu with space for 5 items and back button
		["wad0alpha", "Interface/IconPanel/IconPanel6.bmp"], // top right menu with space for 6 items and back button
		["wad0alpha", "Interface/IconPanel/IconPanel7.bmp"], // top right menu with space for 7 items and back button
		["wad0alpha", "Interface/IconPanel/IconPanel8.bmp"], // top right menu with space for 8 items and back button
		["wad0alpha", "Interface/IconPanel/IconPanel9.bmp"], // top right menu with space for 9 items and back button
		["wad0alpha", "Interface/IconPanel/IconPanel10.bmp"], // top right menu with space for 10 items and back button
		["wad0alpha", "Interface/IconPanel/IconPanel11.bmp"], // top right menu with space for 11 items and back button
		["wad0alpha", "Interface/IconPanel/IconPanel11.bmp"], // same as IconPanel4 possibly obsolete

		["wad0alpha", "Interface/IconPanel/Back_HL.bmp"], // back button image used in top right icon panel
		["wad0alpha", "Interface/IconPanel/Back_PR.bmp"], // back button image used in top right icon panel

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
		["js", "gui", "ScoreScreen.js"], // GUI elements used in the score screen

		["wad1txt", "Lego.cfg", "Lego.cfg"], // configuration file with all parameters

		// level data list files
		["js", "levels", "levels.js"], // list of names of playable levels, to be used by the main menu for level selection

		// core
		["js", "", "rockRaiders.js"] // main game file (put last as this contains the main game loop)
	]
};