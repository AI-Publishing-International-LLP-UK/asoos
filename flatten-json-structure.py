#!/usr/bin/env python3
"""
JSON Structure Flattening Tool
==============================

This tool flattens deeply nested JSON files containing embedded filings 
into a single-level dictionary while maintaining integration and relationships 
indicated by the original hierarchy.

Features:
- Flattens nested JSON objects with customizable separator
- Preserves array structures and relationships  
- Maintains integration references through key mapping
- Creates backup of original files
- Generates mapping report for reference updates

Usage:
    python flatten-json-structure.py --input <file.json> --output <flattened.json>
    python flatten-json-structure.py --directory <path> --recursive
"""

import json
import argparse
import os
import sys
from pathlib import Path
from typing import Dict, Any, List, Union
import copy
from datetime import datetime

class JSONFlattener:
    def __init__(self, separator: str = "__", preserve_arrays: bool = True):
        """
        Initialize the JSON flattener.
        
        Args:
            separator: String to use for joining nested keys
            preserve_arrays: Whether to preserve array structures
        """
        self.separator = separator
        self.preserve_arrays = preserve_arrays
        self.key_mapping = {}  # Original path -> flattened key
        self.integration_references = []  # List of potential integration points
        
    def flatten_dict(self, data: Dict[str, Any], parent_key: str = "", 
                    path_context: str = "") -> Dict[str, Any]:
        """
        Recursively flatten a nested dictionary.
        
        Args:
            data: Dictionary to flatten
            parent_key: Current parent key path
            path_context: Context path for integration tracking
            
        Returns:
            Flattened dictionary
        """
        items = []
        
        for key, value in data.items():
            new_key = f"{parent_key}{self.separator}{key}" if parent_key else key
            current_path = f"{path_context}.{key}" if path_context else key
            
            # Track the mapping for integration reference updates
            self.key_mapping[current_path] = new_key
            
            if isinstance(value, dict):
                # Recursively flatten nested dictionaries
                items.extend(self.flatten_dict(value, new_key, current_path).items())
            elif isinstance(value, list) and not self.preserve_arrays:
                # Flatten arrays if preserve_arrays is False
                for i, item in enumerate(value):
                    array_key = f"{new_key}{self.separator}{i}"
                    if isinstance(item, dict):
                        items.extend(self.flatten_dict(item, array_key, f"{current_path}[{i}]").items())
                    else:
                        items.append((array_key, item))
            else:
                # Keep as is (including preserved arrays)
                items.append((new_key, value))
                
                # Track potential integration references
                if isinstance(value, str) and self._is_potential_reference(value):
                    self.integration_references.append({
                        "original_path": current_path,
                        "flattened_key": new_key,
                        "value": value,
                        "reference_type": self._get_reference_type(value)
                    })
        
        return dict(items)
    
    def _is_potential_reference(self, value: str) -> bool:
        """Check if a string value might be an integration reference."""
        reference_patterns = [
            ".", "/", "\\", "://", "@", "mcp.", "asoos", "coaching2100", 
            "gateway", "cluster", "sector", "batch", "config", "service"
        ]
        return any(pattern in value.lower() for pattern in reference_patterns)
    
    def _get_reference_type(self, value: str) -> str:
        """Determine the type of reference based on value patterns."""
        if "://" in value:
            return "url"
        elif value.endswith((".json", ".js", ".ts", ".py")):
            return "file_path"
        elif "." in value and not value.replace(".", "").isdigit():
            return "domain_or_path"
        elif "@" in value:
            return "email_or_service"
        else:
            return "identifier"
    
    def flatten_json_file(self, input_path: str, output_path: str = None, 
                         create_backup: bool = True) -> Dict[str, Any]:
        """
        Flatten a JSON file and optionally save the result.
        
        Args:
            input_path: Path to input JSON file
            output_path: Path to save flattened JSON (optional)
            create_backup: Whether to create a backup of the original file
            
        Returns:
            Flattened JSON data
        """
        input_file = Path(input_path)
        
        if not input_file.exists():
            raise FileNotFoundError(f"Input file not found: {input_path}")
        
        # Create backup if requested
        if create_backup:
            backup_path = input_file.with_suffix(f".backup{input_file.suffix}")
            backup_path.write_text(input_file.read_text())
            print(f"Backup created: {backup_path}")
        
        # Load and flatten JSON
        try:
            with open(input_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
        except json.JSONDecodeError as e:
            raise ValueError(f"Invalid JSON in {input_path}: {e}")
        
        # Reset tracking variables for each file
        self.key_mapping = {}
        self.integration_references = []
        
        if isinstance(data, dict):
            flattened_data = self.flatten_dict(data)
        elif isinstance(data, list):
            # Handle top-level arrays
            flattened_data = {}
            for i, item in enumerate(data):
                if isinstance(item, dict):
                    flat_items = self.flatten_dict(item, str(i))
                    flattened_data.update(flat_items)
                else:
                    flattened_data[str(i)] = item
        else:
            raise ValueError(f"Unsupported JSON structure in {input_path}")
        
        # Save flattened JSON if output path provided
        if output_path:
            output_file = Path(output_path)
            output_file.parent.mkdir(parents=True, exist_ok=True)
            
            with open(output_path, 'w', encoding='utf-8') as f:
                json.dump(flattened_data, f, indent=2, ensure_ascii=False)
            print(f"Flattened JSON saved: {output_path}")
        
        return flattened_data
    
    def generate_mapping_report(self, output_path: str):
        """Generate a mapping report for updating integration references."""
        report = {
            "timestamp": datetime.now().isoformat(),
            "separator": self.separator,
            "key_mappings": self.key_mapping,
            "integration_references": self.integration_references,
            "statistics": {
                "total_keys_mapped": len(self.key_mapping),
                "potential_integrations": len(self.integration_references),
                "reference_types": {}
            }
        }
        
        # Count reference types
        for ref in self.integration_references:
            ref_type = ref["reference_type"]
            report["statistics"]["reference_types"][ref_type] = \
                report["statistics"]["reference_types"].get(ref_type, 0) + 1
        
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(report, f, indent=2, ensure_ascii=False)
        print(f"Mapping report saved: {output_path}")
    
    def process_directory(self, directory_path: str, recursive: bool = False, 
                         output_suffix: str = "_flattened"):
        """
        Process all JSON files in a directory.
        
        Args:
            directory_path: Path to directory containing JSON files
            recursive: Whether to process subdirectories
            output_suffix: Suffix to add to output filenames
        """
        directory = Path(directory_path)
        
        if not directory.exists():
            raise FileNotFoundError(f"Directory not found: {directory_path}")
        
        # Find JSON files
        if recursive:
            json_files = directory.rglob("*.json")
        else:
            json_files = directory.glob("*.json")
        
        processed_files = []
        all_mappings = {}
        all_references = []
        
        for json_file in json_files:
            try:
                # Generate output path
                output_path = json_file.with_name(
                    f"{json_file.stem}{output_suffix}{json_file.suffix}"
                )
                
                # Process file
                self.flatten_json_file(str(json_file), str(output_path))
                processed_files.append(str(json_file))
                
                # Collect mappings and references
                all_mappings[str(json_file)] = self.key_mapping.copy()
                all_references.extend(self.integration_references)
                
            except Exception as e:
                print(f"Error processing {json_file}: {e}")
        
        # Generate combined mapping report
        if processed_files:
            report_path = directory / "flattening_report.json"
            combined_report = {
                "timestamp": datetime.now().isoformat(),
                "separator": self.separator,
                "processed_files": processed_files,
                "file_mappings": all_mappings,
                "all_integration_references": all_references,
                "statistics": {
                    "files_processed": len(processed_files),
                    "total_references": len(all_references)
                }
            }
            
            with open(report_path, 'w', encoding='utf-8') as f:
                json.dump(combined_report, f, indent=2, ensure_ascii=False)
            print(f"Combined report saved: {report_path}")
        
        print(f"Processed {len(processed_files)} JSON files")

def main():
    parser = argparse.ArgumentParser(description="Flatten deeply nested JSON files")
    parser.add_argument("--input", "-i", help="Input JSON file path")
    parser.add_argument("--output", "-o", help="Output JSON file path")
    parser.add_argument("--directory", "-d", help="Process all JSON files in directory")
    parser.add_argument("--recursive", "-r", action="store_true", 
                       help="Process directories recursively")
    parser.add_argument("--separator", "-s", default="__", 
                       help="Separator for flattened keys (default: __)")
    parser.add_argument("--no-backup", action="store_true", 
                       help="Don't create backup files")
    parser.add_argument("--flatten-arrays", action="store_true",
                       help="Also flatten arrays (default: preserve arrays)")
    
    args = parser.parse_args()
    
    if not args.input and not args.directory:
        parser.error("Either --input or --directory must be specified")
    
    # Initialize flattener
    flattener = JSONFlattener(
        separator=args.separator,
        preserve_arrays=not args.flatten_arrays
    )
    
    try:
        if args.directory:
            # Process directory
            flattener.process_directory(
                args.directory, 
                recursive=args.recursive
            )
        else:
            # Process single file
            output_path = args.output
            if not output_path:
                input_file = Path(args.input)
                output_path = input_file.with_name(
                    f"{input_file.stem}_flattened{input_file.suffix}"
                )
            
            flattener.flatten_json_file(
                args.input, 
                str(output_path),
                create_backup=not args.no_backup
            )
            
            # Generate mapping report
            report_path = Path(output_path).with_name(
                f"{Path(output_path).stem}_mapping_report.json"
            )
            flattener.generate_mapping_report(str(report_path))
    
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()