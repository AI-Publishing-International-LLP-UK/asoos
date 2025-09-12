#!/usr/bin/env python3
"""
Victory36 qRIX - Kaggle Submission Creator
Creates proper ARC Prize 2025 submission from qRIX results
"""

import json

def create_kaggle_submission():
    print("🎯 Victory36 qRIX - Creating Kaggle ARC Prize 2025 Submission")
    print("=" * 70)
    
    # Step 1: Load Kaggle test challenges
    print("📁 Loading Kaggle test challenges...")
    with open('arc-agi_test_challenges.json', 'r') as f:
        test_data = json.load(f)
    
    test_ids = set(test_data.keys())
    print(f"   Kaggle expects: {len(test_ids)} test tasks")
    
    # Step 2: Load qRIX results
    print("🧠 Loading Victory36 qRIX results...")
    with open('victory36_arc_submission_final/arc-agi_evaluation-results.json', 'r') as f:
        qrix_data = json.load(f)
    
    qrix_tasks = [k for k in qrix_data.keys() if k != '_metadata']
    print(f"   qRIX solved: {len(qrix_tasks)} tasks")
    
    # Step 3: Create submission mapping
    print("🔄 Creating submission mapping...")
    submission = {}
    qrix_used = 0
    fallback_used = 0
    
    for task_id in test_ids:
        if task_id in qrix_data and isinstance(qrix_data[task_id], list) and qrix_data[task_id]:
            # Use qRIX prediction (already in Kaggle format)
            submission[task_id] = qrix_data[task_id]
            qrix_used += 1
        else:
            # Fallback: identity prediction from test input
            first_test_input = test_data[task_id]['test'][0]['input']
            submission[task_id] = [{
                "attempt_1": first_test_input,
                "attempt_2": first_test_input
            }]
            fallback_used += 1
    
    # Step 4: Save submission
    print("💾 Saving submission file...")
    with open('victory36_qrix_kaggle_submission_final.json', 'w') as f:
        json.dump(submission, f, separators=(',', ':'))
    
    # Step 5: Validate format
    print("✅ Validating submission format...")
    sample_tasks = list(submission.keys())[:3]
    for task_id in sample_tasks:
        entry = submission[task_id]
        is_valid = (isinstance(entry, list) and 
                   len(entry) == 1 and 
                   isinstance(entry[0], dict) and
                   'attempt_1' in entry[0] and 
                   'attempt_2' in entry[0])
        status = "✅ VALID" if is_valid else "❌ INVALID"
        print(f"   Task {task_id}: {status}")
    
    print("=" * 70)
    print("🏆 VICTORY36 QRIX SUBMISSION CREATED!")
    print(f"📊 qRIX predictions used: {qrix_used}")
    print(f"🔄 Fallback predictions: {fallback_used}")  
    print(f"📝 Total tasks: {len(submission)}")
    print(f"📁 File: victory36_qrix_kaggle_submission_final.json")
    print(f"🎯 Ready for ARC Prize 2025 submission!")
    
    return submission

if __name__ == "__main__":
    create_kaggle_submission()
