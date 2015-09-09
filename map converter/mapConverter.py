import os

#name = "Surf_01"
#name = "Cror_01"
#name = "01"
name = "Dugg_01"
#type = "terrain"
#type = "cryore"
#type = "ol"
type = "predug"
extension = ".map"
#extension = ".ol"

def main():
    #first ensure that there is a file to convert in the working directory 
    if not (os.path.isfile(name + extension)):
        print("Error: file named: {0} not found -> exiting".format(name + extension));
        return
    
    #delete conversion file if it already exists, as this file is going to be recreated
    if os.path.isfile("{0}.js".format(name)):
        os.remove("{0}.js".format(name))
        print("File named: {0}.js already exists in this directory -> deleting file".format(name))
    
    #open map file and attempt to read it
    with open(name + extension, "rb") as f:  
        i = 0
        levelData = []
        if (type == "terrain" or type == "cryore" or type == "predug"):   
            byte = f.read(1)
            mapWidth = None
            mapHeight = None
            firstRun = True
            levelData.append([])
            while byte:
                i += 1
                levelData[-1].append(byte[0])
                if (i == 9 and firstRun):
                    mapWidth = int(byte[0])
                if (i == 13 and firstRun):
                    mapHeight = int(byte[0])
                if (((firstRun) and (i == 16)) or ((not firstRun) and (i == mapWidth*2))):
                    levelData.append([])
                    i = 0
                    firstRun = False
                byte = f.read(1)
        elif (type == "ol"):
            for line in f:
                i += 1
                if i == 1:
                    levelData.append("object = {")
                else:
                    if line == b'\r\n':
                        continue;
                    levelData.append(str(line.decode('ascii')).replace(" ",":").replace("\t",":").lstrip(":").strip()) 
                    breakPos = levelData[-1].find(":")
                    if levelData[-1][breakPos+1].isalpha():
                        levelData[-1] = levelData[-1][:breakPos+1] + '"' + levelData[-1][breakPos+1:] + '"'
                    if (levelData[-2][-1] != "{") and (levelData[-1][-1] != "}"):
                        levelData[-2] += ","
                    
            
    print("Data successfully read from file: {0}".format(name + extension))
    
    if (type == "terrain" or type == "cryore" or type == "predug"):
        print("Map dimensions: {0}x{1} units".format(str(mapWidth),str(mapHeight)))
            
        #throw out the first row of bytes, as its data is not part of the map
        del levelData[0]
        #throw out the last row, as it is just an empty list
        del levelData[-1]
        
        #remove every odd byte, as they are always going to be 0
        for i in range(len(levelData)):
            del levelData[i][1::2]
        
    #write the remaining contents of levelData to a new JS file for use by the game engine
    with open("{0}.js".format(name),'a') as file:
        if (type == "terrain" or type == "cryore" or type == "predug"):
            file.write("object = {{ \nlevel: [\n{0}\n]\n}};".format(",\n".join(map(str,levelData))))
        elif (type == "ol"):
            file.write("{0};".format("\n".join(map(str,levelData))))
        
    print("Successfully wrote level data to file: {0}.js".format(name))

if __name__ == "__main__":
    main()