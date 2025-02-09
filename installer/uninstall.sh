#!/bin/sh

echo "Uninstalling WMPotify and WMPVis..."

if ! command -v spicetify >/dev/null 2>&1; then
    echo "spicetify could not be found. Exiting..."
    exit 1
fi

spicetify_path=$(dirname "$(spicetify -c)")
theme_path="$spicetify_path/Themes/WMPotify"
vis_app_path="$spicetify_path/CustomApps/wmpvis"

spicetify config color_scheme ""
spicetify config custom_apps wmpvis-

rm -rf "$theme_path"
rm -rf "$vis_app_path"

spicetify apply

echo "Uninstallation complete."