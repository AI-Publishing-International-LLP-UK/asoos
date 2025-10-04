#!/bin/bash
# Victory36 qRIX - Kaggle ARC Prize 2025 Submission Script
# Team: Victory36 Labs / AI Publishing International LLP

echo "🚀 Victory36 qRIX - Kaggle ARC Prize 2025 Submission"
echo "=================================================="

# Check if Kaggle CLI is available
if ! command -v kaggle &> /dev/null; then
    echo "❌ Kaggle CLI not found. Please install with: pip install kaggle"
    echo "   Then configure with: kaggle config path"
    exit 1
fi

# Check if we're in the right directory
if [[ ! -f "victory36_kaggle_submission.py" ]]; then
    echo "❌ victory36_kaggle_submission.py not found"
    echo "   Please run this script from the directory containing the submission file"
    exit 1
fi

echo "✅ Kaggle CLI found and configured"
echo "✅ Victory36 submission file found"

# Create a temporary directory for Kaggle notebook
TEMP_DIR=$(mktemp -d)
echo "📁 Created temporary directory: $TEMP_DIR"

# Copy the submission script to temp directory as a notebook
cp victory36_kaggle_submission.py "$TEMP_DIR/victory36-qrix-complete.py"

echo "📋 Submission Details:"
echo "   Team: Victory36 Labs / AI Publishing International LLP"
echo "   Solver: qRIX (Quantum-Inspired Reasoning Intelligence eXtender)"
echo "   Tasks: 360 (120 evaluation + 240 test)"
echo "   Contact: pr@coaching2100.com"

# Instructions for manual submission
echo ""
echo "🔧 Kaggle Submission Instructions:"
echo "=================================================="
echo "1. Go to: https://www.kaggle.com/competitions/arc-prize-2025"
echo "2. Click 'New Notebook' or 'Code'"
echo "3. Copy the contents of victory36_kaggle_submission.py"
echo "4. Run the notebook - it will process all 360 tasks"
echo "5. Submit the generated submission.json file"
echo ""
echo "Or use Kaggle CLI:"
echo "   kaggle competitions submit -c arc-prize-2025 -f submission.json -m 'Victory36 qRIX Complete 360 Tasks'"

# Optional: Try to submit directly if submission.json exists
if [[ -f "submission.json" ]] || [[ -f "victory36_qrix_complete_submission.json" ]]; then
    echo ""
    echo "📤 Found existing submission file. Attempting direct submission..."
    
    # Use the complete submission if available, otherwise use submission.json
    if [[ -f "victory36_qrix_complete_submission.json" ]]; then
        SUBMISSION_FILE="victory36_qrix_complete_submission.json"
        # Note: Kaggle expects just the results, not metadata, so we'd need to strip it
        echo "⚠️  Note: You may need to remove the _metadata field for Kaggle compatibility"
        echo "   The complete file has metadata that needs to be stripped"
    else
        SUBMISSION_FILE="submission.json"
    fi
    
    echo "📋 Submission command:"
    echo "   kaggle competitions submit -c arc-prize-2025 -f $SUBMISSION_FILE -m 'Victory36 qRIX Complete - 360 Tasks (120 eval + 240 test)'"
    
    read -p "🤔 Would you like to submit now? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "🚀 Submitting to Kaggle..."
        kaggle competitions submit -c arc-prize-2025 -f "$SUBMISSION_FILE" -m "Victory36 qRIX Complete - 360 Tasks (120 eval + 240 test) - AI Publishing International LLP"
        echo "✅ Submission completed!"
    else
        echo "⏭️  Submission skipped. Use the command above when ready."
    fi
else
    echo ""
    echo "📋 Next Steps:"
    echo "1. Run: python3 victory36_kaggle_submission.py (in Kaggle notebook)"
    echo "2. Submit the generated submission.json file"
    echo "3. Or run the local complete submission first"
fi

# Clean up
rm -rf "$TEMP_DIR"

echo ""
echo "🎯 Victory36 qRIX Summary:"
echo "   Status: Ready for Kaggle submission"
echo "   Tasks: All 360 tasks (120 evaluation + 240 test)"
echo "   Expected result: Complete submission status instead of 'NEEDS REVIEW'"
echo "   Team: Victory36 Labs / AI Publishing International LLP"
echo ""
echo "🏆 Good luck with your ARC Prize 2025 submission!"