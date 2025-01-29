[CmdletBinding()]
param (
    [ValidateSet('Install', 'Uninstall', 'Update', 'AdminJob')]
    [string]$Action = 'Install'

    [string[]]$Install = @('wmpotify', 'wmpvis', 'ctewh')

    [string]$Version = 'latest'

    [bool]$GetFromGit = $false
    [bool]$NoAskCTEWH = $false
)
begin {
    $ErrorActionPreference = 'Stop'
    Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process -Force
    [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
    $previousConsoleTitle = $Host.UI.RawUI.WindowTitle
    $Host.UI.RawUI.WindowTitle = 'WMPotify Installer'
}
process {
    Clear-Host

    Write-Verbose -Message 'Downloading Functions module...'
    $moduleName = 'Functions'
    $Temp = [System.IO.Path]::GetTempPath()
    $modulePath = "$Temp\$moduleName.psm1"
    if (-not (Test-Path -Path $modulePath)) {
        $Parameters = @{
            Uri             = (
            'https://www.ingan121.com/wmpotify/installer/Functions.psm1'
            )
            UseBasicParsing = $true
            OutFile         = $modulePath
        }
        try {
            Invoke-WebRequest @Parameters -ErrorAction Stop
        } catch {
            Write-Error -Message "Failed to download: $($_.Exception.Message). Please check your internet connection and try again."
        }
    }
    Import-Module -Name $modulePath

    Clear-Host
    Write-HelloMessage

    $minimumPowerShellVersion = 5
    $currentPowerShellVersion = $PSVersionTable.PSVersion.Major

    if ($currentPowerShellVersion -lt $minimumPowerShellVersion) {
        Write-Error -Message (
        "Your PowerShell version is $currentPowerShellVersion.`n" +
        "The minimum version required to run this script is $minimumPowerShellVersion."
        )
    }

    $isSpicetifyInstalled = Test-Spicetify
    
    $currentPrincipal = New-Object -TypeName System.Security.Principal.WindowsPrincipal -ArgumentList ([System.Security.Principal.WindowsIdentity]::GetCurrent())
    $isAdmin = $currentPrincipal.IsInRole([System.Security.Principal.WindowsBuiltInRole]::Administrator)

    switch ($Action) {
        'Uninstall' {
        if (-not $isSpicetifyInstalled) {
            Write-Error -Message 'Failed to detect Spicetify installation!'
        }

        $spicetifyFolders = Get-SpicetifyFoldersPaths
        $Parameters = @{
            ThemePath  = $spicetifyFolders.themePath
            VisAppPath = $spicetifyFolders.visAppPath
            Config     = $spicetifyFolders.configPath
        }

        $Host.UI.RawUI.Flushinputbuffer()
        do {
            $choice = $Host.UI.PromptForChoice(
                '',
                'Do you plan to use the marketplace to install the next theme?',
                ('&Yes', '&No'),
                0
            )
            if ($choice -notin 0, 1) {
                Write-Host "Invalid choice. Please select Yes or No." -ForegroundColor Yellow
            }
        } until ($choice -in 0, 1)

        if ($choice -eq 0) {
            $Parameters.Value = 'marketplace'
        }

        Uninstall-WMPotify @Parameters
        }
        'Update' {
        if (-not $isSpicetifyInstalled) {
            Write-Error -Message 'Failed to detect Spicetify installation!'
        }

        $spicetifyFolders = Get-SpicetifyFoldersPaths
        $Parameters = @{
            ThemePath   = $spicetifyFolders.themePath
            VisAppPath  = $spicetifyFolders.visAppPath
            Config      = $spicetifyFolders.configPath
        }
        Install-WMPotify @Parameters
        }
        'Install' {
        if (-not (Test-Spotify)) {
            Write-Host -Object 'Spotify not found.' -ForegroundColor Yellow

            $Host.UI.RawUI.Flushinputbuffer()
            do {
                $choice = $Host.UI.PromptForChoice('', 'Install Spotify?', ('&Yes', '&No'), 0)
                if ($choice -notin 0, 1) {
                    Write-Host "Invalid choice. Please select Yes or No." -ForegroundColor Yellow
                }
            } until ($choice -in 0, 1)

            if ($choice -eq 1) {
                exit
            }

            Install-Spotify
        }

        if (-not $isSpicetifyInstalled) {
            Write-Host -Object 'Spicetify not found.' -ForegroundColor Yellow

            $Host.UI.RawUI.Flushinputbuffer()
            do {
                $choice = $Host.UI.PromptForChoice('', 'Install Spicetify?', ('&Yes', '&No'), 0)
                if ($choice -notin 0, 1) {
                    Write-Host "Invalid choice. Please select Yes or No." -ForegroundColor Yellow
                }
            } until ($choice -in 0, 1)
            if ($choice -eq 1) {
            exit
            }
            
            Install-Spicetify
            Install-Marketplace
        }

        if ('ctewh' -in $Install) {
            if (-not (Test-Windhawk)) {
                Write-Host -Object 'Windhawk not found.' -ForegroundColor Yellow

                if (-not $NoAskCTEWH) {
                    $Host.UI.RawUI.Flushinputbuffer()
                    Write-Host -Object 'Windhawk is a customization marketplace for Windows programs.' -ForegroundColor Yellow
                    Write-Host -Object 'WMPotify can take advantage of a Windhawk mod called "CEF/Spotify Tweaks" to enhance the experience with WMPotify.' -ForegroundColor Yellow
                    Write-Host -Object 'The enhancements include enabling the native system title bar, using the system window appearance like Aero Glass or Mica, custom mini mode, playback speed control, and more.' -ForegroundColor Yellow
                    do {
                        $choice = $Host.UI.PromptForChoice('', 'Would you like to install Windhawk and the CEF/Spotify Tweaks mod?', ('&Yes', '&No'), 0)
                        if ($choice -notin 0, 1) {
                            Write-Host "Invalid choice. Please select Yes or No." -ForegroundColor Yellow
                        }
                    } until ($choice -in 0, 1)

                    if ($choice -eq 0) {
                        if ($isAdmin) {
                            Install-Windhawk
                            Install-WindhawkMod
                        } else {
                            Invoke-AdminJob
                        }
                    }
                } else {
                    if ($isAdmin) {
                        Install-Windhawk
                        Install-WindhawkMod
                    } else {
                        Invoke-AdminJob
                    }
                }
            } elseif (-not (Test-WindhawkMod)) {
                Write-Host -Object 'Windhawk is installed, but CEF/Spotify Tweaks mod is not installed or outdated.' -ForegroundColor Yellow

                if (-not $NoAskCTEWH) {
                    $Host.UI.RawUI.Flushinputbuffer()
                    Write-Host -Object 'CEF/Spotify Tweaks is a mod for Windhawk that enhances the experience with WMPotify.' -ForegroundColor Yellow
                    Write-Host -Object 'The enhancements include enabling the native system title bar, using the system window appearance like Aero Glass or Mica, custom mini mode, playback speed control, and more.' -ForegroundColor Yellow
                    do {
                        $choice = $Host.UI.PromptForChoice('', 'Would you like to install the CEF/Spotify Tweaks mod?', ('&Yes', '&No'), 0)
                        if ($choice -notin 0, 1) {
                            Write-Host "Invalid choice. Please select Yes or No." -ForegroundColor Yellow
                        }
                    } until ($choice -in 0, 1)

                    if ($choice -eq 0) {
                        if ($isAdmin) {
                            Install-WindhawkMod
                        } else {
                            Invoke-AdminJob
                        }
                    }
                } else {
                    if ($isAdmin) {
                        Install-WindhawkMod
                    } else {
                        Invoke-AdminJob
                    }
                }
            }
        }

        $spicetifyFolders = Get-SpicetifyFoldersPaths
        $Parameters = @{
            ThemePath   = $spicetifyFolders.themePath
            VisAppPath  = $spicetifyFolders.visAppPath
            Config      = $spicetifyFolders.configPath
            GetWMPVis   = 'wmpvis' -in $Install
            SkipTheme   = 'wmpotify' -notin $Install
        }
        if ($GetFromGit) {
            $Parameters.Branch = $Version
        } else {
            $Parameters.Tag = $Version
        }

        Install-WMPotify @Parameters
        }
        'AdminJob' {
        if (-not $isAdmin) {
            Write-Error -Message 'This action requires administrator privileges.'
        } else {
            if ('ctewh' -in $Install) {
                if (-not (Test-Windhawk)) {
                    Install-Windhawk
                }
                if (-not (Test-WindhawkMod)) {
                    Install-WindhawkMod
                }
            } else {
                Write-Error -Message 'Nothing to do as admin.'
            }
        }
        }
    }
}
end {
    Write-ByeMessage
    Remove-Module -Name $moduleName -Force
    Remove-Item -Path $modulePath -Force
    [Console]::Title = $previousConsoleTitle
    Start-Sleep -Seconds 5
}