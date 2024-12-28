#!/bin/bash

# Create images directory if it doesn't exist
mkdir -p images

# Download images from actual sources
# Project Logo - Modern medical tech logo
curl -o images/aimed-logo.png "https://raw.githubusercontent.com/microsoft/azure-health-data-services-workshop/main/images/healthcare.png"

# Azure Service Icons - Official Azure icons
curl -o images/azure-services-icons.png "https://raw.githubusercontent.com/microsoft/azure-health-data-services-workshop/main/images/architecture.png"

# Medical Icons - Healthcare monitoring icons
curl -o images/medical-icons.png "https://raw.githubusercontent.com/microsoft/azure-health-data-services-workshop/main/images/health-icons.png"

# Device Icons - IoT device icons
curl -o images/device-icons.png "https://raw.githubusercontent.com/Azure/azure-iot-developer-kit/master/docs/assets/images/mini-solution/remote-monitoring/architecture.png"

# Alert Icons - Warning and notification icons
curl -o images/alert-icons.png "https://raw.githubusercontent.com/microsoft/MCW-Cloud-native-applications/master/Hands-on%20lab/images/alert-rules.png"

# UI Icons - Dashboard elements
curl -o images/user-interface-icons.png "https://raw.githubusercontent.com/microsoft/azure-health-data-services-workshop/main/images/dashboard.png"

# Set permissions
chmod 644 images/*

echo "Image download complete!"
