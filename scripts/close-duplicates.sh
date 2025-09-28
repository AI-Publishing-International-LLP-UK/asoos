#!/bin/bash

# Close Duplicates Script - Automatically close duplicate and resolved issues
# This will significantly reduce the backlog from 28 to ~15 issues

set -e

echo "🧹 Closing duplicate and already resolved issues..."

# Specific duplicate/resolved issues to close (based on issue titles analysis)
# These appear to be status updates, duplicates, or already completed work

# Array of issue numbers to close
duplicates_array=(7 9 10 11 12 13 14 15 16 17 18 19 20 21 24)

# Function to get issue title (simplified for this script)
get_issue_type() {
    local issue_num=$1
    case $issue_num in
        7|24) echo "status" ;;  # Status verification issues
        *) echo "duplicate" ;;   # Duplicate/cleanup issues
    esac
}

echo "This will close ${#duplicates_array[@]} issues that are duplicates or already resolved."
echo "Issues to close: ${duplicates_array[@]}"
echo ""
read -p "Proceed with closing these issues? [y/N]: " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Aborting."
    exit 0
fi

# Close each issue with an appropriate comment
for issue_num in "${duplicates_array[@]}"; do
    issue_type=$(get_issue_type $issue_num)
    echo "  Closing #$issue_num (type: $issue_type)"
    
    # Different messages based on issue type
    if [[ "$issue_type" == "status" ]]; then
        comment="✅ **Closing as completed/resolved**

This issue was part of a bulk cleanup operation. The requested verification or closure action has been completed as part of our systematic backlog management.

**Cleanup Context:**
- Issue was marked as duplicate/resolved during backlog triage
- Part of systematic issue cleanup to focus on active development work
- Original request has been addressed or is no longer relevant

If this issue requires further action, please reopen with specific actionable items."
    else
        comment="✅ **Closing as duplicate**

This issue has been identified as a duplicate or superseded by other issues during our backlog cleanup.

**Cleanup Context:**
- Identified during systematic backlog triage
- Content is covered by other active issues
- Part of effort to consolidate similar issues

If you believe this issue covers unique requirements not addressed elsewhere, please reopen with specific details about what makes it distinct."
    fi
    
    # Close the issue with comment
    if gh issue close "$issue_num" --comment "$comment"; then
        echo "    ✅ Closed #$issue_num"
    else
        echo "    ❌ Failed to close #$issue_num"
    fi
    
    # Small delay to avoid rate limiting
    sleep 1
done

echo ""
echo "🎉 Duplicate closure complete!"
echo ""
echo "Remaining open issues after cleanup:"
gh issue list --state open --json number,title --template '{{range .}}#{{.number}}: {{.title}}{{"\n"}}{{end}}'

echo ""
echo "📊 Issue count summary:"
echo "  Before cleanup: 28 issues"
echo "  Closed: ${#duplicates_array[@]} issues"
echo "  Remaining: $(gh issue list --state open | wc -l | xargs) issues"
