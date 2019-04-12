/* Function documentation mostly copied from the following URLs
 *
 * https://kb.rockraidersunited.com/User:Jessietail/NERPs_reference
 * https://web.archive.org/web/20131206122442/http://rru-stuff.org/nerpfuncs.html
 * https://kb.rockraidersunited.com/NERPs_documentation#Labels
 *
 */

/**
 * Internally used to validate and parse a register number.
 * @param register
 * @return {number}
 */
NerpRunner.prototype.checkRegister = function (register) {
	const num = parseInt(register);
	if (isNaN(num) || num < 0 || num > this.registers.length) throw "Invalid register (" + register + ") provided";
	return num;
};

/**
 * Internally used to validate and parse a value before setting or adding it with a register.
 * @param value
 * @return {number}
 */
NerpRunner.prototype.checkRegisterValue = function (value) {
	const num = parseInt(value);
	if (isNaN(num)) throw "Invalid register value (" + value + ") provided";
	return num;
};

/**
 * Gets the value currently stored in the given register, internally used to handle all registers with one method.
 * @param register the register to read
 * @return {number} returns the value currently stored in the register
 */
NerpRunner.prototype.getR = function (register) {
	register = this.checkRegister(register);
	return this.registers[register];
};

/**
 * Sets the given value for the given register, internally used to handle all registers with one method.
 * @param register the register to set
 * @param value the value to set for the given register
 */
NerpRunner.prototype.setR = function (register, value) {
	register = this.checkRegister(register);
	value = this.checkRegisterValue(value);
	this.registers[register] = value;
};

/**
 * Adds the given value to the given register, internally used to handle all registers with one method.
 * @param register the register to add to
 * @param value the value to add to the given register
 */
NerpRunner.prototype.addR = function (register, value) {
	register = this.checkRegister(register);
	value = this.checkRegisterValue(value);
	this.registers[register] += value;
};

/**
 * Set the respective timer to the given numerical value. Units are in milliseconds.
 * @param timer
 * @param value
 */
NerpRunner.prototype.setTimer = function (timer, value) {
	const num = parseInt(value);
	if (isNaN(num)) throw "Can't set timer to NaN value: " + value;
	this.timers[timer] = new Date().getTime() + num;
};

/**
 * Gets the value of the respective timer. Units are in milliseconds.
 * @param timer
 * @return {number}
 */
NerpRunner.prototype.getTimer = function (timer) {
	return new Date().getTime() - this.timers[timer];
};

//noinspection JSUnusedGlobalSymbols
/**
 * End the level successfully and show the score screen.
 */
NerpRunner.prototype.setLevelCompleted = function () {
	this.halted = true;
	showScoreScreen("completed");
};

//noinspection JSUnusedGlobalSymbols
/**
 * End the level as failure and show the score screen.
 */
NerpRunner.prototype.setLevelFail = function () {
	this.halted = true;
	showScoreScreen("failed");
};

//noinspection JSUnusedGlobalSymbols
/**
 * Sets tutorial flags
 * @param value a bitmask to set flags with
 */
NerpRunner.prototype.setTutorialFlags = function (value) {
	// TODO implement tutorial flags
	// seems like value must be interpreted bitwise and sets a certain flag on each bit
	// seen so far:
	// 0 = 0x00 allow any click anywhere anytime
	// 3 = 0x11 disallow invalid clicks
	// 4095 = 0x111111111111 set all flags? (seen in Tutorial01 level)
};

//noinspection JSUnusedGlobalSymbols
/**
 * This is used to make messages come up/not come up.
 * @param messagesAllowed
 */
NerpRunner.prototype.setMessagePermit = function (messagesAllowed) {
	this.messagePermit = !messagesAllowed;
};

function setBuildingsUpgradeLevel(typeName, level) {
	buildings.filter(b => b.type === typeName).forEach(b => b.upgradeLevel = level);
}

//noinspection JSUnusedGlobalSymbols
NerpRunner.prototype.setToolStoreLevel = function (level) {
	setBuildingsUpgradeLevel("tool store", level);
};

//noinspection JSUnusedGlobalSymbols
NerpRunner.prototype.setTeleportPadLevel = function (level) {
	setBuildingsUpgradeLevel("teleport pad", level);
};

//noinspection JSUnusedGlobalSymbols
NerpRunner.prototype.setPowerStationLevel = function (level) {
	setBuildingsUpgradeLevel("power station", level);
};

//noinspection JSUnusedGlobalSymbols
NerpRunner.prototype.setBarracksLevel = function (level) {
	setBuildingsUpgradeLevel("support station", level);
};

