#!/usr/bin/env python3
"""Scans the /files folder and writes files.json so the website knows what to show.

You normally don't run this yourself: the GitHub Action in .github/workflows
runs it automatically every time you upload something.

Layout it understands:
  files/<course-folder>/<file>.pdf                 -> shown under "Summaries"
  files/<course-folder>/<Group name>/<file>.pptx   -> shown under that group name
"""
import json
import os

ROOT = os.path.dirname(os.path.abspath(__file__))
FILES_DIR = os.path.join(ROOT, "files")
ALLOWED = {".pdf", ".ppt", ".pptx", ".doc", ".docx"}


def natural_key(s):
    import re
    return [int(t) if t.isdigit() else t.lower() for t in re.split(r"(\d+)", s)]


def main():
    manifest = {}
    if os.path.isdir(FILES_DIR):
        for course in sorted(os.listdir(FILES_DIR)):
            course_dir = os.path.join(FILES_DIR, course)
            if not os.path.isdir(course_dir):
                continue
            items = []
            for dirpath, _dirs, names in os.walk(course_dir):
                rel = os.path.relpath(dirpath, course_dir)
                group = None if rel == "." else rel.replace(os.sep, " / ")
                for name in names:
                    if os.path.splitext(name)[1].lower() not in ALLOWED:
                        continue
                    full = os.path.join(dirpath, name)
                    items.append({
                        "name": name,
                        "path": os.path.relpath(full, ROOT).replace(os.sep, "/"),
                        "size": os.path.getsize(full),
                        "group": group or "Summaries",
                    })
            items.sort(key=lambda i: (i["group"] != "Summaries", natural_key(i["group"]), natural_key(i["name"])))
            manifest[course] = items

    with open(os.path.join(ROOT, "files.json"), "w", encoding="utf-8") as f:
        json.dump(manifest, f, ensure_ascii=False, indent=2)
    total = sum(len(v) for v in manifest.values())
    print("files.json written: %d courses, %d files" % (len(manifest), total))


if __name__ == "__main__":
    main()
