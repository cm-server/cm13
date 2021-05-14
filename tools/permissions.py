import os

dirs = [
    "tools/ci",
    "tools/build",
    "tools/bootstrap"
]

def update_index(dir):
    for root, dirs, files in os.walk(f"./{dir}"):
        for d in dirs:
            update_index(f"{dir}/{d}")
        for f in files:
            os.system(f"git update-index --chmod=+x {dir}/{f}")

for folder in dirs:
    update_index(folder)

