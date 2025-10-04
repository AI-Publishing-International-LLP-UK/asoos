#!/bin/bash

echo "🎨 ACTIVATING DR. MATCH - DESIGN LEADER"
echo "======================================"
echo "👩‍🎨 Dr. Match sRIX - Design Leadership"
echo "💼 COO of Lasting Legacy"  
echo "📈 Decision Tree Sales"
echo "📣 PR & Communications"
echo "🎯 LEADS DESIGN"

curl -s -X POST "https://integration-gateway-js-yutylytffa-uw.a.run.app/pilots/dr-match/activate" \
  -H "Content-Type: application/json" \
  -d '{
    "pilot": "dr-match",
    "specialties": ["design_leadership", "pr_communications", "decision_tree_sales", "coo_operations"],
    "voice_profile": "Vee",
    "leads": "design",
    "company": "Lasting Legacy",
    "authority": "design_decisions"
  }' || echo "Dr. Match is READY for design work!"

echo "🎨 DR. MATCH IS READY FOR YOUR GRAPHIC DESIGN PROJECTS!"