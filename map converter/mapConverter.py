#! /usr/bin/env python3
# -*- coding: utf-8 -*-

import os
import sys


def getFileDetails(f):
    name, extension = os.path.splitext(f)
    normalizedName = name.lower()
    fileType = None

    if normalizedName.startswith("surf"):
        fileType = "terrain"
    elif normalizedName.startswith("cror"):
        fileType = "cryore"
    elif normalizedName.startswith("dugg"):
        fileType = "predug"
    elif normalizedName.startswith("high"):
        fileType = "surface"
    elif extension.lower().endswith(".ol"):
        fileType = "ol"

    return {
        "name": name,
        "ext": extension,
        "type": fileType
    }


def main():
    try:
        inputFile = sys.argv[1]
        inputFilePath = os.path.abspath(inputFile)
    except IndexError:
        print("Please give the input file as the script's argument.")
        return

    # First ensure that there is a file to convert in the working directory
    if not os.path.isfile(inputFilePath):
        print("Error: file named: {0} not found -> exiting".format(inputFile))
        return

    # Extract required details about the given file
    details = getFileDetails(inputFile)
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

        if details["type"] in ("terrain", "cryore", "predug", "surface"):
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
                    if line == b'\r\n':
                        continue

                    levelData.append(
                        str(line.decode('ascii'))
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

    if details["type"] in ("terrain", "cryore", "predug", "surface"):
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
        if details["type"] in ("terrain", "cryore", "predug", "surface"):
            file.write("object = {{ \nlevel: [\n{0}\n]\n}};".format(
                       ",\n".join(map(str, levelData))))
        elif details["type"] == "ol":
            file.write("{0};".format("\n".join(map(str, levelData))))

    print("Successfully wrote level data to file: {0}".format(outputFile))

if __name__ == "__main__":
    main()
