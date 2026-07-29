#!/usr/bin/env python3
import shutil, os, sys
from pathlib import Path

EXCLUDE = {'.git', 'node_modules', '.vercel', '.husky', '.specstory', '.vscode', '.env', '.env.production', '.env.example'}

def copy_project(src: Path, dst: Path):
    if not src.is_dir():
        print(f"Source {src} does not exist or is not a directory", file=sys.stderr)
        return
    def ignore(dir, entries):
        return [e for e in entries if e in EXCLUDE]
    # Ensure destination exists
    dst.mkdir(parents=True, exist_ok=True)
    # Copy tree, overwriting existing files
    for item in src.iterdir():
        if item.name in EXCLUDE:
            continue
        dest_path = dst / item.name
        if item.is_dir():
            shutil.copytree(item, dest_path, dirs_exist_ok=True, ignore=ignore)
        else:
            shutil.copy2(item, dest_path)
    print(f"Copied {src} -> {dst}")

def main():
    base = Path(__file__).resolve().parents[2]  # repo root (AssiutRoboticsWeb)
    # Define pairs
    pairs = [
        (base / 'AssiutRoboticsServer',
         base / 'Staging_robotics_server'),
        (base / 'Assiut-Robotics-Website',
         base / 'Staging_Robotics_website')
    ]
    for src, dst in pairs:
        copy_project(src, dst)

if __name__ == '__main__':
    main()
