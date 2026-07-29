#!/usr/bin/env python3
import sys
import os

# Ensure the directory of this script (tools/) is in sys.path
# so that the repository_analyzer package can be imported from anywhere.
script_dir = os.path.dirname(os.path.abspath(__file__))
if script_dir not in sys.path:
    sys.path.insert(0, script_dir)

try:
    from repository_analyzer.analyze import main
except ImportError as e:
    print(f"Error importing repository_analyzer: {e}", file=sys.stderr)
    print("Please make sure the repository_analyzer package directory exists next to this script.", file=sys.stderr)
    sys.exit(1)

if __name__ == "__main__":
    main()
