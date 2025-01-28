#Requires -Version 5.0

#region Console helpers
function Write-HelloMessage {
    [CmdletBinding()]
    param ()
    process {
        # Write-Host
        # Write-Center -Message '----------------------------------------' -ForegroundColor Blue
        # Write-Center -Message 'WMPotify for Spicetify by Ingan121' -ForegroundColor Blue
        # Write-Host
        # Write-Center -Message 'github.com/sanoojes/Spicetify-WMPotify' -ForegroundColor Blue
        # Write-Center -Message '----------------------------------------' -ForegroundColor Blue
        # Write-Host
        Write-Host -Object 'WMPotify for Spicetify Installer' -ForegroundColor Blue
        Write-Host -Object 'Made by Ingan121' -ForegroundColor Blue
        Write-Host
        Write-Host -Object 'https://github.com/Ignan121/WMPotify'
        Write-Host -Object '(Mostly) licensed under the MIT License'
    }
}

function Write-Error {
    [CmdletBinding()]
    param (
        [Parameter(Mandatory)]
        [string]$Message
    )
    process {
        Write-Host -Object $Message -ForegroundColor Red
        Write-Verbose -Message $Message
    }
    end {
        Wait-Input
        exit 1
    }
}

function Write-ByeMessage {
    [CmdletBinding()]
    param ()
    process {
        Write-Host
        Write-Center -Message '----------------------------------------' -ForegroundColor Green
        Write-Center -Message 'No errors!' -ForegroundColor Green
        Write-Host
        Write-Center -Message 'Thanks for using WMPotify!' -ForegroundColor Green
        Write-Center -Message '----------------------------------------' -ForegroundColor Green
        Write-Host
    }
}

function Wait-Input {
    [CmdletBinding()]
    param ()
    process {
        Write-Host -Object 'Press any key to continue...'
        $Host.UI.RawUI.Flushinputbuffer()
        $Host.UI.RawUI.ReadKey('NoEcho, IncludeKeyDown') | Out-Null
    }
}
#endregion Console helpers

#region Spotify
function Test-Spotify {
    [CmdletBinding()]
    [OutputType([bool])]
    param ()
    begin {
        Write-Verbose -Message 'Checking if Spotify is installed...'
    }
    process {
        $desktopApp = Test-Path -Path "$env:APPDATA\Spotify" -PathType Container
        $storeApp = Get-AppxPackage -Name '*SpotifyAB*'
    }
    end {
        $desktopApp -or $storeApp
    }
}

function Test-SpotifyBackup {
    [CmdletBinding()]
    [OutputType([bool])]
    param (
        [Parameter(Mandatory)]
        [string]$Path
    )
    begin {
        Write-Verbose -Message 'Checking if there is up-to-date Spotify backup...'
    }
    process {
        $configFile = Get-Content -Path $Path
        $configFile | ForEach-Object -Process {
            if ($PSItem -match '^version = (.+)$') {
                $backupVersion = $Matches[1]
            }
            elseif ($PSItem -match '^prefs_path.+= (.+)$') {
                $spotifyPrefsPath = $Matches[1]
            }
        }
        
        $spotifyPrefs = Get-Content -Path $spotifyPrefsPath
        $spotifyPrefs | ForEach-Object -Process {
            if ($PSItem -match '^app.last-launched-version="(.+)"$') {
                $spotifyVersion = $Matches[1]
            }
        }
    }
    end {
        $backupVersion -eq $spotifyVersion
    }
}

