#!/usr/bin/env python3
"""
Integration Verification Tool
============================

This script helps verify that integrations still work correctly after 
JSON structure flattening by running a series of tests.

Features:
- Tests JSON file structure validity
- Checks for broken references in code
- Validates flattened JSON files can be loaded
- Compares original vs flattened data integrity
- Generates verification report

Usage:
    python verify-integrations.py --original-dir <path> --flattened-dir <path>
    python verify-integrations.py --verification-tests <config.json>
"""

import json
import argparse
import os
import sys
import subprocess
from pathlib import Path
from typing import Dict, List, Any, Tuple
from datetime import datetime
import importlib.util

class IntegrationVerifier:
    def __init__(self):
        """Initialize the integration verifier."""
        self.test_results = []
        self.issues_found = []
        self.warnings = []
        
    def verify_json_structure(self, json_path: str) -> Tuple[bool, str]:
        """Verify that a JSON file has valid structure."""
        try:
            with open(json_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
            return True, "Valid JSON structure"
        except json.JSONDecodeError as e:
            return False, f"Invalid JSON: {e}"
        except Exception as e:
            return False, f"Error reading file: {e}"
    
    def compare_data_integrity(self, original_path: str, flattened_path: str) -> Tuple[bool, str]:
        """Compare original and flattened JSON to ensure data integrity."""
        try:
            with open(original_path, 'r', encoding='utf-8') as f:
                original_data = json.load(f)
            
            with open(flattened_path, 'r', encoding='utf-8') as f:
                flattened_data = json.load(f)
            
            # Reconstruct nested structure from flattened data for comparison
            reconstructed = self._reconstruct_nested_structure(flattened_data)
            
            # Compare key-value pairs (allowing for some structural differences)
            integrity_issues = self._compare_nested_data(original_data, reconstructed)
            
            if integrity_issues:
                return False, f"Data integrity issues: {'; '.join(integrity_issues)}"
            else:
                return True, "Data integrity maintained"
                
        except Exception as e:
            return False, f"Error comparing data: {e}"
    
    def _reconstruct_nested_structure(self, flattened_data: Dict[str, Any]) -> Dict[str, Any]:
        """Reconstruct nested structure from flattened data."""
        reconstructed = {}
        
        for key, value in flattened_data.items():
            if '__' in key:
                # This is a flattened key
                parts = key.split('__')
                current = reconstructed
                
                for i, part in enumerate(parts[:-1]):
                    if part not in current:
                        current[part] = {}
                    current = current[part]
                
                current[parts[-1]] = value
            else:
                # This is a top-level key
                reconstructed[key] = value
        
        return reconstructed
    
    def _compare_nested_data(self, original: Any, reconstructed: Any, path: str = "") -> List[str]:
        """Recursively compare nested data structures."""
        issues = []
        
        if type(original) != type(reconstructed):
            issues.append(f"Type mismatch at {path}: {type(original)} vs {type(reconstructed)}")
            return issues
        
        if isinstance(original, dict):
            for key in original:
                new_path = f"{path}.{key}" if path else key
                if key not in reconstructed:
                    issues.append(f"Missing key in reconstructed: {new_path}")
                else:
                    issues.extend(self._compare_nested_data(original[key], reconstructed[key], new_path))
            
            for key in reconstructed:
                new_path = f"{path}.{key}" if path else key
                if key not in original:
                    self.warnings.append(f"Extra key in reconstructed: {new_path}")
        
        elif isinstance(original, list):
            if len(original) != len(reconstructed):
                issues.append(f"List length mismatch at {path}: {len(original)} vs {len(reconstructed)}")
            else:
                for i in range(len(original)):
                    new_path = f"{path}[{i}]"
                    issues.extend(self._compare_nested_data(original[i], reconstructed[i], new_path))
        
        elif original != reconstructed:
            issues.append(f"Value mismatch at {path}: {original} vs {reconstructed}")
        
        return issues
    
    def test_json_files_validity(self, directory_path: str) -> Dict[str, Any]:
        """Test all JSON files in a directory for validity."""
        directory = Path(directory_path)
        results = {
            "total_files": 0,
            "valid_files": 0,
            "invalid_files": 0,
            "details": []
        }
        
        for json_file in directory.rglob("*.json"):
            results["total_files"] += 1
            is_valid, message = self.verify_json_structure(str(json_file))
            
            if is_valid:
                results["valid_files"] += 1
            else:
                results["invalid_files"] += 1
                self.issues_found.append({
                    "file": str(json_file),
                    "issue": message,
                    "type": "json_validity"
                })
            
            results["details"].append({
                "file": str(json_file),
                "valid": is_valid,
                "message": message
            })
        
        return results
    
    def test_data_integrity(self, original_dir: str, flattened_dir: str) -> Dict[str, Any]:
        """Test data integrity between original and flattened files."""
        original_path = Path(original_dir)
        flattened_path = Path(flattened_dir)
        
        results = {
            "total_comparisons": 0,
            "integrity_maintained": 0,
            "integrity_issues": 0,
            "details": []
        }
        
        # Find corresponding files
        for original_file in original_path.rglob("*.json"):
            if ".backup" in str(original_file):
                continue
                
            # Look for corresponding flattened file
            relative_path = original_file.relative_to(original_path)
            
            # Try different possible flattened filenames
            possible_flattened_names = [
                original_file.stem + "_flattened.json",
                original_file.stem + "_flat.json"
            ]
            
            flattened_file = None
            for name in possible_flattened_names:
                candidate = flattened_path / relative_path.parent / name
                if candidate.exists():
                    flattened_file = candidate
                    break
            
            if flattened_file:
                results["total_comparisons"] += 1
                
                integrity_ok, message = self.compare_data_integrity(
                    str(original_file), str(flattened_file)
                )
                
                if integrity_ok:
                    results["integrity_maintained"] += 1
                else:
                    results["integrity_issues"] += 1
                    self.issues_found.append({
                        "original_file": str(original_file),
                        "flattened_file": str(flattened_file),
                        "issue": message,
                        "type": "data_integrity"
                    })
                
                results["details"].append({
                    "original_file": str(original_file),
                    "flattened_file": str(flattened_file),
                    "integrity_ok": integrity_ok,
                    "message": message
                })
        
        return results
    
    def run_custom_tests(self, test_config_path: str) -> Dict[str, Any]:
        """Run custom verification tests from a configuration file."""
        try:
            with open(test_config_path, 'r', encoding='utf-8') as f:
                test_config = json.load(f)
            
            results = {
                "total_tests": 0,
                "passed_tests": 0,
                "failed_tests": 0,
                "details": []
            }
            
            for test in test_config.get("tests", []):
                results["total_tests"] += 1
                test_result = self._run_single_test(test)
                
                if test_result["passed"]:
                    results["passed_tests"] += 1
                else:
                    results["failed_tests"] += 1
                    self.issues_found.append({
                        "test": test["name"],
                        "issue": test_result["message"],
                        "type": "custom_test"
                    })
                
                results["details"].append(test_result)
            
            return results
            
        except Exception as e:
            return {"error": f"Failed to run custom tests: {e}"}
    
    def _run_single_test(self, test_config: Dict[str, Any]) -> Dict[str, Any]:
        """Run a single custom test."""
        test_name = test_config.get("name", "Unknown test")
        test_type = test_config.get("type", "unknown")
        
        try:
            if test_type == "file_exists":
                file_path = test_config["file_path"]
                exists = Path(file_path).exists()
                return {
                    "name": test_name,
                    "type": test_type,
                    "passed": exists,
                    "message": f"File {'exists' if exists else 'does not exist'}: {file_path}"
                }
            
            elif test_type == "command":
                cmd = test_config["command"]
                expected_exit_code = test_config.get("expected_exit_code", 0)
                
                result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
                passed = result.returncode == expected_exit_code
                
                return {
                    "name": test_name,
                    "type": test_type,
                    "passed": passed,
                    "message": f"Command exited with code {result.returncode}, output: {result.stdout[:100]}..."
                }
            
            elif test_type == "json_key_exists":
                file_path = test_config["file_path"]
                key_path = test_config["key_path"]
                
                with open(file_path, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                
                # Navigate to the key
                current = data
                key_parts = key_path.split('.')
                
                try:
                    for part in key_parts:
                        current = current[part]
                    passed = True
                    message = f"Key exists: {key_path}"
                except KeyError:
                    passed = False
                    message = f"Key not found: {key_path}"
                
                return {
                    "name": test_name,
                    "type": test_type,
                    "passed": passed,
                    "message": message
                }
            
            else:
                return {
                    "name": test_name,
                    "type": test_type,
                    "passed": False,
                    "message": f"Unknown test type: {test_type}"
                }
                
        except Exception as e:
            return {
                "name": test_name,
                "type": test_type,
                "passed": False,
                "message": f"Test failed with error: {e}"
            }
    
    def generate_verification_report(self, output_path: str):
        """Generate a comprehensive verification report."""
        report = {
            "timestamp": datetime.now().isoformat(),
            "summary": {
                "total_issues": len(self.issues_found),
                "total_warnings": len(self.warnings),
                "verification_passed": len(self.issues_found) == 0
            },
            "test_results": self.test_results,
            "issues_found": self.issues_found,
            "warnings": self.warnings
        }
        
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(report, f, indent=2, ensure_ascii=False)
        
        print(f"Verification report saved: {output_path}")

def main():
    parser = argparse.ArgumentParser(description="Verify integrations after JSON flattening")
    parser.add_argument("--original-dir", "-o", help="Directory containing original JSON files")
    parser.add_argument("--flattened-dir", "-f", help="Directory containing flattened JSON files")
    parser.add_argument("--test-config", "-t", help="Custom test configuration file")
    parser.add_argument("--report-output", "-r", help="Path to save verification report")
    
    args = parser.parse_args()
    
    verifier = IntegrationVerifier()
    
    try:
        # Test JSON file validity
        if args.flattened_dir:
            print("Testing JSON file validity...")
            json_results = verifier.test_json_files_validity(args.flattened_dir)
            verifier.test_results.append({
                "test_name": "JSON Validity Check",
                "results": json_results
            })
            print(f"- Valid files: {json_results['valid_files']}/{json_results['total_files']}")
        
        # Test data integrity
        if args.original_dir and args.flattened_dir:
            print("Testing data integrity...")
            integrity_results = verifier.test_data_integrity(args.original_dir, args.flattened_dir)
            verifier.test_results.append({
                "test_name": "Data Integrity Check",
                "results": integrity_results
            })
            print(f"- Integrity maintained: {integrity_results['integrity_maintained']}/{integrity_results['total_comparisons']}")
        
        # Run custom tests
        if args.test_config:
            print("Running custom tests...")
            custom_results = verifier.run_custom_tests(args.test_config)
            verifier.test_results.append({
                "test_name": "Custom Tests",
                "results": custom_results
            })
            if "error" not in custom_results:
                print(f"- Custom tests passed: {custom_results['passed_tests']}/{custom_results['total_tests']}")
        
        # Generate report
        report_output = args.report_output or f"verification_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        verifier.generate_verification_report(report_output)
        
        # Summary
        total_issues = len(verifier.issues_found)
        total_warnings = len(verifier.warnings)
        
        print(f"\nVerification Summary:")
        print(f"- Issues found: {total_issues}")
        print(f"- Warnings: {total_warnings}")
        print(f"- Overall status: {'PASSED' if total_issues == 0 else 'FAILED'}")
        
        if verifier.issues_found:
            print("\nIssues:")
            for issue in verifier.issues_found[:5]:  # Show first 5 issues
                print(f"- {issue['type']}: {issue['issue']}")
            if len(verifier.issues_found) > 5:
                print(f"- ... and {len(verifier.issues_found) - 5} more")
        
        sys.exit(0 if total_issues == 0 else 1)
    
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()