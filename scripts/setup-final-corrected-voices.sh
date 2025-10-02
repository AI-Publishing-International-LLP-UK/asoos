#!/bin/bash

# Setup All 16 Unique Voice Pilots - FINAL CORRECTED VERSION
# Einstein Wells Division - AI Publishing International LLP
# Each doctor and professor gets their own unique ElevenLabs voice

set -e

echo "🎙️ Setting up All 16 UNIQUE Voice Pilots - FINAL CORRECTED"
echo "============================================================="
echo "🏢 Organization: AI Publishing International LLP"
echo "🚚 Division: Einstein Wells" 
echo "🎯 Each pilot gets their own unique voice with FINAL corrections"
echo "⚠️  Dr. Claude already configured - skipping"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

PROJECT_ID="api-for-warp-drive"

# FINAL CORRECTED list with accurate voice assignments and specialties
declare -A VOICE_PILOTS=(
    # Professors with CORRECTED details
    ["professor-lee"]="Professor Lee:IanFleming:Academic Research & Education"
    ["professor-lucinda"]="Professor Lucinda:Freya:Advanced Academic Leadership"
    ["professor-levi"]="Professor Levi:Daniel:Academic Innovation & Development:MALE:Utah USA:American English:23 years old"
    
    # Doctors with CORRECTED voice assignments and specialties
    ["dr-roark"]="Dr. Roark:Clyde:Strategic Planning & Leadership"
    ["dr-lucy"]="Dr. Lucy:Rachel:Advanced Analytics & ML Powerhouse"
    ["dr-maria"]="Dr. Maria:Domi:Language Processing & Cultural Advisor and Educational Communication:Female:Italian accent"
    ["dr-match"]="Dr. Match:Matilda:Public Relations Marketing Sales Advertising COO of Legacy:Female:SE London accent"
    ["dr-grant"]="Dr. Grant:Paul:Resource Management & Funding:Male:Toronto accent"
    ["dr-burby"]="Dr. Burby:Antoni:Systems Integration & Architecture:Male:NYC accent"
    ["dr-cipriot"]="Dr. Cipriot:Josh:Human-AI Relationships and Academy of Human AI Collaboration Leader:Male:Atlanta accent"
    ["dr-memoria"]="Dr. Memoria:IanFleming:Memory Processing & Data Retention:MALE:British English:37 years old"
    
    # Elite Leadership - CORRECTED voice assignments
    ["elite11"]="Elite11:George:Elite Operations Management:Male"
    ["mastery33"]="Mastery33:Charlotte:Mastery & Excellence Systems:Female"
    ["victory36"]="Victory36:Bella:Predictions Security and Advanced Everything Achievement & Success Optimization:Female"
    
    # Special Systems
    ["mining-audit-system"]="Mining Pool Audit:Drew:Bitcoin Mining & Financial Audit"
    ["base-pcp"]="Base PCP:Adam:Universal Professional Assistant"
)

echo -e "${BLUE}📋 Found ${#VOICE_PILOTS[@]} unique voice pilots to configure${NC}"
echo ""

# Function to create or update secret
create_or_update_secret() {
    local secret_name=$1
    local secret_value=$2
    
    if gcloud secrets describe $secret_name &>/dev/null; then
        echo -e "${YELLOW}⚪ Updating: $secret_name${NC}"
        echo -n "$secret_value" | gcloud secrets versions add $secret_name --data-file=-
    else
        echo -e "${GREEN}🆕 Creating: $secret_name${NC}"
        echo -n "$secret_value" | gcloud secrets create $secret_name --data-file=-
    fi
}

