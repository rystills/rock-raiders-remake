/**
 * simple container class to store task attributes
 * @param type: the type of task represented by this instance
 * @param obj: the object with which this task is associated
 */
function Task(type, obj) {
	this.type = type;
	this.obj = obj;
}

/**
 * custom toString letting the user know the task type and corresponding object
 */
Task.prototype.toString = function () {
	return "Task '" + this.type + "' at '" + this.obj + "'";
};