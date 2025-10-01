#!/bin/bash

# VM Utilization Audit Script for Einstein Wells Mining Optimization
# This script audits all VMs to identify mining capacity

echo "=== Einstein Wells VM Mining Capacity Audit ==="
echo "Timestamp: $(date)"
echo "Project: api-for-warp-drive"
echo ""

# Function to check VM instances
audit_vms() {
    echo "📊 Checking VM instances across all regions..."
    
    # Check us-central1
    echo ""
    echo "🌎 US-Central1 Region:"
    gcloud compute instances list --filter="zone:us-central1" --format="table(name,status,machineType.basename(),scheduling.preemptible)"
    
    # Check us-west1
    echo ""
    echo "🌎 US-West1 Region:"
    gcloud compute instances list --filter="zone:us-west1" --format="table(name,status,machineType.basename(),scheduling.preemptible)"
    
    # Check all regions summary
    echo ""
    echo "🌍 All Regions Summary:"
    gcloud compute instances list --format="table(name,zone,status,machineType.basename())"
}

# Function to check Cloud Run services
audit_cloud_run() {
    echo ""
    echo "☁️ Cloud Run Services (us-central1):"
    gcloud run services list --region=us-central1 --format="table(metadata.name,status.url,spec.template.spec.containers[0].resources.limits.cpu,spec.template.spec.containers[0].resources.limits.memory)"
    
    echo ""
    echo "☁️ Cloud Run Services (us-west1):"
    gcloud run services list --region=us-west1 --format="table(metadata.name,status.url,spec.template.spec.containers[0].resources.limits.cpu,spec.template.spec.containers[0].resources.limits.memory)"
}

# Function to estimate mining potential
calculate_mining_potential() {
    echo ""
    echo "⛏️ Mining Potential Calculation:"
    echo ""
    
    # Get total VM count
    TOTAL_VMS=$(gcloud compute instances list --format="value(name)" | wc -l)
    echo "Total VMs: $TOTAL_VMS"
    
    # Calculate potential based on average VM specs
    echo "Estimated Mining Capacity (Conservative @ 50% utilization):"
    echo "- Monero (XMRig): ~$(($TOTAL_VMS * 300)) H/s total"
    echo "- Monthly Revenue Estimate: $$(($TOTAL_VMS * 50))-$(($TOTAL_VMS * 100))"
    echo "- Annual Revenue Potential: $$(($TOTAL_VMS * 600))-$(($TOTAL_VMS * 1200))"
    echo ""
    
    if [ $TOTAL_VMS -ge 27 ]; then
        echo "✅ Target of 27+ VMs achieved!"
        echo "🎯 Ready for full mining optimization deployment"
    else
        echo "⚠️ Current VM count: $TOTAL_VMS (Target: 27)"
        echo "💡 Consider scaling up for maximum mining potential"
    fi
}

# Function to check current resource usage
check_resource_usage() {
    echo ""
    echo "📈 Current Resource Usage Analysis:"
    echo "(This requires SSH access to individual VMs)"
    echo ""
    echo "To manually check individual VM usage:"
    echo "gcloud compute ssh [VM_NAME] --zone=[ZONE] --command='top -bn1 | head -5'"
    echo "gcloud compute ssh [VM_NAME] --zone=[ZONE] --command='free -h'"
    echo "gcloud compute ssh [VM_NAME] --zone=[ZONE] --command='iostat'"
}

# Function to generate mining deployment recommendations
generate_recommendations() {
    echo ""
    echo "🚀 Mining Deployment Recommendations:"
    echo ""
    echo "Phase 1: Pilot Deployment (3-5 VMs)"
    echo "- Deploy XMRig containers on lowest-utilized VMs"
    echo "- Test mining pool connectivity"
    echo "- Monitor performance impact on services"
    echo ""
    echo "Phase 2: Gradual Scale (10-15 VMs)"
    echo "- Expand to additional VMs based on pilot results"
    echo "- Implement intelligent workload management"
    echo "- Add multi-currency mining support"
    echo ""
    echo "Phase 3: Full Deployment (All 27+ VMs)"
    echo "- Complete fleet mining optimization"
    echo "- Revenue tracking and optimization"
    echo "- Automated scaling and management"
    echo ""
    echo "Estimated Timeline: 3-4 weeks to full deployment"
}

# Main execution
main() {
    audit_vms
    audit_cloud_run
    calculate_mining_potential
    check_resource_usage
    generate_recommendations
    
    echo ""
    echo "=== Audit Complete ==="
    echo "Next Steps:"
    echo "1. Review VM specifications and current usage"
    echo "2. Select pilot VMs for initial mining deployment"
    echo "3. Deploy containerized mining infrastructure"
    echo "4. Monitor and optimize for maximum revenue"
    echo ""
    echo "For immediate mining deployment, run:"
    echo "./deploy-mining.sh"
}

# Execute main function
main