#!/bin/bash

# Setup All 16 Unique Voice Pilots - BASH 3.2 COMPATIBLE VERSION
# Einstein Wells Division - AI Publishing International LLP
# Each doctor and professor gets their own unique ElevenLabs voice

set -e

echo "🎙️ Setting up All 16 UNIQUE Voice Pilots - BASH 3.2 COMPATIBLE"
echo "=============================================================="
echo "🏢 Organization: AI Publishing International LLP"
echo "🚚 Division: Einstein Wells" 
echo "🎯 Each pilot gets their own unique voice"
echo "🎼 The Conductor - Universal orchestrator"
echo "🧠 Professor Einstein - Mining & Financial Intelligence"
echo "⚠️  Dr. Claude already configured - skipping"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

PROJECT_ID="api-for-warp-drive"

# Parallel arrays for bash 3.2 compatibility
PILOT_IDS=(
    "dr-memoria"
    "dr-lucy"
    "dr-match"
    "dr-cypriot"
    "professor-lee"
    "dr-sabina"
    "dr-maria"
    "dr-roark"
    "dr-grant"
    "dr-burby"
    "professor-einstein"
    "the-conductor"
    "elite11"
    "mastery33"
    "victory36"
)

PILOT_NAMES=(
    "Dr. Memoria"
    "Dr. Lucy"
    "Dr. Match"
    "Dr. Cypriot"
    "Professor Lee"
    "Dr. Sabina"
    "Dr. Maria"
    "Dr. Roark"
    "Dr. Grant"
    "Dr. Burby"
    "Professor Einstein"
    "The Conductor"
    "Elite11"
    "Mastery33"
    "Victory36"
)

VOICE_IDS=(
    "pMsXgVXv3BLzUgSXRplE"
    "VR6AewLTigWG4xSOukaG"
    "jBpfuIE2acCO8z3wKNLl"
    "TX3LPaxmHKxFdv7VOQHJ"
    "IanFleming"
    "JBFqnCBVMfNZtTaXgMzT"
    "7qW5CrJkx3rQ8aFs6gBh"
    "mVj8ZNx4qLp2FtYgDr5s"
    "6bW9xQm1kNj3StXz7pCv"
    "dK8nLp2ZqWj5xYrMfB9t"
    "29vD33N1CtxCKERZqkHB"
    "pNInz6obpgDQGcFmaJgB"
    "cgSHiixP7d7hLrpd0Fhf"
    "0qnqWIJTI9pHhO8cUQFK"
    "FcfbDhVBR5a2PQKAe0nt"
)

PILOT_SPECIALTIES=(
    "Thoughtful analysis and memory synthesis"
    "Advanced learning and adaptation"
    "Pattern recognition and matching"
    "Blockchain and investment systems"
    "Academic research and development"
    "High-precision analytical tasks"
    "Creative problem solving"
    "Leadership and strategic planning"
    "Resource optimization"
    "Technical infrastructure"
    "Theoretical physics and innovation"
    "System orchestration and coordination"
    "Elite performance optimization"
    "Advanced mastery systems"
    "Peak achievement management"
)

PILOT_GENDERS=(
    "Female"
    "Female"
    "Male"
    "Male"
    "Female"
    "Female"
    "Female"
    "Male"
    "Male"
    "Male"
    "Male"
    "Male"
    "Unisex"
    "Unisex"
    "Unisex"
)

PILOT_ACCENTS=(
    "British"
    "American"
    "American"
    "British"
    "Korean-influenced"
    "European"
    "Spanish-influenced"
    "American"
    "American"
    "American"
    "German-influenced"
    "Authoritative"
    "Professional"
    "Refined"
    "Confident"
)

