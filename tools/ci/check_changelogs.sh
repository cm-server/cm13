#!/bin/bash
set -euo pipefail

python3 tools/GenerateChangelog/ss13_genchangelog.py html/changelogs
