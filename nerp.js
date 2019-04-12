NerpRunner.prototype.checkRegister = function (register) {
	const num = parseInt(register);
	if (isNaN(num) || num < 0 || num > this.registers.length) {
		throw "Invalid register (" + register + ") provided"
	}
	return num;
};

NerpRunner.prototype.checkRegisterValue = function (value) {
	const num = parseInt(value);
	if (isNaN(num)) {
		throw "Invalid register value (" + value + ") provided"
	}
	return num;
};

NerpRunner.prototype.getR = function (register) {
	register = this.checkRegister(register);
	return this.registers[register];
};

NerpRunner.prototype.setR = function (register, value) {
	register = this.checkRegister(register);
	value = this.checkRegisterValue(value);
	this.registers[register] = value;
};

NerpRunner.prototype.addR = function (register, value) {
	register = this.checkRegister(register);
	value = this.checkRegisterValue(value);
	this.registers[register] += value;
};

NerpRunner.prototype.setTimer = function (timer, value) {
	this.timers[timer] = value;
};

NerpRunner.prototype.getTimer = function (timer) {
	return this.timers[timer];
};

NerpRunner.prototype.setLevelCompleted = function () {
	showScoreScreen("completed");
};

NerpRunner.prototype.setLevelFail = function () {
	showScoreScreen("failed");
};

NerpRunner.prototype.setTutorialFlags = function (value) {
	// TODO implement this
};

NerpRunner.prototype.setMessagePermit = function (value) {
	// TODO implement this
};

NerpRunner.prototype.setToolStoreLevel = function (level) {
	// TODO implement this
};

NerpRunner.prototype.setTeleportPadLevel = function (level) {
	// TODO implement this
};

NerpRunner.prototype.setPowerStationLevel = function (level) {
	// TODO implement this
};

NerpRunner.prototype.setBarracksLevel = function (level) {
	// TODO implement this
};

NerpRunner.prototype.getToolStoresBuilt = function () {
	// TODO implement this
	return 1;
};

NerpRunner.prototype.getMinifiguresOnLevel = function () {
	// TODO implement this
	return 0;
};

NerpRunner.prototype.getCrystalsCurrentlyStored = function () {
	return RockRaiders.rightPanel.resources.crystal;
};

NerpRunner.prototype.getObjectiveSwitch = function () {
	// TODO implement this
	return 0;
};

NerpRunner.prototype.setMessageTimerValues = function (arg1, arg2, arg3) {
	// TODO implement this
};

NerpRunner.prototype.getMessageTimer = function () {
	// TODO implement this
	return 0;
};

NerpRunner.prototype.cameraUnlock = function () {
	// TODO implement this
};

NerpRunner.prototype.setMessage = function (arg1, arg2) {
	// TODO implement this
};

NerpRunner.prototype.setCameraGotoTutorial = function (arg1) {
	// TODO implement this
};

NerpRunner.prototype.getTutorialBlockIsGround = function (arg1) {
	// TODO implement this
	return 0;
};

NerpRunner.prototype.getOxygenLevel = function () {
	// TODO implement this
	return 100;
};

NerpRunner.prototype.getObjectiveShowing = function () {
	// TODO implement this
	return false;
};

NerpRunner.prototype.callMethod = function (methodName, methodArgs) {
	if (methodName === "Stop") {
		this.stopCalled = true;
		return;
	} else if (methodName.startsWith("_")) {
		methodName = methodName.substr(1);
		if (methodName.endsWith("()")) {
			methodName = methodName.slice(0, -2);
		} else if (methodName.endsWith(")")) {
			const split = methodName.split("(");
			methodName = split[0];
			const nerpRunner = this;
			methodArgs = split.splice(1).join("(").slice(0, -1).split(",").map(function (arg) {return nerpRunner.evaluateCondition(arg)});
		}
	} else if (!methodArgs) {
		const nameArg = methodName.split(" ");
		if (nameArg.length === 2) {
			methodName = nameArg[0];
			methodArgs = nameArg[1];
		}
	}
	const setRegisterMatch = methodName.match(/^SetR([0-7])$/);
	if (setRegisterMatch) {
		return this.setR(setRegisterMatch[1], methodArgs);
	}
	const addRegisterMatch = methodName.match(/^AddR([0-7])$/);
	if (addRegisterMatch) {
		return this.addR(addRegisterMatch[1], methodArgs);
	}
	const getRegisterMatch = methodName.match(/^GetR([0-7])$/);
	if (getRegisterMatch) {
		return this.getR(getRegisterMatch[1]);
	}
	const setTimerMatch = methodName.match(/^SetTimer([0-3])$/);
	if (setTimerMatch) {
		return this.setTimer(setTimerMatch[1]);
	}
	const getTimerMatch = methodName.match(/^GetTimer([0-3])$/);
	if (getTimerMatch) {
		return this.getTimer(getTimerMatch[1]);
	}
	for (const memberName in this) {
		if (memberName.toLowerCase() === methodName.toLowerCase()) {
			const runnerMethod = this[memberName];
			if (runnerMethod) {
				return runnerMethod(methodArgs);
			}
		}
	}
	throw "Undefined function " + methodName + " with args: " + methodArgs;
};

NerpRunner.prototype.evaluateCondition = function (expression) {
	try {
		return this.callMethod(expression); // TODO use any args?
	} catch (e) {
		const number = parseInt(expression);
		if (!isNaN(number)) {
			return number;
		}
	}
	throw "Can't evaluate expression: " + expression;
};