//noinspection JSUnusedGlobalSymbols
/**
 * Gets the number of tool stores currently built. NOT the total ever built.
 * @return {number}
 */
NerpRunner.prototype.getToolStoresBuilt = function () {
	return buildings.reduce((counter, b) => b.touched && b.type === "tool store" ? ++counter : counter, 0);
};

//noinspection JSUnusedGlobalSymbols
/**
 * Gets the number of minifigures on the level. TODO it is NOT tested if this ignores minifigures in hidden caverns
 * @return {number}
 */
NerpRunner.prototype.getMinifiguresOnLevel = function () {
	return raiders.size();
};

//noinspection JSUnusedGlobalSymbols
/**
 * Gets the number of crystals currently stored.
 * @return {number}
 */
NerpRunner.prototype.getCrystalsCurrentlyStored = function () {
	return RockRaiders.rightPanel.resources.crystal;
};

//noinspection JSUnusedGlobalSymbols
NerpRunner.prototype.getObjectiveSwitch = function () {
	// TODO implement this
	return 0;
};

//noinspection JSUnusedGlobalSymbols
NerpRunner.prototype.setMessageTimerValues = function (arg1, arg2, arg3) {
	// TODO implement this
};

//noinspection JSUnusedGlobalSymbols
NerpRunner.prototype.getMessageTimer = function () {
	return 0; // TODO return remaining amount of time needed to fully play WAV message
};

//noinspection JSUnusedGlobalSymbols
NerpRunner.prototype.cameraUnlock = function () {
	// TODO implement this
};

//noinspection JSUnusedGlobalSymbols
NerpRunner.prototype.setMessage = function (messageNumber, arrowDisabled) {
	if (!this.messagePermit) {
		return;
	}
	const msg = this.messages[messageNumber];
	// TODO show message to user
	console.log(msg.txt);
	// msg.snd resides in sounds/streamed/ which is currently not loaded :(
};

//noinspection JSUnusedGlobalSymbols
NerpRunner.prototype.setCameraGotoTutorial = function (arg1) {
	// TODO implement this
};

//noinspection JSUnusedGlobalSymbols
NerpRunner.prototype.getTutorialBlockIsGround = function (arg1) {
	// TODO implement this
	return 0;
};

NerpRunner.prototype.getTutorialBlockIsPath = function (arg1) {
	// TODO implement this
	return 0;
};

//noinspection JSUnusedGlobalSymbols
NerpRunner.prototype.getOxygenLevel = function () {
	// TODO implement this
	return 100;
};

//noinspection JSUnusedGlobalSymbols
NerpRunner.prototype.getObjectiveShowing = function () {
	// TODO implement this
	return false;
};

//noinspection JSUnusedGlobalSymbols
NerpRunner.prototype.addPoweredCrystals = function () {
	// TODO implement this
};

//noinspection JSUnusedGlobalSymbols
NerpRunner.prototype.disallowAll = function () {
	// TODO implement this
};

//noinspection JSUnusedGlobalSymbols
NerpRunner.prototype.getPoweredPowerStationsBuilt = function () {
	return buildings.filter(b => b.touched && b.type === "power station").length; // FIXME check if station is actually powered
};

//noinspection JSUnusedGlobalSymbols
NerpRunner.prototype.getPoweredBarracksBuilt = function () {
	return buildings.filter(b => b.touched && b.type === "support station").length; // FIXME check if station is actually powered
};

//noinspection JSUnusedGlobalSymbols
NerpRunner.prototype.getRecordObjectAtTutorial = function () {
	// TODO implement this
};

NerpRunner.prototype.callMethod = function (methodName, methodArgs) {
	if (methodName === "Stop") {
		throw "Stop";
	} else if (methodName === "TRUE") {
		return true;
	} else if (methodName === "FALSE") {
		return false;
	}
	const setRegisterMatch = methodName.match(/^SetR([0-7])$/);
	if (setRegisterMatch) {
		return this.setR(setRegisterMatch[1], methodArgs[0]);
	}
	const addRegisterMatch = methodName.match(/^AddR([0-7])$/);
	if (addRegisterMatch) {
		return this.addR(addRegisterMatch[1], methodArgs[0]);
	}
	const getRegisterMatch = methodName.match(/^GetR([0-7])$/);
	if (getRegisterMatch) {
		return this.getR(getRegisterMatch[1]);
	}
	const setTimerMatch = methodName.match(/^SetTimer([0-3])$/);
	if (setTimerMatch) {
		return this.setTimer(setTimerMatch[1], methodArgs[0]);
	}
	const getTimerMatch = methodName.match(/^GetTimer([0-3])$/);
	if (getTimerMatch) {
		return this.getTimer(getTimerMatch[1]);
	}
	const lMethodName = methodName.toLowerCase();
	for (const memberName in this) {
		// noinspection JSUnfilteredForInLoop
		if (memberName.toLowerCase() === lMethodName) {
			// noinspection JSUnfilteredForInLoop
			return this[memberName].apply(this, methodArgs);
		}
	}
	throw "Undefined method: " + methodName;
};