# Setup individual pilot configurations
counter=1
for pilot_id in "${!VOICE_PILOTS[@]}"; do
    IFS=':' read -ra PILOT_INFO <<< "${VOICE_PILOTS[$pilot_id]}"
    PILOT_NAME="${PILOT_INFO[0]}"
    VOICE_ID="${PILOT_INFO[1]}"
    PILOT_SPECIALTY="${PILOT_INFO[2]}"
    GENDER="${PILOT_INFO[3]:-}"
    ACCENT="${PILOT_INFO[4]:-}"
    LANGUAGE="${PILOT_INFO[5]:-}"
    AGE="${PILOT_INFO[6]:-}"
    
    # Skip Dr. Claude as it's already configured
    if [[ "$pilot_id" == "dr-claude" ]]; then
        echo -e "${YELLOW}⏭️  Skipping Dr. Claude (already configured with Vee)${NC}"
        continue
    fi
    
    echo -e "${BLUE}🎯 Configuring Pilot $counter/16: $PILOT_NAME${NC}"
    echo "   ElevenLabs Voice: $VOICE_ID"
    echo "   Specialty: $PILOT_SPECIALTY"
    [[ -n "$GENDER" ]] && echo "   Gender: $GENDER"
    [[ -n "$ACCENT" ]] && echo "   Accent: $ACCENT"
    [[ -n "$LANGUAGE" ]] && echo "   Language: $LANGUAGE"
    [[ -n "$AGE" ]] && echo "   Age: $AGE"
    
    # Create individual pilot configuration with detailed voice info
    cat > /tmp/pilot_config.json << EOF
{
  "id": $counter,
  "name": "$PILOT_NAME",
  "voiceId": "$pilot_id",
  "specialty": "$PILOT_SPECIALTY",
  "elevenlabs": {
    "voice": "$VOICE_ID",
    "fallback": "Adam",
    "streaming": true,
    "stability": 0.5,
    "similarityBoost": 0.5,
    "model": "eleven_multilingual_v2"
  },
  "voiceProfile": {
    "gender": "$GENDER",
    "accent": "$ACCENT", 
    "language": "$LANGUAGE",
    "age": "$AGE"
  },
  "hume": {
    "enabled": true,
    "emotionalProcessing": true,
    "sentimentAnalysis": true,
    "personality": "${pilot_id//-/_}_personality"
  },
  "oauth2": {
    "enabled": true,
    "provider": "Google Cloud Identity",
    "scope": ["https://www.googleapis.com/auth/cloud-platform"]
  },
  "warp": {
    "headers": {
      "x-warp-voice-id": "$VOICE_ID",
      "x-voice-engine": "hume_elevenlabs_hybrid",
      "x-emotional-processing": "enabled",
      "x-pilot-id": "$pilot_id",
      "x-pilot-specialty": "$PILOT_SPECIALTY"
    }
  },
  "status": "configured",
  "setupTimestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "division": "Einstein Wells"
}
EOF
    
    # Store pilot configuration in Secret Manager
    create_or_update_secret "claude-voice-$pilot_id" "$(cat /tmp/pilot_config.json)"
    
    # Clean up temp file
    rm /tmp/pilot_config.json
    
    ((counter++))
done

echo ""
echo -e "${BLUE}🎵 Creating final corrected master voice configuration...${NC}"

