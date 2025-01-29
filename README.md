# WMPotify
* A Windows Media Player 11 inspired Spicetify theme for Spotify
* Still WIP
* Supported versions: 1.2.45 - 1.2.56
    * Primarily tested on 1.2.52
    * 1.2.45: global navbar must be enabled in the experimental features
    * 1.2.44 and below are not supported

## **Installation**

### **Manual installation using Scripts (recomended):**

#### **Windows (Powershell)**

* WMPotify + WMPotify NowPlaying + Windhawk + CEF/Spotify Tweaks mod
```powershell
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
iex "& { $(iwr -useb 'https://raw.githubusercontent.com/Ingan121/WMPotify/master/installer/install.ps1') }"
```

* Theme only:
```powershell
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
iex "& { $(iwr -useb 'https://raw.githubusercontent.com/Ingan121/WMPotify/master/installer/install.ps1') } -Install @('wmpotify')"
```

* WMPotify NowPlaying only:
```powershell
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
iex "& { $(iwr -useb 'https://raw.githubusercontent.com/Ingan121/WMPotify/master/installer/install.ps1') } -Install @('wmpvis')"
```

#### **Linux/macOS (Bash)**

* Not yet!

## TODO
* Add installation script + guide

### Things to be done after a proper beta release
* Dark mode support + dynamic theme support

## Credits
* [Spicetify](https://spicetify.app/)
* [Spotify](https://www.spotify.com/)
* wmploc.dll resources from Windows Media Player 11 by Microsoft
* Some codes from [spicetify-visualizer](https://github.com/Konsl/spicetify-visualizer) by Konsl
* [7.css](https://khang-nd.github.io/7.css) by Khang-ND - used for some controls like buttons, menus, etc. Actually from my own fork from ModernActiveDesktop
* [font-detective](https://github.com/1j01/font-detective) by 1j01
* [Butterchurn](https://butterchurnviz.com/) by Jordan Berg, based on [MilkDrop](https://en.wikipedia.org/wiki/MilkDrop) by Geiss
* Some codes from [Butterchurn adaptation for Wallpaper Engine](https://steamcommunity.com/sharedfiles/filedetails/?id=2962616483) by SeiferX7
* Some inspiration from [this concept image](https://x.com/tehmondspartan/status/1671430592087613441) by MondySpartan (user button, lyrics overlay on top of visualization, etc.)
* Installation PowerShell script from [Spicetify-Lucid](https://github.com/sanoojes/Spicetify-Lucid) by sanoojes
* Some codes are from my previous [ModernActiveDesktop](https://github.com/Ingan121/ModernActiveDesktop) project
* For the CEF/Spotify Tweaks mod:
    * [Windhawk](https://windhawk.net/)
    * [Visual Studio Anti-Rich-Header](https://windhawk.net/mods/visual-studio-anti-rich-header) by m417z
    * [Chrome UI Tweaks](https://windhawk.net/mods/chrome-ui-tweaks) by Vasher
    * [Chromium Embedded Framework](https://bitbucket.org/chromiumembedded/cef)
    * [Chromium](https://www.chromium.org/)