function Install-Spotify {
    [CmdletBinding()]
    param ()
    begin {
        $Temp = [System.IO.Path]::GetTempPath()
        $installerPath = "$Temp\SpotifySetup.exe"
    }
    process {
        Write-Verbose -Message 'Downloading the Spotify installer...'
        $Parameters = @{
            UseBasicParsing = $true
            Uri             = 'https://download.scdn.co/SpotifySetup.exe'
            OutFile         = $installerPath
        }
        try {
            Invoke-WebRequest @Parameters -ErrorAction Stop
        } catch {
            Write-Error -Message "Failed to download: $($_.Exception.Message). Please check your internet connection and try again."
        } 
        
        Write-Host
        Write-Host -Object 'ATTENTION!' -ForegroundColor Yellow
        Write-Host -Object 'Do not close the Spotify installer!'
        Write-Host -Object 'Once Spotify is installed, please login. Then close the window.'
        Wait-Input
        
        Write-Host
        Write-Verbose -Message 'Starting the Spotify installer...'
        Start-Process -FilePath $installerPath
        
        while (-not (Get-Process -Name Spotify -ErrorAction SilentlyContinue)) {
            Start-Sleep -Seconds 1
        }
        Wait-Process -Name Spotify
    }
}
#endregion Spotify

#region Spicetify
function Test-Spicetify {
    [CmdletBinding()]
    [OutputType([bool])]
    Param ()
    Begin {
        Write-Verbose -Message 'Checking if Spicetify is installed...'
    }
    Process {
        [bool](Get-Command -Name spicetify -ErrorAction SilentlyContinue) 
    }
}

function Install-Spicetify {
    [CmdletBinding()]
    param ()
    begin {
        Write-Verbose -Message 'Starting the Spicetify installation script...'
    }
    process {
        $Parameters = @{
            UseBasicParsing = $true
            Uri             = 'https://raw.githubusercontent.com/spicetify/spicetify-cli/master/install.ps1'
        }
        try {
            Invoke-WebRequest @Parameters -ErrorAction Stop | Invoke-Expression
        } catch {
            Write-Error -Message "Failed to download: $($_.Exception.Message). Please check your internet connection and try again."
        } 
    }
}

function Install-Marketplace {
    [CmdletBinding()]
    param ()
    begin {
        Write-Verbose -Message 'Starting the Spicetify Marketplace installation script...'
    }
    process {
        $Parameters = @{
            UseBasicParsing = $true
            Uri             = (
                'https://raw.githubusercontent.com/spicetify/spicetify-marketplace/main/resources/install.ps1'
            )
        }
        try {
            Invoke-WebRequest @Parameters -ErrorAction Stop | Invoke-Expression
        } catch {
            Write-Error -Message "Failed to download: $($_.Exception.Message). Please check your internet connection and try again."
        } 
    }
}

function Get-SpicetifyFoldersPaths {
    [CmdletBinding()]
    [OutputType([hashtable])]
    param ()
    begin {
        Write-Verbose -Message 'Getting the Spicetify folders paths...'
    }
    process {
        @{
            configPath = (spicetify path -c)
            visAppPath = "$(spicetify path userdata)\CustomApps\wmpvis"
            themePath  = "$(spicetify path userdata)\Themes\WMPotify"
        }
    }
}

function Submit-SpicetifyConfig {
    [CmdletBinding()]
    param (
        [Parameter(Mandatory)]
        [string]$Path
    )
    begin {
        Write-Verbose -Message 'Applying changes...'
    }
    process {
        if (Test-SpotifyBackup -Path $Path) {
            spicetify apply
        }
        else {
            spicetify backup apply
        }
    }
}
#endregion Spicetify

#region Windhawk
function Test-Windhawk {
    [CmdletBinding()]
    [OutputType([bool])]
    param ()
    begin {
        Write-Verbose -Message 'Checking if Windhawk is installed...'
    }
    process {
        $service = Get-Service -Name 'windhawk' -ErrorAction SilentlyContinue
        $portable = Get-Process -Name 'windhawk' -ErrorAction SilentlyContinue
    }
    end {
        $service -or $portable
    }
}

function Install-Windhawk {
    [CmdletBinding()]
    param ()
    begin {
        $Temp = [System.IO.Path]::GetTempPath()
        $installerPath = "$Temp\windhawk_setup.exe"
    }
    process {
        Write-Verbose -Message 'Downloading the Windhawk installer...'
        $Parameters = @{
            UseBasicParsing = $true
            Uri             = 'https://ramensoftware.com/downloads/windhawk_setup.exe'
            OutFile         = $installerPath
        }
        try {
            Invoke-WebRequest @Parameters -ErrorAction Stop
        } catch {
            Write-Error -Message "Failed to download: $($_.Exception.Message). Please check your internet connection and try again."
        }

        Write-Host
        Write-Verbose -Message 'Starting the Windhawk installer...'
        Start-Process -FilePath $installerPath -ArgumentList '/S'

        while (-not (Get-Service -Name 'windhawk' -ErrorAction SilentlyContinue)) {
            Start-Sleep -Seconds 1
        }
        Wait-Service -Name 'windhawk'
    }
}

