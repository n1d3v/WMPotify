#!/bin/bash

set -e

# Function to print error messages
function print_error {
    echo "$1" >&2
}

# Function to download the latest versions information
function get_latest_versions {
    echo "Getting the latest versions of WMPotify and WMPVis..."
    local latest_versions_url="https://www.ingan121.com/wmpotify/latest.txt"
    local latest_versions=$(curl -s "$latest_versions_url")
    if [[ -z "$latest_versions" ]]; then
        print_error "Failed to download the latest versions information."
        exit 1
    fi

    local theme_version=$(echo "$latest_versions" | grep -oP 'wmpotify\s*=\s*\K.*')
    local vis_version=$(echo "$latest_versions" | grep -oP 'wmpvis\s*=\s*\K.*')

    echo "Latest versions - WMPotify: $theme_version, WMPVis: $vis_version"
    echo "$theme_version" "$vis_version"
}

# Function to download and extract a zip file
function download_and_extract {
    local url="$1"
    local dest_dir="$2"
    local temp_zip=$(mktemp)

    echo "Downloading $url..."
    curl -L -o "$temp_zip" "$url"
    echo "Extracting $temp_zip to $dest_dir..."
    mkdir -p "$dest_dir"
    unzip -o "$temp_zip" -d "$dest_dir"
    rm "$temp_zip"
}

function print_hello {
    echo "WMPotify for Spicetify Installer"
    echo "Made by Ingan121"
    echo
    echo "https://github.com/Ignan121/WMPotify"
    echo "(Mostly) licensed under the MIT License"
    echo
}

# Main script
function main {
    print_hello

    if ! command -v spicetify &> /dev/null; then
        echo "spicetify could not be found. Please install spicetify first."
        exit 1
    fi

    local spicetify_path=="$(dirname "$(spicetify -c)")"
    local theme_path="$spicetify_path/Themes/WMPotify"
    local vis_app_path="$spicetify_path/CustomApps/wmpvis"

    # Get the latest versions
    read -r theme_version vis_version < <(get_latest_versions)

    if [[ -n "$SKIP_THEME" ]]; then
        echo "Skipping theme installation as SkipTheme is set."
    else
        # Download and install WMPotify theme
        local theme_url="https://github.com/Ingan121/WMPotify/releases/download/$theme_version/WMPotify-$theme_version.zip"
        download_and_extract "$theme_url" "$theme_path"
    fi

    # Download and install WMPotify NowPlaying app
    local vis_url="https://github.com/Ingan121/WMPotify/releases/download/$vis_version/WMPotify-NowPlaying-$vis_version.zip"
    download_and_extract "$vis_url" "$vis_app_path"

    spicetify config inject_css 1 replace_colors 1 overwrite_assets 1 inject_theme_js 1
    spicetify config current_theme WMPotify
    spicetify config custom_apps wmpvis

    echo "Done!"
    echo
    echo "Thanks for using WMPotify!"
    echo
}

main "$@"