//note that text files (such as levels or assets) should be stored in .js files and in variables rather than in text files, as text files cnanot be loaded from the machine without user interference due to safety restrictions
//currently no way to dynamically load / unload, will look into this later
//load type (dir or file),file type (img, snd, or js),directory (blank = root),extension or file name (blank = all file types)
//due to security concerns, javascript cannot search a dir for files, so load type is no longer a thing
object = {
		assets: [
          ["img", "images", "power path 1 (1).png"], //power path
          ["img", "images", "ore 1 (1).png"], //ore
          ["img", "images", "energy crystal 1 (1).png"], //energy crystal
          ["img", "images", "teleport pad 1 (1).png"], //teleport pad
          ["img", "images", "tool store 1 (1).png"], //tool store
          ["img", "images", "raider 1 (1).png"], //rock raider
          ["img", "images", "ground 1 (1).png"], //ground
          ["img", "images", "building site 1 (1).png"], //building site
          ["img", "images", "lava 1 (1).png"], //lava
          ["img", "images", "water 1 (1).png"], //water
          ["img", "images", "energy crystal seam 1 (1).png"], //energy crystal seam
          ["img", "images", "ore seam 1 (1).png"], //ore seam
          ["img", "images", "recharge seam 1 (1).png"], //recharge seam
          ["img", "images", "dirt 1 (1).png"], //dirt
          ["img", "images", "loose rock 1 (1).png"], //loose rock
          ["img", "images", "hard rock 1 (1).png"], //hard rock
          ["img", "images", "rubble 1 (1).png"], //rubble swept 0 times. 4 sweeps required to clear fully
          ["img", "images", "rubble 2 (1).png"], //rubble swept 1 time. 3 sweeps required to clear fully
          ["img", "images", "rubble 3 (1).png"], //rubble swept 2 times. 2 sweeps required to clear fully
          ["img", "images", "rubble 4 (1).png"], //rubble swept 3 times. 1 sweep required to clear fully
          ["img", "images", "solid rock 1 (1).png"], //solid rock
          ["img", "images", "teleport raider button 1 (1).png"], //teleport rock raider button
          ["img", "images", "cancel selection button 1 (1).png"], //cancel selection button
          ["img", "images", "unload minifig button 1 (1).png"], //unload minifig button (drops held object)
          ["img", "images", "stop minifig button 1 (1).png"], //stop minifig button (stops any performed task)
          ["js", "levels", "test level 1.js"], //1st level for testing
          ["js", "levels", "test level 2.js"], //2nd level for testing
          ["js", "levels", "Surf_01.js"], //terrain map file of first level from original game converted using map converter
          ["js", "levels", "Cror_01.js"], //cryore map file of first level from original game converted using map converter
          ["js", "levels", "01.js"], //OL file of first level from original game converted using map converter
          ["js", "levels", "Dugg_01.js"], //predug file of first level from original game converted using map converter
          ["js", "classes", "Collectable.js"], //Collectable class
          ["js", "classes", "Raider.js"], //Raider class
          ["js", "classes", "Space.js"], //Space class
          ["js", "", "rockRaiders.js"] //main game
          ]
};