function Get-WindhawkPaths {
    [CmdletBinding()]
    [OutputType([hashtable])]
    param ()
    begin {
        Write-Verbose -Message 'Getting the Windhawk mod paths...'
    }
    process {
        $service = Get-Service -Name 'windhawk' -ErrorAction SilentlyContinue
        $portable = Get-Process -Name 'windhawk' -ErrorAction SilentlyContinue

        $windhawkPath = if ($service) {
            (Get-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Services\windhawk" -Name "ImagePath").ImagePath -replace '\"', ''
        } elseif ($portable) {
            $portable.Path
        } else {
            Write-Error -Message 'Windhawk is not installed or running.'
            return
        }

        $windhawkDir = Split-Path -Path $windhawkPath -Parent
        $iniPath = Join-Path -Path $windhawkDir -ChildPath 'windhawk.ini'

        if (-not (Test-Path -Path $iniPath)) {
            Write-Error -Message "windhawk.ini not found in $windhawkDir"
            return
        }

        $iniContent = Get-Content -Path $iniPath
        $appDataPath = foreach ($line in $iniContent | Select-String -Pattern 'AppDataPath\s*=\s*(.+)') { $line.Matches[0].Groups[1].Value }
        $registryKey = foreach ($line in $iniContent | Select-String -Pattern 'RegistryKey\s*=\s*(.+)') { $line.Matches[0].Groups[1].Value }

        $appDataPath = [Environment]::ExpandEnvironmentVariables($appDataPath)

        $enginePath = foreach ($line in $iniContent | Select-String -Pattern 'EnginePath\s*=\s*(.+)') { $line.Matches[0].Groups[1].Value }
        $engineIniPath = Join-Path -Path $windhawkDir -ChildPath (Join-Path -Path $enginePath -ChildPath 'engine.ini')

        if (-not (Test-Path -Path $engineIniPath)) {
            Write-Error -Message "engine.ini not found in $engineIniPath"
            return
        }

        $engineIniContent = Get-Content -Path $engineIniPath
        $engineAppDataPath = foreach ($line in $engineIniContent | Select-String -Pattern 'AppDataPath\s*=\s*(.+)') { $line.Matches[0].Groups[1].Value }
        $engineRegistryKey = foreach ($line in $engineIniContent | Select-String -Pattern 'RegistryKey\s*=\s*(.+)') { $line.Matches[0].Groups[1].Value }

        $engineAppDataPath = [Environment]::ExpandEnvironmentVariables($engineAppDataPath)

        @{
            AppDataPath = $appDataPath
            RegistryKey = $registryKey
            EngineAppDataPath = $engineAppDataPath
            EngineRegistryKey = $engineRegistryKey
        }
    }
}

function Get-WindhawkModPaths {
    [CmdletBinding()]
    [OutputType([hashtable])]
    param ()
    begin {
        Write-Verbose -Message 'Getting the Windhawk mod paths...'
    }
    process {
        $windhawkPaths = Get-WindhawkPaths
        $modNames = @('local@cef-titlebar-enabler-universal', 'cef-titlebar-enabler-universal')
        $requiredVersion = [Version]'0.6'

        $modPaths = @{
            x86 = $modNames | ForEach-Object { Join-Path -Path $windhawkPaths.EngineAppDataPath -ChildPath "Mods\32\$_*.dll" }
            x64 = $modNames | ForEach-Object { Join-Path -Path $windhawkPaths.EngineAppDataPath -ChildPath "Mods\64\$_*.dll" }
            source = $modNames | ForEach-Object { Join-Path -Path $windhawkPaths.AppDataPath -ChildPath "ModsSource\$_.wh.cpp" }
            registry = $modNames | ForEach-Object { Join-Path -Path $windhawkPaths.EngineRegistryKey -ChildPath "Mods\$_" }
        }

        $modFiles = @()
        $modPaths.x86 + $modPaths.x64 | ForEach-Object { $modFiles += Get-ChildItem -Path $_ -ErrorAction SilentlyContinue }
        $modPaths.source | ForEach-Object { $modFiles += Get-Item -Path $_ -ErrorAction SilentlyContinue }

        # if ($modFiles.Count -eq 0) {
        #     Write-Error -Message "Mod not found in required paths."
        #     return
        # }

        # $modVersion = $null
        # foreach ($file in $modFiles) {
        #     if ($file.Name -match "(${modNames -join '|'})_(\d+\.\d+)_\d+\.dll$") {
        #         $version = [Version]$Matches[2]
        #         if ($version -ge $requiredVersion) {
        #             $modVersion = $version
        #             break
        #         }
        #     }
        # }

        # if (-not $modVersion) {
        #     Write-Error -Message "Mod version is lower than required ($requiredVersion)."
        #     return
        # }

        $modPaths
    }
}

function Test-WindhawkMod {
    [CmdletBinding()]
    [OutputType([bool])]
    param ()
    begin {
        Write-Verbose -Message 'Checking if the Windhawk mod is installed...'
    }
    process {
        $modPaths = Get-WindhawkModPaths
        $fileTest = $modPaths.x86 + $modPaths.x64 + $modPaths.source | ForEach-Object { Test-Path -Path $_ }
        $regTest = $modPaths.registry | ForEach-Object { Test-Path -Path "Registry::$($_)" }
        $fileTest -and $regTest
    }
}

function Install-WindhawkMod {
    [CmdletBinding()]
    param ()
    begin {
        $Temp = [System.IO.Path]::GetTempPath()
        $installerPath = "$Temp\cte_0.6.zip"
        # cte.reg
        # local@cef-titlebar-enabler-universal.wh.cpp
        # 32/local@cef-titlebar-enabler-universal_0.6_242230.dll
        # 64/local@cef-titlebar-enabler-universal_0.6_242230.dll
    }
    process {
        Write-Verbose -Message 'Downloading the Windhawk mod files...'
        $Parameters = @{
            UseBasicParsing = $true
            Uri             = 'https://www.ingan121.com/wmpotify/installer/cte_0.6.zip'
            OutFile         = $installerPath
        }
        try {
            Invoke-WebRequest @Parameters -ErrorAction Stop
        } catch {
            Write-Error -Message "Failed to download: $($_.Exception.Message). Please check your internet connection and try again."
        }

        Write-Verbose -Message 'Extracting the Windhawk mod files...'
        Expand-Archive -Path $installerPath -Destination $Temp

        $modPaths = Get-WindhawkModPaths
        
        Write-Verbose -Message 'Copying the Windhawk mod files to the correct directories...'
        $modFiles = Get-ChildItem -Path "$Temp\cte_0.6" -Recurse

        foreach ($file in $modFiles) {
            $destination = switch -Regex ($file.FullName) {
                '32\\.*\.dll$' { Join-Path -Path $modPaths.x86 -ChildPath $file.Name }
                '64\\.*\.dll$' { Join-Path -Path $modPaths.x64 -ChildPath $file.Name }
                '.*\.wh\.cpp$' { Join-Path -Path $modPaths.source -ChildPath $file.Name }
                default { $null }
            }

            if ($destination) {
                Write-Verbose -Message "Copying '$($file.FullName)' to '$destination'"
                Copy-Item -Path $file.FullName -Destination $destination -Force
            }
        }

        Write-Verbose -Message 'Importing the registry file...'
        $regFileContent = Get-Content -Path $regFilePath
        $regFileContent = $regFileContent -replace 'HKEY_LOCAL_MACHINE\\SOFTWARE\\Windhawk\\Engine\\Mods\\local@cef-titlebar-enabler-universal', $modPaths.registry
        Set-Content -Path $regFilePath -Value $regFileContent
        $regFilePath = Join-Path -Path "$Temp\cte_0.6" -ChildPath 'cte.reg'
        if (Test-Path -Path $regFilePath) {
            try {
                Start-Process -FilePath 'regedit.exe' -ArgumentList "/s `"$regFilePath`"" -Wait -NoNewWindow
            } catch {
                Write-Error -Message "Failed to import registry file: $($_.Exception.Message)"
            }
        } else {
            Write-Error -Message "Registry file not found: $regFilePath"
        }

        $service = Get-Service -Name 'windhawk' -ErrorAction SilentlyContinue
        $process = Get-Process -Name 'windhawk' -ErrorAction SilentlyContinue
        if ($service) {
            Write-Verbose -Message 'Restarting Windhawk service...'
            Restart-Service -Name 'windhawk'
        } elseif ($process) {
            Write-Verbose -Message 'Restarting Windhawk process...'
            Stop-Process -Name 'windhawk' -Force
            Start-Process -FilePath $process.Path
        } else {
            # should not be reachable i think
            Write-Error -Message 'Windhawk is not installed or running.'
        }
    }
}
#endregion Windhawk

#region Misc
function Get-WindowsAppsTheme {
    [CmdletBinding()]
    param ()
    begin {
        Write-Verbose -Message 'Getting current Windows apps theme...'
        $Parameters = @{
            Path = 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Themes\Personalize'
            Name = 'AppsUseLightTheme'
        }
    }
    process {
        switch (Get-ItemPropertyValue @Parameters) {
            0 { 'dark' }
            1 { 'light' }
        }
    }
}
#endregion Misc

#region WMPotify
function Get-WMPotify {
    [CmdletBinding()]
    [OutputType([System.Collections.Hashtable])]
    param (
        [string]$Tag
        [string]$Branch
        [bool]$GetWMPVis = $true
    )
    begin {
        if ($PSBoundParameters.ContainsKey('Branch')) {
            $filesToDownload = @(
                "https://github.com/Ingan121/WMPotify/archive/refs/heads/$Branch.zip"
            )
        } else {
            $filesToDownload = @(
                "https://github.com/Ingan121/WMPotify/releases/download/$Tag/WMPotify-$Tag.zip",
            )
            if ($GetWMPVis) {
                $filesToDownload += "https://github.com/Ingan121/WMPotify/releases/download/$Tag/WMPotify-NowPlaying-$tag.zip",
            }
        }

        $downloadedFiles = @{}
        $fileCount = $filesToDownload.Count
        $fileIndex = 0

        $Temp = [System.IO.Path]::GetTempPath()
    }
    process {
        foreach ($fileUrl in $filesToDownload) {
            $fileIndex++
            Write-Verbose -Message "Downloading '$fileUrl' ($fileIndex/$fileCount)..."
            try {
                $fileContent = (Invoke-WebRequest -Uri $fileUrl -UseBasicParsing -ErrorAction Stop).Content
                $fileName = Split-Path -Path $fileUrl -Leaf
                $filePath = Join-Path -Path $Temp -ChildPath $fileName
                Set-Content -Path $filePath -Value $fileContent -Encoding Byte
                $downloadedFiles.Add($fileName)
            } catch {
                Write-Error -Message "Failed to download '$fileUrl': $($_.Exception.Message)"
            }
        }
    }
    end {
        return $downloadedFiles
    }
}

function Install-WMPotify {
    [CmdletBinding()]
    param (
        [Parameter(Mandatory)]
        [string]$ThemePath,

        [Parameter(Mandatory)]
        [string]$VisAppPath,
        
        [Parameter(Mandatory)]
        [string]$Config,
        
        [string]$Tag = 'latest',
        [string]$Branch,

        [bool]$GetWMPVis = $true
    )
    begin {
        $branchExists = $PSBoundParameters.ContainsKey('Branch')

        if (-not $branchExists -and $Tag -eq 'latest') {
            Write-Verbose -Message 'Fetching the latest release tag from GitHub...'
            $releaseInfo = Invoke-RestMethod -Uri 'https://api.github.com/repos/Ingan121/WMPotify/releases/latest' -UseBasicParsing
            $tag = $releaseInfo.tag_name
            Write-Verbose -Message "Latest release tag is '$tag'. Fetching files..."
        } else {
            $tag = $Tag
        }

        Write-Verbose -Message "Installing WMPotify theme (Type: $Type, Branch: $Branch)..."
        $downloadedFiles = Get-WMPotify -Tag $tag -Branch $Branch -GetWMPVis $GetWMPVis

        if (($GetWMPVis -eq $false -or $branchExists -and $downloadedFiles.Count -ne 1) -or
            ($GetWMPVis -eq $true -and $branchExists -and $downloadedFiles.Count -ne 2) -or
            ($GetWMPVis -eq $true -and -not $branchExists -and $downloadedFiles.Count -ne 2)
        ) {
            Write-Error -Message 'Failed to download all WMPotify theme files. Installation aborted.' 
        }
    }
    process {
        Write-Verbose -Message "Creating theme directory '$ThemePath'..."
        New-Item -Path $ThemePath -ItemType Directory -Force | Out-Null

        if ($GetWMPVis) {
            Write-Verbose -Message "Creating visapp directory '$VisAppPath'..."
            New-Item -Path $VisAppPath -ItemType Directory -Force | Out-Null
        }

        if ($branchExists) {
            Write-Verbose -Message "Extracting '$Branch.zip' to '$Temp'..."
            Expand-Archive -Path "$Temp\$Branch.zip" -Destination $Temp

            $themeFilesDir = "$Temp\WMPotify-$Branch\theme\dist\"
            $visAppFilesDir = "$Temp\WMPotify-$Branch\CustomeApps\wmpvis\dist\"

            Write-Verbose -Message "Copying files from '$themeFilesDir' to '$ThemePath'..."
            Copy-Item -Path $themeFilesDir -Destination $ThemePath -Recurse -Force

            if ($GetWMPVis) {
                Write-Verbose -Message "Copying files from '$visAppFilesDir' to '$VisAppPath'..."
                Copy-Item -Path $visAppFilesDir -Destination $VisAppPath -Recurse -Force
            }
        } else {
            Write-Verbose -Message "Extracting files to '$ThemePath'..."
            Expand-Archive -Path "$Temp\WMPotify-$tag.zip" -Destination $ThemePath

            if ($GetWMPVis) {
                Write-Verbose -Message "Extracting files to '$VisAppPath'..."
                Expand-Archive -Path "$Temp\WMPotify-NowPlaying-$tag.zip" -Destination $VisAppPath
            }
        }
        
        Write-Verbose -Message 'Configuring Spicetify...'
        spicetify config inject_css 1 replace_colors 1 overwrite_assets 1 inject_theme_js 1
        spicetify config current_theme 'WMPotify'
        spicetify config color_scheme 'aero'

        if ($GetWMPVis) {
            spicetify config custom_apps wmpvis
        }
        
        Submit-SpicetifyConfig -Path $Config
    }
}


function Uninstall-WMPotify {
    <#
    .SYNOPSIS
        Uninstalls the WMPotify theme.

    .DESCRIPTION
        This function uninstalls the WMPotify theme by resetting the relevant Spicetify configurations 
        and removing the theme directory.

    .PARAMETER Path
        Specifies the path to the WMPotify theme directory.

    .PARAMETER Config
        Specifies the path to your Spicetify configuration file.

    .PARAMETER Value 
        Sets current theme and color_scheme to this value, default is empty string
    #>
    [CmdletBinding()]
    param (
        [Parameter(Mandatory)]
        [string]$Path,
        
        [Parameter(Mandatory)]
        [string]$Config,
        
        [string]$Value = ' '
    )
    begin {
        Write-Verbose -Message 'Uninstalling WMPotify theme...'
    }
    process {
        Write-Verbose -Message 'Resetting Spicetify configurations...'
        spicetify config current_theme $Value color_scheme $Value
        Submit-SpicetifyConfig -Path $Config
    }
    end {
        Write-Verbose -Message "Removing theme directory '$Path'..."
        Remove-Item -Path $Path -Recurse -Force
    }
}
#endregion WMPotify