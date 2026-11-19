#!/usr/bin/env python3
"""Check questionnaire mapping for new indexed chapters, leaving old gaps untouched.

Usage: python3 scripts/check-questionnaire-coverage.py <base-git-ref>
"""
import json
from pathlib import Path
import re
import subprocess
import sys


def main():
    if len(sys.argv) != 2:
        raise SystemExit("Usage: check-questionnaire-coverage.py <base-git-ref>")
    before = json.loads(subprocess.check_output(
        ["git", "show", f"{sys.argv[1]}:chapters.json"], text=True
    ))
    now = json.loads(Path("chapters.json").read_text(encoding="utf-8"))
    old_ids = {chapter["id"] for chapter in before["chapters"]}
    current_ids = {chapter["id"] for chapter in now["chapters"]}
    added_ids = current_ids - old_ids

    source = Path("questionnaire.html").read_text(encoding="utf-8")
    groups = re.search(
        r"\bvar GROUPS\s*=\s*\[(.*?)\];\s*var groups\s*=",
        source, flags=re.DOTALL,
    )
    if not groups:
        raise SystemExit("Questionnaire groups could not be read")
    answers = re.findall(
        r'\[\s*"[^"\n]*"\s*,\s*\[([^\]]*)\]\s*\]',
        groups.group(1), flags=re.DOTALL,
    )
    if not answers:
        raise SystemExit("Questionnaire contains no recommendation lists")
    referenced_ids = {
        match
        for answer in answers
        for match in re.findall(r'"([a-zA-Z0-9_-]+)"', answer)
    }
    unknown_ids = referenced_ids - current_ids
    if unknown_ids:
        raise SystemExit("Unknown questionnaire chapter IDs: " + ", ".join(sorted(unknown_ids)))
    missing_ids = added_ids - referenced_ids
    if missing_ids:
        raise SystemExit(
            "New chapters must be recommended by a relevant questionnaire question: "
            + ", ".join(sorted(missing_ids))
        )
    print(f"Questionnaire coverage passed: {len(added_ids)} new chapter(s) mapped.")


if __name__ == "__main__":
    main()
