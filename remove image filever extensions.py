import os
def main():
    for dn in os.listdir("images"):
        for fn in os.listdir("images\{0}".format(dn)):
            if ("1 (1).png" in fn):
                fnDir = "images\{0}\{1}".format(dn,fn)
                print("renaming '{0}' to '{1}'".format(fnDir,fnDir.replace(" 1 (1).png",".png")))
                os.rename(fnDir, fnDir.replace(" 1 (1).png",".png"))
	
if __name__ == "__main__":
    main()