NerpRunner.prototype.execute = function (debug = false) {
	if (this.isFailed) {
		return;
	}
	try {
		this.stopCalled = false;
		for (let c = 0; c < this.nerpLines.length; c++) {
			const line = this.nerpLines[c];
			const conditionMatch = line.split(" ? ");
			if (conditionMatch.length === 2) {
				const condition = conditionMatch[0];
				const action = conditionMatch[1].split(" ");
				const methodName = action[0];
				const methodArgs = action[1];
				if (debug)
					console.log("if " + condition + " call " + methodName + " with args " + methodArgs);
				if (condition !== "TRUE") {
					const equalCondition = condition.split(" = ");
					if (equalCondition.length === 2) {
						const leftResult = this.evaluateCondition(equalCondition[0]);
						const rightResult = this.evaluateCondition(equalCondition[1]);
						if (!(leftResult === rightResult)) {
							if (debug)
								console.log("Condition not satisfied. Skipping execution");
							continue;
						}
					} else {
						const greaterCondition = condition.split(" > ");
						if (greaterCondition.length === 2) {
							const leftResult = this.evaluateCondition(greaterCondition[0]);
							const rightResult = this.evaluateCondition(greaterCondition[1]);
							if (!(leftResult > rightResult)) {
								if (debug)
									console.log("Condition not satisfied. Skipping execution");
								continue;
							}
						} else {
							const smallerCondition = condition.split(" < ");
							if (smallerCondition.length === 2) {
								const leftResult = this.evaluateCondition(smallerCondition[0]);
								const rightResult = this.evaluateCondition(smallerCondition[1]);
								if (!(leftResult < rightResult)) {
									if (debug)
										console.log("Condition not satisfied. Skipping execution");
									continue;
								}
							} else {
								try {
									if (!this.callMethod(condition)) {
										if (debug)
											console.log("Condition not satisfied. Skipping execution");
										continue;
									}
								} catch (e) {
									throw "Can't evaluate unknown condition: " + condition;
								}
							}
						}
					}
				}
				const labelMatch = methodName.match(/:(.+)/);
				if (labelMatch) {
					const labelName = labelMatch[1];
					const labelIndex = this.labels[labelName];
					if (!labelIndex && labelIndex !== 0) {
						throw "Can't jump to undefined label: " + labelName;
					}
					c = labelIndex;
				} else {
					this.callMethod(methodName, methodArgs);
				}
			} else if (line.match(/:$/)) {
				// just skip over label during execution
			} else if (line === "{" || line === "}") {
				// function borders seem irrelevant, just ignore them
			} else if (line === "Stop") {
				return;
			} else {
				throw "Unknown nerp script line: " + line;
			}
			if (this.stopCalled) {
				return;
			}
		}
	} catch (e) {
		console.error(e);
		// TODO find a better way to inform user, maybe autoquit?
		console.error("FATAL ERROR! Script execution failed! You can NOT win anymore!");
		this.isFailed = e;
	}
};

function NerpRunner() {
	this.registers = new Array(8).fill(0);
	this.timers = new Array(4).fill(0);
	this.nerpLines = [];
	this.macros = {};
	this.labels = {};
	this.stopCalled = false;
	this.isFailed = null;
}

function NerpParser(nerpScript) {
	const nerpRunner = new NerpRunner();
	const lines = nerpScript.split("\n");
	for (let c = 0; c < lines.length; c++) {
		const line = lines[c].split("//")[0].trim().replace(/;$/, "");
		const labelMatch = line.match(/(\S+):/);
		if (line.length < 1 || line.startsWith("//")) {
			// ignore comments and empty lines
		} else if (line === ";;;;;;;;;;;;;;;;;;;;;") {
			// ignore stamping header
			c += 9;
		} else if (line.startsWith("#include ")) {
			const includeName = line.replace(/^#include /, "").trim().slice(1, -1);
			if (includeName === "nerpdef.h") {
				// trivial default header file, can be easily applied later
				// see https://github.com/jgrip/legorr/blob/master/nerpdef.h
				continue;
			}
			const includedRunner = GameManager.nerps["Levels/" + includeName];
			if (!includedRunner) {
				throw "Can't include unknown nerp script: " + line;
			}
			nerpRunner.nerpLines.concat(includedRunner.nerpLines);
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
		} else if (labelMatch) {
			nerpRunner.labels[labelMatch[1]] = nerpRunner.nerpLines.length;
			nerpRunner.nerpLines.push(line);
		} else {
			// check if this line contains a macro
			const split = line.split("(");
			const macro = nerpRunner.macros[split[0]];
			if (macro) {
				const argValues = split.splice(1).join("(").slice(0, -1).split(",");
				if (argValues.length !== macro.args.length) {
					throw "Invalid number of args provided for macro in line " + line;
				}
				const macroLinesWithArgs = macro.lines.map(function (line) {
					for (let c = 0; c < argValues.length; c++) {
						line = line.replace(new RegExp("\\b" + macro.args[c] + "\\b"), argValues[c]);
					}
					return line;
				});
				nerpRunner.nerpLines.concat(macroLinesWithArgs);
			} else {
				nerpRunner.nerpLines.push(line);
			}
		}
	}
	return nerpRunner;
}