NerpRunner.prototype.conditional = function (left, right) {
	const conditionResult = this.executeStatement(left);
	if (this.debug) {
		console.log("Condition evaluated to " + conditionResult);
	}
	if (conditionResult) {
		this.executeStatement(right);
	}
};

NerpRunner.prototype.executeStatement = function (expression) {
	if (expression.invoke) {
		const argValues = expression.invoke !== "conditional" ? expression.args.map(e => this.executeStatement(e)) : expression.args;
		const result = this.callMethod(expression.invoke, argValues);
		if (result !== undefined && this.debug) {
			console.log("Method returned: " + result);
		}
		return result;
	} else if (expression.comparator) {
		const left = this.executeStatement(expression.left);
		const right = this.executeStatement(expression.right);
		if (expression.comparator === "=") {
			return left === right;
		} else if (expression.comparator === "!=") {
			return left !== right;
		} else if (expression.comparator === "<") {
			return left < right;
		} else if (expression.comparator === ">") {
			return left > right;
		} else {
			console.log(expression);
			throw "Unknown comparator: " + expression.comparator;
		}
	} else if (!isNaN(expression)) { // just a number
		return expression;
	} else if (expression.jump) {
		this.programCounter = this.labels[expression.jump];
		if (this.programCounter === undefined) {
			throw "Label '" + expression.jump + "' is unknown!"
		}
		if (this.debug) {
			console.log("Jumping to label '" + expression.jump + "' in line " + this.programCounter)
		}
	} else {
		console.log(expression);
		throw "Unknown expression: " + expression;
	}
};

NerpRunner.prototype.execute = function (debug = false) {
	this.debug = debug;
	if (this.halted) return;
	try {
		if (this.debug) {
			console.log("Executing following script\n" + this.scriptLines.join("\n"));
			console.log("Registers: " + this.registers);
		}
		for (this.programCounter = 0; this.programCounter < this.statements.length; this.programCounter++) {
			const statement = this.statements[this.programCounter];
			if (this.debug) {
				console.log(this.scriptLines[this.programCounter]);
				console.log(statement);
			}
			if (!statement.label) { // do nothing for label markers
				this.executeStatement(statement);
			}
		}
		debugger;
	} catch (e) {
		if (e === "Stop") {
			return;
		}
		console.log(e);
		console.error("FATAL ERROR! Script execution failed! You can NOT win anymore!");
		this.halted = true;
		debugger;
		throw e;
	}
};

function NerpRunner(debug = false) {
	this.debug = debug;
	this.registers = new Array(8).fill(0);
	this.timers = new Array(4).fill(0);
	this.scriptLines = []; // contains humand readable script strings
	this.statements = []; // contains parsed statements for execution
	this.macros = {};
	this.labels = {};
	this.halted = false;
	this.programCounter = 0;
	this.messages = null;
	// more state variables and switches
	this.messagePermit = null;
}

function preProcess(expression) {
	expression = expression.replace(/^_/, ""); // remove leading underscore
	const number = parseInt(expression);
	if (!isNaN(number)) {
		return number;
	}
	const opSplit = expression.split(/ (=) | (!=) | (>) | (<) /).filter(e => e !== undefined);
	const brackets = expression.match(/^(.+)\((.+)\)$/);
	const spaceSplit = expression.split(" ");
	const labelMatch = expression.match(/([^:]+):$/);
	const jumpMatch = expression.match(/^:([^:]+)$/);
	if (opSplit.length === 3) { // expression contains secondary operator
		return {left: preProcess(opSplit[0]), comparator: opSplit[1], right: preProcess(opSplit[2])};
	} else if (brackets) {
		const args = brackets[2].split(",").map(a => preProcess(a));
		return {invoke: brackets[1], args: args};
	} else if (spaceSplit.length > 1) { // space split must be the very last since most expressions contain space
		const args = spaceSplit.length === 2 ? [preProcess(spaceSplit[1])] : spaceSplit.splice(1).map(a => preProcess(a));
		return {invoke: spaceSplit[0], args: args};
	} else if (labelMatch) { // label definition
		return {label: labelMatch[1]}
	} else if (jumpMatch) { // jump to label
		return {jump: jumpMatch[1]};
	} else { // function call without args
		if (expression.match(/[ =?><!]/)) {
			throw "Invlid expression given, parsing must have failed before somewhere";
		}
		return {invoke: expression, args: []};
	}
}