# Create master configuration with all final corrected voices
cat > /tmp/master_voice_config.json << EOF
{
  "masterVoiceConfig": {
    "version": "2.2.0",
    "organization": "AI Publishing International LLP",
    "division": "Einstein Wells",
    "totalPilots": 16,
    "configType": "OAuth2-OIDC-Enterprise-Unique-Voices-Final-Corrected",
    "region": "us-west1",
    "project": "api-for-warp-drive",
    "lastUpdated": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
  },
  "voiceAssignments": {
    "professor-lee": {
      "voice": "IanFleming",
      "specialty": "Academic Research & Education"
    },
    "professor-lucinda": {
      "voice": "Freya",
      "specialty": "Advanced Academic Leadership"
    },
    "professor-levi": {
      "voice": "Daniel",
      "gender": "Male",
      "location": "Utah USA",
      "language": "American English",
      "age": "23 years old",
      "specialty": "Academic Innovation & Development"
    },
    "dr-roark": {
      "voice": "Clyde",
      "specialty": "Strategic Planning & Leadership"
    },
    "dr-claude": {
      "voice": "Vee",
      "specialty": "Core AI Reasoning & Logic",
      "status": "already-configured"
    },
    "dr-lucy": {
      "voice": "Rachel",
      "specialty": "Advanced Analytics & ML Powerhouse"
    },
    "dr-maria": {
      "voice": "Domi",
      "gender": "Female",
      "accent": "Italian",
      "specialty": "Language Processing & Cultural Advisor and Educational Communication"
    },
    "dr-match": {
      "voice": "Matilda",
      "gender": "Female",
      "accent": "SE London",
      "specialty": "Public Relations Marketing Sales Advertising COO of Legacy",
      "note": "DR. MATCH not Dr. Matt"
    },
    "dr-grant": {
      "voice": "Paul",
      "gender": "Male",
      "accent": "Toronto",
      "specialty": "Resource Management & Funding"
    },
    "dr-burby": {
      "voice": "Antoni",
      "gender": "Male",
      "accent": "NYC",
      "specialty": "Systems Integration & Architecture"
    },
    "dr-cipriot": {
      "voice": "Josh",
      "gender": "Male",
      "accent": "Atlanta",
      "specialty": "Human-AI Relationships and Academy of Human AI Collaboration Leader"
    },
    "dr-memoria": {
      "voice": "IanFleming",
      "gender": "MALE",
      "language": "British English",
      "age": "37 years old",
      "specialty": "Memory Processing & Data Retention"
    },
    "elite11": {
      "voice": "George",
      "gender": "Male",
      "specialty": "Elite Operations Management"
    },
    "mastery33": {
      "voice": "Charlotte",
      "gender": "Female",
      "specialty": "Mastery & Excellence Systems"
    },
    "victory36": {
      "voice": "Bella",
      "gender": "Female",
      "specialty": "Predictions Security and Advanced Everything Achievement & Success Optimization"
    },
    "mining-audit-system": {
      "voice": "Drew",
      "specialty": "Bitcoin Mining & Financial Audit"
    },
    "base-pcp": {
      "voice": "Adam",
      "specialty": "Universal Professional Assistant"
    }
  },
  "finalCorrections": {
    "applied": "2025-10-01T23:34:00Z",
    "changes": [
      "Dr. MATCH confirmed (not Dr. Matt)",
      "Dr. Memoria: MALE, British English, 37 years old",
      "Professor Levi: MALE, Utah USA, American English, 23 years old, voice Daniel (not Matilda)"
    ]
  }
}
EOF

create_or_update_secret "master-voice-configuration-final" "$(cat /tmp/master_voice_config.json)"
rm /tmp/master_voice_config.json

echo ""
echo -e "${GREEN}🎉 FINAL CORRECTED Unique Voice Pilot Setup Complete!${NC}"
echo ""
echo -e "${BLUE}📋 Summary:${NC}"
echo "  • 16 voice pilots configured with FINAL CORRECTED unique voices"
echo "  • Dr. MATCH (not Matt) - Female, SE London accent"
echo "  • Dr. Memoria - MALE, British English, 37 years old"
echo "  • Professor Levi - MALE, Utah USA, American English, 23 years old"
echo "  • Each pilot has their own distinct voice and profile"
echo ""
echo -e "${BLUE}🎵 FINAL CORRECTED Voice Assignments:${NC}"
echo "  👨‍🏫 Professor Lee: IanFleming"
echo "  👩‍🏫 Professor Lucinda: Freya"  
echo "  👨‍🏫 Professor Levi: Daniel (Male, Utah, 23 years)"
echo "  👨‍⚕️ Dr. Roark: Clyde"
echo "  👨‍⚕️ Dr. Claude: Vee (existing)"
echo "  👩‍⚕️ Dr. Lucy: Rachel"
echo "  👩‍⚕️ Dr. Maria: Domi (Italian accent)"
echo "  👩‍⚕️ Dr. MATCH: Matilda (SE London accent)"
echo "  👨‍⚕️ Dr. Grant: Paul (Toronto accent)"
echo "  👨‍⚕️ Dr. Burby: Antoni (NYC accent)"
echo "  👨‍⚕️ Dr. Cipriot: Josh (Atlanta accent)"
echo "  👨‍⚕️ Dr. Memoria: IanFleming (British English, 37 years)"
echo "  👨‍💼 Elite11: George (Male)"
echo "  👩‍💼 Mastery33: Charlotte (Female)"
echo "  👩‍💼 Victory36: Bella (Female)"
echo "  🤖 Mining Audit: Drew"
echo "  🤖 Base PCP: Adam"
echo ""
echo -e "${YELLOW}⚠️  Ready to run:${NC}"
echo "  gcloud config set project api-for-warp-drive"
echo "  ./scripts/setup-final-corrected-voices.sh"
echo ""
echo -e "${GREEN}🎙️ All 16 Voice Pilots Ready - FINAL CORRECTED VERSION!${NC}"