#!/usr/bin/env python3
from PIL import Image
import sys
from pathlib import Path

if len(sys.argv) != 2:
    print(f"Usage: {sys.argv[0]} input_icon.png")
    sys.exit(1)

input_path = Path(sys.argv[1])
if not input_path.exists():
    print(f"File not found: {input_path}")
    sys.exit(1)

sizes = [16, 32, 128]

with Image.open(input_path) as img:
    for s in sizes:
        resized = img.resize((s, s), Image.LANCZOS)
        output_path = input_path.with_name(f"{input_path.stem}_{s}x{s}{input_path.suffix}")
        resized.save(output_path)
        print(f"Saved {output_path}")