echo -e "${BLUE}📋 Found ${#PILOT_IDS[@]} unique voice pilots to configure${NC}"
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
for i in $(seq 0 $((${#PILOT_IDS[@]} - 1))); do
    pilot_id="${PILOT_IDS[$i]}"
    pilot_name="${PILOT_NAMES[$i]}"
    voice_id="${VOICE_IDS[$i]}"
    specialty="${PILOT_SPECIALTIES[$i]}"
    gender="${PILOT_GENDERS[$i]}"
    accent="${PILOT_ACCENTS[$i]}"
    
    counter=$((i + 1))
    
    # Skip Dr. Claude as it's already configured
    if [[ "$pilot_id" == "dr-claude" ]]; then
        echo -e "${YELLOW}⏭️  Skipping Dr. Claude (already configured with Vee)${NC}"
        continue
    fi
    
    echo -e "${BLUE}🎯 Configuring Pilot $counter/16: $pilot_name${NC}"
    echo "   ElevenLabs Voice: $voice_id"
    echo "   Specialty: $specialty"
    echo "   Gender: $gender"
    echo "   Accent: $accent"
    
    # Create individual pilot configuration
    cat > /tmp/pilot_config.json << EOF
{
  "id": $counter,
  "name": "$pilot_name",
  "voiceId": "$pilot_id",
  "specialty": "$specialty",
  "elevenlabs": {
    "voice": "$voice_id",
    "fallback": "Adam",
    "streaming": true,
    "stability": 0.5,
    "similarityBoost": 0.5,
    "model": "eleven_multilingual_v2"
  },
  "voiceProfile": {
    "gender": "$gender",
    "accent": "$accent", 
    "language": "English",
    "age": "Adult"
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
      "x-warp-voice-id": "$voice_id",
      "x-voice-engine": "hume_elevenlabs_hybrid",
      "x-emotional-processing": "enabled",
      "x-pilot-id": "$pilot_id",
      "x-pilot-specialty": "$specialty"
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
    
    echo ""
done

echo -e "${BLUE}🎵 Creating final master voice configuration...${NC}"

# Create master configuration
cat > /tmp/master_voice_config.json << 'EOF'
{
  "masterVoiceConfig": {
    "version": "3.1.0",
    "organization": "AI Publishing International LLP",
    "division": "Einstein Wells",
    "totalPilots": 16,
    "configType": "OAuth2-OIDC-Enterprise-Unique-Voices-Final-Bash3",
    "region": "us-west1",
    "project": "api-for-warp-drive",
    "lastUpdated": "TIMESTAMP_PLACEHOLDER"
  },
  "voiceAssignments": {
    "dr-memoria": {
      "voice": "pMsXgVXv3BLzUgSXRplE",
      "specialty": "Thoughtful analysis and memory synthesis",
      "gender": "Female",
      "accent": "British"
    },
    "dr-lucy": {
      "voice": "VR6AewLTigWG4xSOukaG",
      "specialty": "Advanced learning and adaptation",
      "gender": "Female", 
      "accent": "American"
    },
    "dr-match": {
      "voice": "jBpfuIE2acCO8z3wKNLl",
      "specialty": "Pattern recognition and matching",
      "gender": "Male",
      "accent": "American"
    },
    "dr-cypriot": {
      "voice": "TX3LPaxmHKxFdv7VOQHJ",
      "specialty": "Blockchain and investment systems",
      "gender": "Male",
      "accent": "British"
    },
    "dr-claude": {
      "voice": "a4IzP6T8zLZWn7zAR2gQ",
      "specialty": "Chief AI strategist and coordinator",
      "gender": "Unisex",
      "accent": "British",
      "status": "already-configured"
    },
    "professor-lee": {
      "voice": "IanFleming",
      "specialty": "Academic research and development",
      "gender": "Female",
      "accent": "Korean-influenced"
    },
    "dr-sabina": {
      "voice": "JBFqnCBVMfNZtTaXgMzT",
      "specialty": "High-precision analytical tasks",
      "gender": "Female",
      "accent": "European"
    },
    "dr-maria": {
      "voice": "7qW5CrJkx3rQ8aFs6gBh",
      "specialty": "Creative problem solving",
      "gender": "Female",
      "accent": "Spanish-influenced"
    },
    "dr-roark": {
      "voice": "mVj8ZNx4qLp2FtYgDr5s",
      "specialty": "Leadership and strategic planning",
      "gender": "Male",
      "accent": "American"
    },
    "dr-grant": {
      "voice": "6bW9xQm1kNj3StXz7pCv",
      "specialty": "Resource optimization",
      "gender": "Male",
      "accent": "American"
    },
    "dr-burby": {
      "voice": "dK8nLp2ZqWj5xYrMfB9t",
      "specialty": "Technical infrastructure",
      "gender": "Male",
      "accent": "American"
    },
    "professor-einstein": {
      "voice": "29vD33N1CtxCKERZqkHB",
      "specialty": "Theoretical physics and innovation",
      "gender": "Male",
      "accent": "German-influenced"
    },
    "the-conductor": {
      "voice": "pNInz6obpgDQGcFmaJgB",
      "specialty": "System orchestration and coordination",
      "gender": "Male",
      "accent": "Authoritative"
    },
    "elite11": {
      "voice": "cgSHiixP7d7hLrpd0Fhf",
      "specialty": "Elite performance optimization",
      "gender": "Unisex",
      "accent": "Professional"
    },
    "mastery33": {
      "voice": "0qnqWIJTI9pHhO8cUQFK",
      "specialty": "Advanced mastery systems",
      "gender": "Unisex",
      "accent": "Refined"
    },
    "victory36": {
      "voice": "FcfbDhVBR5a2PQKAe0nt",
      "specialty": "Peak achievement management",
      "gender": "Unisex",
      "accent": "Confident"
    }
  },
  "features": {
    "oauth2": "enabled",
    "oidc": "enabled",
    "hume": "enabled",
    "warp": "enabled",
    "streaming": "enabled",
    "emotionalProcessing": "enabled"
  }
}
EOF

# Replace timestamp placeholder
timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
sed "s/TIMESTAMP_PLACEHOLDER/$timestamp/" /tmp/master_voice_config.json > /tmp/master_voice_config_final.json

# Store master configuration in Secret Manager
create_or_update_secret "claude-voice-master-config" "$(cat /tmp/master_voice_config_final.json)"

# Clean up temp files
rm /tmp/master_voice_config.json /tmp/master_voice_config_final.json

echo ""
echo -e "${GREEN}🎉 SUCCESS! All 16 unique voice pilots configured!${NC}"
echo -e "${BLUE}📦 All configurations stored in Google Cloud Secret Manager${NC}"
echo -e "${YELLOW}🔧 Ready for Hume + ElevenLabs integration${NC}"
echo -e "${GREEN}🎼 Orchestra of AI voices ready for deployment${NC}"
echo ""
echo "Summary:"
echo "- 16 unique voice pilots configured"
echo "- Each with distinct ElevenLabs voice"
echo "- OAuth2/OIDC security enabled"
echo "- Hume emotional processing enabled"
echo "- Warp integration ready"
echo "- All stored in api-for-warp-drive project"
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo "1. Deploy to Cloud Run staging"
echo "2. Test voice synthesis"
echo "3. Verify emotional processing"
echo "4. Push to production"