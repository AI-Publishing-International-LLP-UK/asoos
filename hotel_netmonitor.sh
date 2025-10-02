#!/bin/bash
# Hotel WiFi Network Monitor
# Simple script to track connection quality

LOG_FILE="$HOME/hotel_network_log.txt"
date_time=$(date '+%Y-%m-%d %H:%M:%S')

echo "=== Hotel Network Monitor Started at $date_time ===" >> "$LOG_FILE"

# Test connectivity
echo "[$date_time] Testing connectivity..." >> "$LOG_FILE"
ping_result=$(ping -c 3 8.8.8.8 2>/dev/null | tail -1)
if [ $? -eq 0 ]; then
    echo "[$date_time] Connectivity: OK - $ping_result" >> "$LOG_FILE"
else
    echo "[$date_time] Connectivity: FAILED" >> "$LOG_FILE"
fi

# Check WiFi signal strength
signal_info=$(wdutil info 2>/dev/null | grep -E "RSSI|Channel" || echo "Signal info unavailable")
echo "[$date_time] WiFi Info: $signal_info" >> "$LOG_FILE"

# Check current network
current_network=$(networksetup -getairportnetwork en0 2>/dev/null || echo "Network info unavailable")
echo "[$date_time] Network: $current_network" >> "$LOG_FILE"

echo "[$date_time] --- Monitor cycle complete ---" >> "$LOG_FILE"

# Keep only last 100 lines to prevent log bloat
tail -100 "$LOG_FILE" > "${LOG_FILE}.tmp" && mv "${LOG_FILE}.tmp" "$LOG_FILE"