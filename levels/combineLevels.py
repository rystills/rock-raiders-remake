#run me to recombine all of the level files into "levels.js"

import os

def main():
    fileData = []
    #append all map file data to fileData array
    files = [f for f in os.listdir('.') if os.path.isfile(f) and f[-3:] == ".js" and f != "levels.js"]
    for f in files:
        with open(f) as of:
            fileData.append([f,of.read()])
    
    #now write all data to levels.js
    with open("levels.js","w") as f:
        f.write("object = {\n")
        for fd in fileData:
            f.write(fd[1].strip("\n").replace("object = {","'" + fd[0] + "' : {")[:-1]+",\n")
        f.write("\n};")
        
if __name__ == "__main__":
    main()