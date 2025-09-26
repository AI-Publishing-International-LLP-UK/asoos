#!/bin/bash

# Label Issues Script - Apply standardized labels to GitHub issues
# Based on the issue analysis from the backlog review

set -e

echo "🏷️  Applying labels to GitHub issues..."

# High Priority Issues (Production blocking)
declare -a high_priority=(31 32 35)
for n in "${high_priority[@]}"; do
    echo "  Adding high-priority label to #$n"
    gh issue edit "$n" --add-label "high-priority" || echo "    Warning: Could not label #$n"
done

# Deployment Issues (Build/Auth/CI)
declare -a deployment=(2 4 22 23)
for n in "${deployment[@]}"; do
    echo "  Adding deployment label to #$n"
    gh issue edit "$n" --add-label "deployment" || echo "    Warning: Could not label #$n"
done

# DNS & Networking Issues
declare -a dns_network=(28 29 32)
for n in "${dns_network[@]}"; do
    echo "  Adding dns-network label to #$n"
    gh issue edit "$n" --add-label "dns-network" || echo "    Warning: Could not label #$n"
done

# Architecture/Planning Issues
declare -a architecture=(33 34 35)
for n in "${architecture[@]}"; do
    echo "  Adding architecture label to #$n"
    gh issue edit "$n" --add-label "architecture" || echo "    Warning: Could not label #$n"
done

# Performance Issues
echo "  Adding performance label to #27"
gh issue edit "27" --add-label "performance" || echo "    Warning: Could not label #27"

# Security/Quality Issues
declare -a security=(13 20 30)
for n in "${security[@]}"; do
    echo "  Adding security label to #$n"
    gh issue edit "$n" --add-label "security" || echo "    Warning: Could not label #$n"
done

# Duplicate/Resolved Issues (Issues #9-#21 appear to be duplicates)
declare -a duplicates=(9 10 11 12 13 14 15 16 17 18 19 20 21)
for n in "${duplicates[@]}"; do
    echo "  Adding duplicate label to #$n"
    gh issue edit "$n" --add-label "duplicate" || echo "    Warning: Could not label #$n"
done

# Status verification issues that appear resolved
declare -a resolved=(7 24)
for n in "${resolved[@]}"; do
    echo "  Adding resolved label to #$n"
    gh issue edit "$n" --add-label "resolved" || echo "    Warning: Could not label #$n"
done

echo "✅ Labeling complete! Check a few issues in the GitHub web interface to verify."
echo "   Next step: Run scripts/close-duplicates.sh to close duplicate issues."