function NerpParser(nerpScript) {
	const nerpRunner = new NerpRunner();
	const lines = nerpScript.split("\n").map(l => l
		.split("//")[0].trim() // before comment starts
		.split(";")[0].trim() // before preprocessor comment starts
		.replace(/_/g, "") // some preprocessor macros use this prefix
		.replace(/\bTRUE \? /, "") // some weird requirement of the original language
		.replace(/[{}]/g, "") // duplicate limit for macros using labels too
	);
	for (let c = 0; c < lines.length; c++) {
		const line = lines[c];
		if (line.length < 1) {
			continue; // ignore empty lines, but important for macro closure
		}
		if (line.startsWith("#include ")) { // include other nerp scripts/headers
			const includeName = line.replace(/^#include /, "").trim().slice(1, -1);
			if (includeName === "nerpdef.h") {
				// trivial default header file, is applied by search and replace above
				// see https://github.com/jgrip/legorr/blob/master/nerpdef.h
				continue;
			}
			const includedRunner = GameManager.nerps["Levels/" + includeName];
			if (!includedRunner) {
				throw "Can't include unknown nerp script: " + line;
			}
			nerpRunner.scriptLines = nerpRunner.scriptLines.concat(includedRunner.scriptLines);
			// copy macros from included file to current file
			nerpRunner.macros = Object.assign({}, nerpRunner.macros, includedRunner.macros);
		} else if (line.startsWith("#define ")) { // parse C++ preprocessor macro
			const firstLine = line.replace(/^#define /, "").split(" ");
			const macroLines = [firstLine.splice(1).join(" ").replace(/\\$/, "").trim()];
			let mLine = line;
			let append = false;
			while (mLine.endsWith("\\") && c < lines.length - 1) {
				c++;
				mLine = lines[c].trim();
				const macroLine = mLine.replace(/\\$/, "").trim();
				if (macroLine.length > 0) {
					if (append) {
						append = false;
						macroLines[macroLines.length - 1] += macroLine;
					} else {
						macroLines.push(macroLine);
					}
				}
				if (mLine.match(/:\\$/)) {
					append = true;
				}
			}
			const macroCall = firstLine[0].split("(");
			nerpRunner.macros[macroCall[0]] = {
				args: macroCall[1].replace(/\)$/, "").split(","),
				lines: macroLines
			};
		} else {
			// check if this line contains a macro
			const split = line.split("("); // not a very stable check though...
			const macroName = nerpRunner.macros[split[0]];
			if (macroName) {
				const argValues = split.splice(1).join("(").slice(0, -1).split(",");
				if (argValues.length !== macroName.args.length) {
					throw "Invalid number of args provided for macro in line " + line;
				}
				const macroLinesWithArgs = macroName.lines.map(function (line) {
					for (let c = 0; c < argValues.length; c++) {
						line = line.replace(new RegExp("\\b" + macroName.args[c] + "\\b"), argValues[c]);
					}
					return line;
				});
				nerpRunner.scriptLines = nerpRunner.scriptLines.concat(macroLinesWithArgs);
			} else {
				nerpRunner.scriptLines.push(line);
			}
		}
	}
	// somewhat precompile the script and create syntax tree
	// must be done in separate block to make sure the script is complete and we can refer/rely on line numbers for label jumps
	for (let c = 0; c < nerpRunner.scriptLines.length; c++) {
		const line = nerpRunner.scriptLines[c];
		nerpRunner.statements[c] = line.replace(/\(\)/g, "") // now the macros are applied and obsolete empty "()" can be removed
			.split(" ? ");
		const labelMatch = line.match(/(\S+):/);
		if (nerpRunner.statements[c].length === 2) { // line contains condition (primary operator)
			nerpRunner.statements[c] = {
				invoke: "conditional",
				args: [preProcess(nerpRunner.statements[c][0]), preProcess(nerpRunner.statements[c][1])]
			};
		} else if (labelMatch) { // keep label line number for later usage
			const labelName = labelMatch[1];
			nerpRunner.labels[labelName] = c;
			nerpRunner.statements[c] = {label: labelName};
		} else if (nerpRunner.statements[c].length === 1) { // just a call
			nerpRunner.statements[c] = preProcess(nerpRunner.statements[c][0]);
		} else { // lines contains more than 1 condition statement
			throw "Can't deal with line: " + line;
		}
	}
	return nerpRunner;
}
