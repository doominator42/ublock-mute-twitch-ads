#!/bin/sh

# Development HTTP server to serve the local script to uBlock Origin

# Open Adavanced Settings of uBlock Origin
# Set userResourcesLocation to "http://localhost:8080/mute-twitch-ads.js?v=1" (without quotes)
# Increment the "?v=1" to force uBlock to redownload the script

python -m http.server 8080
