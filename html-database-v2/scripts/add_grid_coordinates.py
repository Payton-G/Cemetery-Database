#!/usr/bin/env python3
"""
Add grid coordinates to Find a Grave records JSON file.
Parses section and plot information to generate gridX and gridY coordinates.
"""

import json
import re
from pathlib import Path

def parse_section_to_grid(section_str):
    """Convert section string to grid Y coordinate (row).
    Examples: 'A' -> 1, 'B' -> 2, '139B' -> 139*26 + 2, etc.
    """
    if not section_str:
        return None
    
    section_str = str(section_str).strip().upper()
    
    # Remove "Section" prefix
    section_str = re.sub(r'^SECTION\s*', '', section_str, flags=re.IGNORECASE)
    section_str = re.sub(r'^SEC\s*', '', section_str, flags=re.IGNORECASE)
    
    # Handle numeric sections like "139B" -> row 139, sub-row B
    match = re.match(r'^(\d+)([A-Z])?$', section_str)
    if match:
        num = int(match.group(1))
        letter = match.group(2)
        if letter:
            # Convert letter to number (A=1, B=2, etc.)
            letter_num = ord(letter) - ord('A') + 1
            return num * 100 + letter_num
        return num * 100
    
    # Handle pure letter sections (A, B, C, etc.)
    if len(section_str) == 1 and section_str.isalpha():
        return ord(section_str) - ord('A') + 1
    
    # Handle numeric only
    if section_str.isdigit():
        return int(section_str) * 100
    
    # Default: use hash for unknown formats
    return hash(section_str) % 1000

def parse_plot_to_grid(plot_str):
    """Convert plot string to grid X coordinate (column).
    Examples: '1' -> 1, '3' -> 3, 'A1' -> 1, etc.
    """
    if not plot_str:
        return None
    
    plot_str = str(plot_str).strip()
    
    # Extract numbers from plot string
    numbers = re.findall(r'\d+', plot_str)
    if numbers:
        return int(numbers[0])
    
    # If no numbers, use hash
    return hash(plot_str) % 100

def add_grid_coordinates(input_file, output_file=None):
    """Add gridX and gridY coordinates to JSON records."""
    if output_file is None:
        output_file = input_file
    
    print(f"Reading {input_file}...")
    with open(input_file, 'r', encoding='utf-8') as f:
        records = json.load(f)
    
    print(f"Processing {len(records)} records...")
    updated = 0
    
    for i, record in enumerate(records):
        # Parse plot info if available
        plot_info = record.get('plot', None)
        section = None
        plot_number = None
        
        if plot_info:
            # Try to extract section and plot from plot string
            # Format: "section 139B space 3" or "Section A, Plot 1"
            section_match = re.search(r'section\s*([A-Z0-9]+)', str(plot_info), re.IGNORECASE)
            if section_match:
                section = section_match.group(1)
            
            plot_match = re.search(r'(?:plot|space)\s*([A-Z0-9]+)', str(plot_info), re.IGNORECASE)
            if plot_match:
                plot_number = plot_match.group(1)
        
        # Calculate grid coordinates
        gridY = parse_section_to_grid(section) if section else None
        gridX = parse_plot_to_grid(plot_number) if plot_number else None
        
        # Add grid coordinates to record
        if gridX is not None or gridY is not None:
            record['gridX'] = gridX
            record['gridY'] = gridY
            updated += 1
        
        # Also store parsed section and plot for reference
        if section:
            record['section'] = section
        if plot_number:
            record['plotNumber'] = plot_number
    
    print(f"Added grid coordinates to {updated} records")
    
    print(f"Writing to {output_file}...")
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(records, f, indent=4, ensure_ascii=False)
    
    print("Done!")
    return updated

if __name__ == '__main__':
    script_dir = Path(__file__).parent
    input_file = script_dir / 'findagrave_records_complete.json'
    
    if not input_file.exists():
        print(f"Error: {input_file} not found!")
        exit(1)
    
    add_grid_coordinates(input_file)

