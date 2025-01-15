# WMPotify
* A Windows Media Player 11 inspired Spicetify theme for Spotify
* Still WIP
* Supported versions
    * 1.2.52 (full, primarily tested)
    * 1.2.53 (should work)
    * 1.2.50 (partial)
    * 1.2.49 (maybe)
    * ~~1.2.45~~ (fully broken)

## Installation
* No proper installation guide yet
* Using the theme is NOT YET RECOMMENDED for end users, as it's still WIP
* For Windows, paste this in cmd to install the theme:
```cmd
cd %tmp%
set "THEMEPATH=%appdata%\spicetify\Themes\WMPotify"
curl -L https://github.com/Ingan121/WMPotify/archive/refs/heads/master.zip -o wmpotify.zip
tar -xf wmpotify.zip
md "%THEMEPATH%"
copy WMPotify-master\theme\dist\* "%THEMEPATH%" /y
spicetify config current_theme WMPotify
spicetify apply
echo.
```
* For Windows, install the `CEF/Spotify Tweaks` [Windhawk](https://windhawk.net/) mod [in this repository](https://github.com/Ingan121/WMPotify/tree/master/cte.wh.cpp) to use the Aero/Basic style properly. (Paste the contents of the `cte.wh.cpp` file in the WH mod editor and compile it; it wasn't uploaded to the WH mod repository yet) Disable the `CEF/Spotify Titlebar Enabler` mod if you have it installed. (It's older version of the WH mod in this repository)
* Make sure to check for new commits and update the theme (+CustomApps+WH mod) accordingly if you installed this WIP theme

## TODO
* Theme more pages
    * Artist discography page
    * Search page
    * Settings page
* Theme more elements
    * Main view header bar
* Full screen mode theme
* Support more versions of Spotify
    * Older versions support, possibly down to 1.2.49?
* Add installation script + guide

### Things to be done after a proper beta release
* Dark mode support + dynamic theme support
* (Maybe) make a own library custom app to replace LibraryX and make it more WMP11-like

## Credits
* [Spicetify](https://spicetify.app/)
* [Spotify](https://www.spotify.com/)
* wmploc.dll resources from Windows Media Player 11 by Microsoft
* Some codes from [spicetify-visualizer](https://github.com/Konsl/spicetify-visualizer) by Konsl
* [7.css](https://khang-nd.github.io/7.css) by Khang-ND - used for some controls like buttons, menus, etc. Actually from my own fork from ModernActiveDesktop
* Some codes are from my previous [ModernActiveDesktop](https://github.com/Ingan121/ModernActiveDesktop) project
* For the CEF/Spotify Tweaks mod:
    * [Windhawk](https://windhawk.net/)
    * [Visual Studio Anti-Rich-Header](https://windhawk.net/mods/visual-studio-anti-rich-header) by m417z
    * [Chrome UI Tweaks](https://windhawk.net/mods/chrome-ui-tweaks) by Vasher
    * [Chromium Embedded Framework](https://bitbucket.org/chromiumembedded/cef)
    * [Chromium](https://www.chromium.org/)