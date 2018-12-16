#run me to convert all supported rock raiders map files in the specified directory to javascript files

#! /usr/bin/env python3
# -*- coding: utf-8 -*-

import os
import sys

supportedFileTypes = {"surf" : "terrain",
                      "cror" : "cryore",
                      "dugg" : "predug",
                      "high" : "surface",
                      "path" : "path",
                      "fall" : "fall"
                      }
supportedFileExtensions = ["ol"]

#get name, extension, and fileType of input file (fileType will be None if unspoorted)
def getFileDetails(f):
    global supportedFileTypes
    global supportedFileExtensions
    
    name, extension = os.path.splitext(f)
    normalizedName = name.lower()
    
    #section of name preceding the first _ tells us the file type if its a .map file, otherwise the extension tells us the file type (eg. ol file)
    fileType = supportedFileTypes[normalizedName.split("_")[0]] if normalizedName.split("_")[0] in supportedFileTypes and extension == ".map" else \
    extension[1:] if extension[1:] in supportedFileExtensions else None

    return {
        "name": name,
        "ext": extension,
        "type": fileType
    }
    
#attempt to convert all supported files in the current directory
def convertDirFiles(dir = None):
    if (dir == None):
        dir = os.getcwd()
    files = getFileList(dir)
    for file in files:
        convertFile(file)
    
#get list of files in specified directory (defaults to current directory if not specified)
def getFileList(dir = None):
    if (dir == None):
        dir = os.getcwd()
    f = []
    for (dirpath, dirnames, filenames) in os.walk(dir):
        f.extend(filenames)
        return f

#attempt to convert input file to a .js data file that is able to be read in to the engine
def convertFile(inputFile):
    inputFilePath = os.path.abspath(inputFile)
    # First ensure that there is a file to convert in the working directory
    if not os.path.isfile(inputFilePath):
        print("Error: file named '{0}' not found".format(inputFile))
        return
    # Extract required details about the given file
    details = getFileDetails(inputFile)
    if (details["type"] == None):
        print("Error: file type of '{0}' not supported".format(inputFile))
        return
    outputFile = "{0}.js".format(details["name"])

    # Delete conversion file if it already exists,
    # as this file is going to be recreated
    if os.path.isfile(outputFile):
        os.remove(outputFile)
        print("File {0} already exists -> deleting file".format(outputFile))

    # Open the file and attempt to read it
    with open(inputFilePath, "rb") as f:
        i = 0
        levelData = []

        if details["type"] in ("terrain", "cryore", "predug", "surface", "path", "fall"):
            byte = f.read(1)
            mapWidth = None
            mapHeight = None
            firstRun = True
            levelData.append([])

            while byte:
                i += 1
                levelData[-1].append(byte[0])
                if i == 9 and firstRun:
                    mapWidth = int(byte[0])
                if i == 13 and firstRun:
                    mapHeight = int(byte[0])
                if (
                    ((firstRun) and (i == 16)) or
                    ((not firstRun) and (i == mapWidth * 2))
                ):
                    levelData.append([])
                    i = 0
                    firstRun = False
                byte = f.read(1)

        elif details["type"] == "ol":
            for line in f:
                i += 1
                if i == 1:
                    levelData.append("object = {")
                else:
                    if line.strip() == b'' or line.strip().startswith(b';'): #ignore ;'s as these are commented out lines
                        continue
                    
                    levelData.append(
                        str(line.decode('ascii'))
                        .replace("-","_") #build tutorial 2 ol file uses -'s in object names. replace these with _'s so JS accepts them
                        .replace(" ", ":")
                        .replace("\t", ":")
                        .lstrip(":")
                        .strip()
                    )
                    breakPos = levelData[-1].find(":")
                    if levelData[-1][breakPos+1].isalpha():
                        levelData[-1] = levelData[-1][:breakPos+1] \
                        + '"' + levelData[-1][breakPos+1:] + '"'
                    if (
                        (levelData[-2][-1] != "{") and
                        (levelData[-1][-1] != "}")
                    ):
                        levelData[-2] += ","

    print("Data successfully read from file: {0}".format(inputFile))

    if details["type"] in ("terrain", "cryore", "predug", "surface", "path", "fall"):
        print("Map dimensions: {0}x{1} units".format(
              str(mapWidth), str(mapHeight)))

        # Throw out the first row of bytes, as it's not map data
        # in addition to the last row, as it is just an empty list
        del levelData[0]
        del levelData[-1]

        # Remove every odd byte, as they are always going to be 0
        for i in range(len(levelData)):
            del levelData[i][1::2]

    # Write the remaining contents of levelData to
    # a new JS file for use by the game engine
    with open(outputFile, "a") as file:
        if details["type"] in ("terrain", "cryore", "predug", "surface", "path", "fall"):
            file.write("object = {{ \nlevel: [\n{0}\n]\n}};".format(
                       ",\n".join(map(str, levelData))))
        elif details["type"] == "ol":
            file.write("{0};".format("\n".join(map(str, levelData))))

    print("Successfully wrote level data to file: {0}".format(outputFile))


def main():
    if (len(sys.argv) > 1):
        inputFile = sys.argv[1]
        convertFile(inputFile)
    else:
        print("No input file specified. converting all detected files in working dir")
        convertDirFiles()

if __name__ == "__main__":
    main()
