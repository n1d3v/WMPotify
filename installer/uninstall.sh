#!/bin/sh

echo "Uninstalling WMPotify and WMPVis..."

if ! command -v spicetify >/dev/null 2>&1; then
    echo "spicetify could not be found. Exiting..."
    exit 1
fi

spicetify_path=$(dirname "$(spicetify -c)")
theme_path="$spicetify_path/Themes/WMPotify"
vis_app_path="$spicetify_path/CustomApps/wmpvis"

current_apps=$(spicetify config custom_apps)
current_apps=$(echo "$current_apps" | grep -v "wmpvis")

if echo "$current_apps" | grep -q "marketplace"; then
    spicetify config current_theme marketplace
else
    spicetify config current_theme ""
fi

spicetify config color_scheme ""
spicetify config custom_apps ""
spicetify config custom_apps "$(echo "$current_apps" | tr '\n' '|')"

rm -rf "$theme_path"
rm -rf "$vis_app_path"

spicetify apply

echo "Uninstallation complete."