function Task(type,obj) { //simple container class to store task attributes
	this.type = type; //what type of task is this
	this.obj = obj; //what object is associated with this task (ex. a Space or Collectable instance)
}