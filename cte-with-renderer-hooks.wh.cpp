// ==WindhawkMod==
// @id              cef-titlebar-enabler-universal
// @name            CEF/Spotify Tweaks
// @description     Force native frames and title bars for CEF apps
// @version         0.6
// @author          Ingan121
// @github          https://github.com/Ingan121
// @twitter         https://twitter.com/Ingan121
// @homepage        https://www.ingan121.com/
// @include         spotify.exe
// @include         cefclient.exe
// @compilerOptions -lcomctl32 -luxtheme -ldwmapi
// ==/WindhawkMod==

// ==WindhawkModReadme==
/*
# Spotify Tweaks
* Formerly known as CEF/Spotify Titlebar Enabler
* Force native frames and title bars for CEF apps, such as Spotify
* Only works on apps using native CEF top-level windows
    * Steam uses SDL for its top-level windows (except DevTools), so this mod doesn't work with Steam
* Electron apps are NOT supported! Just patch asar to override `frame: false` to true in BrowserWindow creation
## Features for Spotify
* Enable native frames and title bars on the main window
* Enable native frames and title bars on other windows, including Miniplayer, DevTools, etc.
* Hide the menu button or Spotify's custom window controls
* Make Spotify's custom window controls transparent
* Ignore the minimum window size set by Spotify
* Enable transparent rendering to make the transparent parts of the web contents transparent
* Disable forced dark mode to prevent Spotify from forcing dark mode on the CEF UI & web contents
* Force enable Chrome extensions support
* Use the settings tab on the mod details page to configure the features
## Notes
* Supported CEF versions: 90.4 to 132
    * This mod won't work with versions before 90.4
    * Versions after 132 may work but are not tested
    * Variant of this mod using copy-pasted CEF structs instead of hardcoded offsets is available at [here](https://github.com/Ingan121/files/tree/master/cte)
    * Copy required structs/definitions from your wanted CEF version (available [here](https://cef-builds.spotifycdn.com/index.html)) and paste them to the above variant to calculate the offsets
    * Testing with cefclient: `cefclient.exe --use-views --hide-frame --hide-controls`
* Supported Spotify versions: 1.1.60 to 1.2.53 (newer versions may work)
* Spotify notes:
    * Old releases are available [here](https://docs.google.com/spreadsheets/d/1wztO1L4zvNykBRw7X4jxP8pvo11oQjT0O5DvZ_-S4Ok/edit?pli=1&gid=803394557#gid=803394557)
    * 1.1.60-1.1.67: Use [SpotifyNoControl](https://github.com/JulienMaille/SpotifyNoControl) to remove the window controls
    * 1.1.68-1.1.70: Window control hiding doesn't work
    * 1.2.7: First version to use Library X UI by default
    * 1.2.13: Last version to have the old UI
    * 1.2.28: First version to support Chrome runtime (disabled by default)
    * 1.2.45: Last version to support disabling the global navbar
    * 1.2.47: Chrome runtime is always enabled since this version
    * Try the [noControls](https://github.com/ohitstom/spicetify-extensions/tree/main/noControls) Spicetify extension to remove the space left by the custom window controls
    * Enable Chrome runtime to get a proper window icon. Use `--enable-chrome-runtime` flag or put `app.enable-chrome-runtime=true` in `%appdata%\Spotify\prefs`
    * Spicetify extension developers: Use `window.outerHeight - window.innerHeight > 0` to detect if the window has a native title bar
*/
// ==/WindhawkModReadme==

// ==WindhawkModSettings==
/*
- showframe: true
  $name: Enable native frames and title bars on the main window*
  $description: "(*): Requires a restart to take effect"
- showframeonothers: false
  $name: Enable native frames and title bars on other windows
  $description: Includes Miniplayer, DevTools, etc.
- showmenu: true
  $name: Show the menu button*
  $description: Disabling this also prevents opening the Spotify menu with the Alt key
- showcontrols: false
  $name: Show Spotify's custom window controls*
- transparentcontrols: false
  $name: Make Spotify's custom window controls transparent
- transparentrendering: true
  $name: Enable transparent rendering*
  $description: "Make the transparent parts of the web contents transparent\nWill use the ButtonFace color instead if the classic theme is being used and native frames are enabled\nChrome runtime is required for this to work"
- noforceddarkmode: false
  $name: Disable forced dark mode
  $description: Prevents Spotify from forcing dark mode on the CEF UI & web contents
- forceextensions: true
  $name: Force enable Chrome extensions
  $description: Always enable Chrome extensions support, regardless of the DevTools status
- ignoreminsize: false
  $name: Ignore minimum window size
  $description: Allows resizing the window below the minimum size set by Spotify
- allowuntested: false
  $name: (Advanced) Use unsafe methods on untested CEF versions
  $description: Allows calling unsafe functions on untested CEF versions. May cause crashes or other issues. If disabled, an inefficient alternative method will be used on untested versions.
*/
// ==/WindhawkModSettings==

/* Spotify CEF version map
90.6: 1.1.60-1.1.62
91.1: 1.1.63-1.1.67
91.3: 1.1.68-1.1.70
94: 1.1.71
95: 1.1.74-1.1.75
96: 1.1.76
98: 1.1.81
100: 1.1.85
101: 1.1.86-1.1.88
102: 1.1.89
104: 1.1.94
106: 1.1.97-1.2.3
109: 1.2.4-1.2.6
110: 1.2.7
111: 1.2.8-1.2.10
112: 1.2.11-1.2.12
113: 1.2.13-1.2.19
115: 1.2.20
116: 1.2.21-1.2.22
117: 1.2.23-1.2.24
118: 1.2.25
119: 1.2.26
120: 1.2.28-1.2.30
121: 1.2.31-1.2.32
122: 1.2.33-1.2.37
124: 1.2.38-1.2.39
125: 1.2.40-1.2.44
127: 1.2.45-1.2.46
128: 1.2.47-1.2.48
129: 1.2.49-1.2.50
130: 1.2.51-1.2.52
131: 1.2.53
*/

#include <libloaderapi.h>
#include <windhawk_api.h>
#include <windhawk_utils.h>
#include <vector>
#include <regex>
#include <dwmapi.h>
#include <uxtheme.h>
#include <windows.h>

#define CEF_CALLBACK __stdcall
#define CEF_EXPORT __cdecl
#define cef_window_handle_t HWND
#define ANY_MINOR -1

typedef uint32_t cef_color_t;

struct cte_settings {
    BOOL showframe;
    BOOL showframeonothers;
    BOOL showmenu;
    BOOL showcontrols;
    BOOL transparentcontrols;
    BOOL ignoreminsize;
    BOOL transparentrendering;
    BOOL noforceddarkmode;
    BOOL forceextensions;
    BOOL allowuntested;
} cte_settings;

typedef struct cte_offset {
  int ver_major;
  int ver_minor; // -1 for any
  int offset_x86;
  int offset_x64;
} cte_offset_t;

cte_offset_t is_frameless_offsets[] = {
    {90, 4, 0x48, 0x90},
    {90, 5, 0x48, 0x90},
    {90, 6, 0x48, 0x90},
    {91, 0, 0x48, 0x90},
    {91, 1, 0x48, 0x90},
    // (91.2 is found nowhere)
    {91, 3, 0x50, 0xa0},
    {92, ANY_MINOR, 0x50, 0xa0},
    {101, ANY_MINOR, 0x50, 0xa0},
    {102, ANY_MINOR, 0x54, 0xa8},
    {107, ANY_MINOR, 0x54, 0xa8},
    {108, ANY_MINOR, 0x5c, 0xb8},
    {114, ANY_MINOR, 0x5c, 0xb8},
    {115, ANY_MINOR, 0x60, 0xc0},
    {116, ANY_MINOR, 0x60, 0xc0},
    {117, ANY_MINOR, 0x64, 0xc8},
    {123, ANY_MINOR, 0x64, 0xc8},
    {124, ANY_MINOR, 0x68, 0xd0}
};

cte_offset_t add_child_view_offsets[] = {
    {94, ANY_MINOR, 0xf0, 0x1e0},
    {122, ANY_MINOR, 0xf0, 0x1e0},
    {124, ANY_MINOR, 0xf4, 0x1e8},
    {130, ANY_MINOR, 0xf4, 0x1e8},
    {131, ANY_MINOR, 0xf8, 0x1f0}
};

cte_offset_t get_window_handle_offsets[] = {
    {94, ANY_MINOR, 0x184, 0x308},
    {114, ANY_MINOR, 0x184, 0x308},
    {115, ANY_MINOR, 0x188, 0x310},
    {123, ANY_MINOR, 0x188, 0x310},
    {124, ANY_MINOR, 0x18c, 0x318},
    {130, ANY_MINOR, 0x18c, 0x318},
    {131, ANY_MINOR, 0x194, 0x328},
    {132, ANY_MINOR, 0x194, 0x328}
};

cte_offset_t set_background_color_offsets[] = {
    {94, ANY_MINOR, 0xbc, 0x178},
    {130, ANY_MINOR, 0xbc, 0x178},
    {131, ANY_MINOR, 0xc0, 0x180}
};

int is_frameless_offset = NULL;
int add_child_view_offset = NULL;
int get_window_handle_offset = NULL;
int set_background_color_offset = NULL;

BOOL isRendererProcess = FALSE;

HWND mainHwnd = NULL;
int minWidth = 0;
int minHeight = 0;
BOOL hwAccelerated = FALSE;
BOOL dwmBackdropEnabled = FALSE;

// Same offset for all versions that supports window control hiding
// Cuz get_preferred_size is the very first function in the struct (cef_panel_delegate_t->(cef_view_delegate_t)base.get_preferred_size)
// And cef_base_ref_counted_t, which is the base struct of cef_view_delegate_t, hasn't changed since 94
#ifdef _WIN64
    int get_preferred_size_offset = 0x28;
#else
    int get_preferred_size_offset = 0x14;
#endif

// Whether DwmExtendFrameIntoClientArea should be called
// False if DWM is disabled, visual styles are disabled, or some kind of basic themer is used
BOOL IsDwmEnabled() {
    if (!IsAppThemed() && !IsThemeActive()) {
        return FALSE;
    }
    BOOL dwmEnabled = FALSE;
    DwmIsCompositionEnabled(&dwmEnabled);
    BOOL dwmFrameEnabled = FALSE;
    if (dwmEnabled && mainHwnd != NULL) {
        DwmGetWindowAttribute(mainHwnd, DWMWA_NCRENDERING_ENABLED, &dwmFrameEnabled, sizeof(dwmFrameEnabled));
    } else {
        return dwmEnabled;
    }
    return dwmEnabled && dwmFrameEnabled;
}

LRESULT CALLBACK SubclassProc(HWND hWnd, UINT uMsg, WPARAM wParam, LPARAM lParam, DWORD_PTR dwRefData) {
    // dwRefData is 1 if the window is created by cef_window_create_top_level
    // Assumed 1 if this mod is loaded after the window is created
    // dwRefData is 2 if the window is created by cef_window_create_top_level and is_frameless is hooked
    switch (uMsg) {
        case WM_NCACTIVATE:
            if (dwmBackdropEnabled) {
                // Fix MicaForEveryone not working well with native frames
                return DefWindowProc(hWnd, uMsg, wParam, lParam);
            }
            break;
        case WM_NCPAINT:
            if (hWnd == mainHwnd && hwAccelerated && cte_settings.transparentrendering && !cte_settings.showframe && !IsDwmEnabled()) {
                // Do not draw anything
                return 0;
            }
        case WM_NCHITTEST:
        case WM_NCLBUTTONDOWN:
        case WM_NCCALCSIZE:
            // Unhook Spotify's custom window control event handling
            // Also unhook WM_NCPAINT to fix non-DWM frames randomly going black
            // WM_NCCALCSIZE is only for windows with Chrome's custom frame (DevTools, Miniplayer, full browser UI, etc.)
            if (dwRefData) {
                if (cte_settings.showframe == TRUE || dwRefData == 2) {
                    return DefWindowProc(hWnd, uMsg, wParam, lParam);
                }
            } else if (cte_settings.showframeonothers == TRUE) {
                return DefWindowProc(hWnd, uMsg, wParam, lParam);
            }
            break;
        case WM_GETMINMAXINFO:
            if (cte_settings.ignoreminsize == TRUE) {
                MINMAXINFO* mmi = (MINMAXINFO*)lParam;
                mmi->ptMinTrackSize.x = minWidth;
                mmi->ptMinTrackSize.y = minHeight;
                return 0;
            }
            break;
        case WM_PAINT:
            if (hWnd == mainHwnd && hwAccelerated && cte_settings.transparentrendering && !cte_settings.showframe) {
                // Do not draw anything
                ValidateRect(hWnd, NULL);
                return 0;
            }
            break;
    }
    return DefSubclassProc(hWnd, uMsg, wParam, lParam);
}

BOOL CALLBACK UpdateEnumWindowsProc(HWND hWnd, LPARAM lParam) {
    DWORD pid;
    GetWindowThreadProcessId(hWnd, &pid);
    if (pid == GetCurrentProcessId()) {
        // Update NonClient size
        wchar_t className[256];
        GetClassName(hWnd, className, 256);
        if (wcsncmp(className, L"Chrome_WidgetWin_", 17) == 0) {
            if (lParam == 1) {
                // Really move the window a bit to make Spotify update window control colors
                RECT rect;
                GetWindowRect(hWnd, &rect);
                SetWindowPos(hWnd, NULL, rect.left, rect.top + 1, 0, 0, SWP_NOZORDER | SWP_NOOWNERZORDER | SWP_NOACTIVATE | SWP_NOSIZE);
                SetWindowPos(hWnd, NULL, rect.left, rect.top, 0, 0, SWP_FRAMECHANGED | SWP_NOZORDER | SWP_NOOWNERZORDER | SWP_NOACTIVATE | SWP_NOSIZE);
            } else {
                SetWindowPos(hWnd, NULL, 0, 0, 0, 0, SWP_FRAMECHANGED | SWP_NOMOVE | SWP_NOSIZE | SWP_NOZORDER | SWP_NOOWNERZORDER | SWP_NOACTIVATE);
            }
        }
    }
    return TRUE;
}

BOOL CALLBACK InitEnumWindowsProc(HWND hWnd, LPARAM lParam) {
    DWORD pid;
    GetWindowThreadProcessId(hWnd, &pid);
    // Subclass all relevant windows belonging to this process
    if (pid == GetCurrentProcessId()) {
        wchar_t className[256];
        GetClassName(hWnd, className, 256);
        if (wcsncmp(className, L"Chrome_WidgetWin_", 17) == 0) {
            if (WindhawkUtils::SetWindowSubclassFromAnyThread(hWnd, SubclassProc, 1)) {
                Wh_Log(L"Subclassed %p", hWnd);
                if (lParam == 1) {
                    UpdateEnumWindowsProc(hWnd, 0);
                }
            }
        }
    }
    return TRUE;
}

BOOL CALLBACK UninitEnumWindowsProc(HWND hWnd, LPARAM lParam) {
    DWORD pid;
    GetWindowThreadProcessId(hWnd, &pid);
    // Unsubclass all windows belonging to this process
    if (pid == GetCurrentProcessId()) {
        WindhawkUtils::RemoveWindowSubclassFromAnyThread(hWnd, SubclassProc);
        if (lParam == 1) {
            UpdateEnumWindowsProc(hWnd, 0);
        }
    }
    return TRUE;
}

// From https://windhawk.net/mods/visual-studio-anti-rich-header
std::string ReplaceAll(std::string str, const std::string& from, const std::string& to)
{
    size_t start_pos = 0;
    while ((start_pos = str.find(from, start_pos)) != std::string::npos) {
        str.replace(start_pos, from.length(), to);
        start_pos += to.length(); // Handles case where 'to' is a substring of 'from'
    }
    return str;
}

BOOL PatchMemory(char* pbExecutable, const std::string& targetRegex, const std::vector<uint8_t>& targetPatch, int expectedSection = -1, int maxMatch = -1) {
    IMAGE_DOS_HEADER* pDosHeader = (IMAGE_DOS_HEADER*)pbExecutable;
    IMAGE_NT_HEADERS* pNtHeader = (IMAGE_NT_HEADERS*)((char*)pDosHeader + pDosHeader->e_lfanew);
    IMAGE_SECTION_HEADER* pSectionHeader = (IMAGE_SECTION_HEADER*)((char*)&pNtHeader->OptionalHeader + pNtHeader->FileHeader.SizeOfOptionalHeader);

    std::regex regex(ReplaceAll(targetRegex, ".", R"([\s\S])"));
    std::match_results<std::string_view::const_iterator> match;
    bool foundAnyMatch = false;

    for (int i = 0; i < pNtHeader->FileHeader.NumberOfSections; ++i) {
        if (expectedSection != -1 && i != expectedSection) {
            continue;
        }

        char* from = pbExecutable + pSectionHeader[i].VirtualAddress;
        char* to = from + pSectionHeader[i].SizeOfRawData;

        std::string_view search(from, to - from);

        int matchCount = 0;

        while (std::regex_search(search.begin(), search.end(), match, regex)) {
            auto pos = from + match.position(0);

            Wh_Log(L"Match found in section %d at position: %p", i, pos);

            //Wh_Log(L"targetPatch.size(): %d", targetPatch.size());

            // #include <iomanip>
            // #include <sstream>
            // // Log the bytes before patching
            // std::string beforePatch(pos, targetPatch.size());
            // std::ostringstream hexStreamBefore;
            // for (size_t i = 0; i < targetPatch.size(); ++i) {
            //     hexStreamBefore << std::hex << std::setw(2) << std::setfill('0') << (int)(unsigned char)beforePatch[i] << " ";
            // }
            // std::string hexStreamStrBefore = hexStreamBefore.str();
            // std::wstring hexStreamWStrBefore(hexStreamStrBefore.begin(), hexStreamStrBefore.end());
            // Wh_Log(L"Hex bytes before patch: %s", hexStreamWStrBefore.c_str());

            DWORD dwOldProtect;
            if (VirtualProtect(pos, targetPatch.size(), PAGE_EXECUTE_READWRITE, &dwOldProtect)) {
                memcpy(pos, targetPatch.data(), targetPatch.size());
                VirtualProtect(pos, targetPatch.size(), dwOldProtect, &dwOldProtect);
                Wh_Log(L"Patch applied successfully.");

                // // Log the bytes after patching
                // std::string afterPatch(pos, targetPatch.size());
                // std::ostringstream hexStreamAfter;
                // for (size_t i = 0; i < targetPatch.size(); ++i) {
                //     hexStreamAfter << std::hex << std::setw(2) << std::setfill('0') << (int)(unsigned char)afterPatch[i] << " ";
                // }
                // std::string hexStreamStrAfter = hexStreamAfter.str();
                // std::wstring hexStreamWStrAfter(hexStreamStrAfter.begin(), hexStreamStrAfter.end());
                // Wh_Log(L"Hex bytes after patch: %s", hexStreamWStrAfter.c_str());

                foundAnyMatch = true;
            } else {
                Wh_Log(L"Failed to change memory protection.");
            }

            if (maxMatch != -1 && ++matchCount >= maxMatch) {
                break;
            }

            // Move the search start position to after the current match
            from = pos + targetPatch.size();
            search = std::string_view(from, to - from);
        }
    }

    if (!foundAnyMatch) {
        Wh_Log(L"No match found for the regex pattern.");
    }

    return foundAnyMatch;
}

BOOL EnableTransparentRendering(char* pbExecutable) {
    std::vector<uint8_t> targetPatch = {0xba, 0x00, 0x00, 0x00, 0x00, 0xff};

    // Use ButtonFace color if classic theme is used and frames are enabled
    if (!IsAppThemed() && !IsThemeActive() && cte_settings.showframe == TRUE) {
        DWORD btnFace = GetSysColor(COLOR_BTNFACE); // ButtonFace color
        targetPatch[1] = ((btnFace >> 16) & 0xFF);
        targetPatch[2] = ((btnFace >> 8) & 0xFF);
        targetPatch[3] = (btnFace & 0xFF);
        targetPatch[4] = 0xFF; // Opaque
    }

    #ifdef _WIN64
        std::string targetRegex = R"(\xba\x12\x12\x12\xff\xff)"; // mov edx, 0xff121212 (default background color)
    #else
        std::string targetRegex = R"(\x68\x12\x12\x12\xff\x8b)"; // push 0xff121212
        targetPatch[0] = 0x68;
        targetPatch[5] = 0x8b;
    #endif

    return PatchMemory(pbExecutable, targetRegex, targetPatch, 0, 4);
}

BOOL DisableForcedDarkMode(char* pbExecutable) {
    std::string targetRegex = R"(force-dark-mode)";
    std::string targetPatch = "some-invalidarg";
    std::vector<uint8_t> targetPatchBytes(targetPatch.begin(), targetPatch.end());
    return PatchMemory(pbExecutable, targetRegex, targetPatchBytes, 1, 1);
}

BOOL ForceEnableExtensions(char* pbExecutable) {
    std::string targetRegex = R"(disable-extensions)";
    std::string targetPatch = "enable-extensions!";
    std::vector<uint8_t> targetPatchBytes(targetPatch.begin(), targetPatch.end());
    return PatchMemory(pbExecutable, targetRegex, targetPatchBytes, 1, 1);
}

BOOL MarkCTEWHInJS(char* pbExecutable) {
    std::string targetRegex = R"(document.domain=\')";
    std::string targetPatch = "window.ctewh='0.6";
    std::vector<uint8_t> targetPatchBytes(targetPatch.begin(), targetPatch.end());
    return PatchMemory(pbExecutable, targetRegex, targetPatchBytes, 1, 1);
}

typedef int CEF_CALLBACK (*is_frameless_t)(struct _cef_window_delegate_t* self, struct _cef_window_t* window);
int CEF_CALLBACK is_frameless_hook(struct _cef_window_delegate_t* self, struct _cef_window_t* window) {
    Wh_Log(L"is_frameless_hook");
    return 0;
}

typedef cef_window_handle_t CEF_CALLBACK (*get_window_handle_t)(struct _cef_window_t* self);

typedef _cef_window_t* CEF_EXPORT (*cef_window_create_top_level_t)(void* delegate);
cef_window_create_top_level_t CEF_EXPORT cef_window_create_top_level_original;
_cef_window_t* CEF_EXPORT cef_window_create_top_level_hook(void* delegate) {
    Wh_Log(L"cef_window_create_top_level_hook");

    BOOL is_frameless_hooked = FALSE;
    if (is_frameless_offset != NULL && cte_settings.showframe == TRUE) {
        *((is_frameless_t*)((char*)delegate + is_frameless_offset)) = is_frameless_hook;
        is_frameless_hooked = TRUE;
    }
    _cef_window_t* window = cef_window_create_top_level_original(delegate);
    if (get_window_handle_offset != NULL) {
        get_window_handle_t get_window_handle = *((get_window_handle_t*)((char*)window + get_window_handle_offset));
        HWND hWnd = get_window_handle(window);
        WindhawkUtils::RemoveWindowSubclassFromAnyThread(hWnd, SubclassProc);
        if (WindhawkUtils::SetWindowSubclassFromAnyThread(hWnd, SubclassProc, is_frameless_hooked ? 2 : 1)) {
            Wh_Log(L"Subclassed %p", hWnd);
        }
        if (mainHwnd == NULL) {
            mainHwnd = hWnd;
        }
    } else {
        // Just subclass everything again if get_window_handle is not available
        // Calling functions from invalid offsets will crash the app for sure
        EnumWindows(UninitEnumWindowsProc, 0);
        EnumWindows(InitEnumWindowsProc, 1);
        Wh_Log(L"Avoided calling get_window_handle on an untested version");
    }
    return window;
}

typedef void CEF_CALLBACK (*set_background_color_t)(struct _cef_view_t* self, cef_color_t color);
set_background_color_t CEF_CALLBACK set_background_color_original;
void CEF_CALLBACK set_background_color_hook(struct _cef_view_t* self, cef_color_t color) {
    //Wh_Log(L"set_background_color_hook: %#x", color);
    // 0x87000000: normal, 0x3fffffff: hover, 0x33ffffff: active, 0xffc42b1c: close button hover, 0xff941320: close button active
    if (color == 0x87000000 && cte_settings.transparentcontrols == TRUE) {
        color = 0x00000000;
    }
    set_background_color_original(self, color);
    return;
}

struct cte_control_container {
    set_background_color_t CEF_CALLBACK set_background_color_original;
    set_background_color_t* CEF_CALLBACK set_background_color_addr;
} cte_controls[3];

int cnt = -1;

typedef void CEF_CALLBACK (*add_child_view_t)(struct _cef_panel_t* self, struct _cef_view_t* view);
add_child_view_t CEF_CALLBACK add_child_view_original;
void CEF_CALLBACK add_child_view_hook(struct _cef_panel_t* self, struct _cef_view_t* view) {
    cnt++;
    Wh_Log(L"add_child_view_hook: %d", cnt);
    // 0: Minimize, 1: Maximize, 2: Close, 3: Menu (removing this also prevents alt key from working)
    if (cnt < 3) {
      if (cte_settings.showcontrols == FALSE) {
        return;
      }
    } else if (cte_settings.showmenu == FALSE) {
      return;
    }
    if (cnt < 3 && set_background_color_offset != NULL) {
        set_background_color_original = *((set_background_color_t*)((char*)view + set_background_color_offset));
        *((set_background_color_t*)((char*)view + set_background_color_offset)) = set_background_color_hook;
        cte_controls[cnt].set_background_color_original = set_background_color_original;
        cte_controls[cnt].set_background_color_addr = (set_background_color_t*)((char*)view + set_background_color_offset);
    }
    add_child_view_original(self, view);
    return;
}

typedef _cef_panel_t* CEF_EXPORT (*cef_panel_create_t)(void* delegate);
cef_panel_create_t CEF_EXPORT cef_panel_create_original;
_cef_panel_t* CEF_EXPORT cef_panel_create_hook(void* delegate) {
    Wh_Log(L"cef_panel_create_hook");
    if ((cnt != 2 || cte_settings.showmenu == FALSE) && // left panel
        (cnt != -1 || cte_settings.showcontrols == FALSE) // right panel
    ) {
        // Nullify get_preferred_size to make the leftover space from hiding the window controls clickable
        // This has side effect of making the menu button ignore the height set by cosmos endpoint (used by noControls Spicetify extension)
        // So only nullify get_preferred_size for the left panel if menu button is hidden
        *((void**)((char*)delegate + get_preferred_size_offset)) = NULL;
    }
    _cef_panel_t* panel = cef_panel_create_original(delegate);
    if (add_child_view_offset != NULL) {
        add_child_view_original = *((add_child_view_t*)((char*)panel + add_child_view_offset));
        *((add_child_view_t*)((char*)panel + add_child_view_offset)) = add_child_view_hook;
    }
    return panel;
}

using CreateWindowExW_t = decltype(&CreateWindowExW);
CreateWindowExW_t CreateWindowExW_original;
HWND WINAPI CreateWindowExW_hook(DWORD dwExStyle, LPCWSTR lpClassName, LPCWSTR lpWindowName, DWORD dwStyle, int X, int Y, int nWidth, int nHeight, HWND hWndParent, HMENU hMenu, HINSTANCE hInstance, LPVOID lpParam) {
    Wh_Log(L"CreateWindowExW_hook");
    HWND hWnd = CreateWindowExW_original(dwExStyle, lpClassName, lpWindowName, dwStyle, X, Y, nWidth, nHeight, hWndParent, hMenu, hInstance, lpParam);
    if (hWnd != NULL) {
        wchar_t className[256];
        GetClassName(hWnd, className, 256);
        if (wcsncmp(className, L"Chrome_WidgetWin_", 17) == 0) { // Chrome_WidgetWin_1: with Chrome runtime, Chrome_WidgetWin_0: without Chrome runtime (Alloy) + some hidden windows
            if (dwStyle & WS_CAPTION) {
                // Subclass other Chromium/CEF windows, including those not created by cef_window_create_top_level (e.g. DevTools, Miniplayer (DocumentPictureInPicture), full Chromium browser UI that somehow can be opened, etc.)
                // But exclude windows without WS_CAPTION to prevent subclassing dropdowns, tooltips, etc.
                if (WindhawkUtils::SetWindowSubclassFromAnyThread(hWnd, SubclassProc, 0)) {
                    Wh_Log(L"Subclassed %p", hWnd);
                }
            }
        }
    }
    return hWnd;
}

using SetWindowThemeAttribute_t = decltype(&SetWindowThemeAttribute);
SetWindowThemeAttribute_t SetWindowThemeAttribute_original;
HRESULT WINAPI SetWindowThemeAttribute_hook(HWND hwnd, enum WINDOWTHEMEATTRIBUTETYPE eAttribute, PVOID pvAttribute, DWORD cbAttribute) {
    Wh_Log(L"SetWindowThemeAttribute_hook");
    if (eAttribute == WTA_NONCLIENT && is_frameless_offset != NULL && cte_settings.showframe == TRUE) {
        // Ignore this to make sure DWM window controls are visible
        return S_OK;
    } else {
        return SetWindowThemeAttribute_original(hwnd, eAttribute, pvAttribute, cbAttribute);
    }
}

using CreateProcessAsUserW_t = decltype(&CreateProcessAsUserW);
CreateProcessAsUserW_t CreateProcessAsUserW_original;
BOOL WINAPI CreateProcessAsUserW_hook(
    HANDLE hToken,
    LPCWSTR lpApplicationName,
    LPWSTR lpCommandLine,
    LPSECURITY_ATTRIBUTES lpProcessAttributes,
    LPSECURITY_ATTRIBUTES lpThreadAttributes,
    BOOL bInheritHandles,
    DWORD dwCreationFlags,
    LPVOID lpEnvironment,
    LPCWSTR lpCurrentDirectory,
    LPSTARTUPINFOW lpStartupInfo,
    LPPROCESS_INFORMATION lpProcessInformation
) {
    Wh_Log(L"CreateProcessAsUserW_hook");

    // BOOL result = CreateProcessAsUserW_original(
    //     NULL,
    //     lpApplicationName,
    //     lpCommandLine,
    //     lpProcessAttributes,
    //     lpThreadAttributes,
    //     bInheritHandles,
    //     dwCreationFlags,
    //     lpEnvironment,
    //     lpCurrentDirectory,
    //     lpStartupInfo,
    //     lpProcessInformation
    // );
    BOOL result = CreateProcessW(
        lpApplicationName,
        lpCommandLine,
        lpProcessAttributes,
        lpThreadAttributes,
        bInheritHandles,
        dwCreationFlags,
        lpEnvironment,
        lpCurrentDirectory,
        lpStartupInfo,
        lpProcessInformation
    );

    if (result && lpCommandLine && wcsstr(lpCommandLine, L"--type=gpu-process")) {
        hwAccelerated = TRUE;
        Wh_Log(L"GPU process detected, hardware acceleration enabled");
    }
    Wh_Log(L"lpCommandLine: %s", lpCommandLine);

    return result;
}

BOOL queryResponsePending = FALSE;

// WindhawkComm: Simple communication protocol between this mod and the Spotify JS
void HandleWindhawkComm(LPCWSTR clipText) {
    // /WH:ExtendFrame:<left>:<right>:<top>:<bottom>
    // Set DWM margins to extend frame into client area
    if (wcsncmp(clipText, L"/WH:ExtendFrame:", 16) == 0) {
        if (mainHwnd == NULL) {
            return;
        }
        if (!IsDwmEnabled()) {
            return;
        }
        int left, right, top, bottom;
        if (swscanf(clipText + 16, L"%d:%d:%d:%d", &left, &right, &top, &bottom) == 4) {
            MARGINS margins = {left, right, top, bottom};
            DwmExtendFrameIntoClientArea(mainHwnd, &margins);
        }
    // /WH:Minimize, /WH:MaximizeRestore, /WH:Close
    // Send respective window messages to the main window
    } else if (wcscmp(clipText, L"/WH:Minimize") == 0) {
        if (mainHwnd == NULL) {
            return;
        }
        ShowWindow(mainHwnd, SW_MINIMIZE);
    } else if (wcscmp(clipText, L"/WH:MaximizeRestore") == 0) {
        if (mainHwnd == NULL) {
            return;
        }
        ShowWindow(mainHwnd, IsZoomed(mainHwnd) ? SW_RESTORE : SW_MAXIMIZE);
    } else if (wcscmp(clipText, L"/WH:Close") == 0) {
        if (mainHwnd == NULL) {
            return;
        }
        PostMessage(mainHwnd, WM_CLOSE, 0, 0);
    // /WH:SetLayered:<layered (1/0)>:<alpha>:<optional-transparentColor>
    // Make the window layered with optional transparent color key
    } else if (wcsncmp(clipText, L"/WH:SetLayered:", 15) == 0) {
        if (mainHwnd == NULL) {
            return;
        }
        int layered, alpha, color;
        if (swscanf(clipText + 15, L"%d:%d:%x", &layered, &alpha, &color) == 3) {
            if (layered) {
                SetWindowLong(mainHwnd, GWL_EXSTYLE, GetWindowLong(mainHwnd, GWL_EXSTYLE) | WS_EX_LAYERED);
                SetLayeredWindowAttributes(mainHwnd, color, alpha, LWA_COLORKEY | LWA_ALPHA);
            } else {
                SetWindowLong(mainHwnd, GWL_EXSTYLE, GetWindowLong(mainHwnd, GWL_EXSTYLE) & ~WS_EX_LAYERED);
            }
        } else if (swscanf(clipText + 15, L"%d:%d", &layered, &alpha) == 2) {
            if (layered) {
                SetWindowLong(mainHwnd, GWL_EXSTYLE, GetWindowLong(mainHwnd, GWL_EXSTYLE) | WS_EX_LAYERED);
                SetLayeredWindowAttributes(mainHwnd, 0, alpha, LWA_ALPHA);
            } else {
                SetWindowLong(mainHwnd, GWL_EXSTYLE, GetWindowLong(mainHwnd, GWL_EXSTYLE) & ~WS_EX_LAYERED);
            }
        } else if (swscanf(clipText + 15, L"%d", &layered) == 1) {
            if (layered) {
                SetWindowLong(mainHwnd, GWL_EXSTYLE, GetWindowLong(mainHwnd, GWL_EXSTYLE) | WS_EX_LAYERED);
            } else {
                SetWindowLong(mainHwnd, GWL_EXSTYLE, GetWindowLong(mainHwnd, GWL_EXSTYLE) & ~WS_EX_LAYERED);
            }
        }
    // /WH:SetBackdrop:<mica|acrylic|tabbed>
    // Set the window backdrop type (Windows 11 only)
    } else if (wcsncmp(clipText, L"/WH:SetBackdrop:", 16) == 0) {
        if (mainHwnd == NULL) {
            return;
        }
        if (wcscmp(clipText + 16, L"mica") == 0) {
            BOOL value = TRUE;
            DwmSetWindowAttribute(mainHwnd, DWMWA_USE_HOSTBACKDROPBRUSH, &value, sizeof(value));
            DWM_SYSTEMBACKDROP_TYPE backdrop_type = DWMSBT_MAINWINDOW;
            DwmSetWindowAttribute(mainHwnd, DWMWA_SYSTEMBACKDROP_TYPE, &backdrop_type, sizeof(backdrop_type));
            dwmBackdropEnabled = TRUE;
        } else if (wcscmp(clipText + 16, L"acrylic") == 0) {
            BOOL value = TRUE;
            DwmSetWindowAttribute(mainHwnd, DWMWA_USE_HOSTBACKDROPBRUSH, &value, sizeof(value));
            DWM_SYSTEMBACKDROP_TYPE backdrop_type = DWMSBT_TRANSIENTWINDOW;
            DwmSetWindowAttribute(mainHwnd, DWMWA_SYSTEMBACKDROP_TYPE, &backdrop_type, sizeof(backdrop_type));
            dwmBackdropEnabled = TRUE;
        } else if (wcscmp(clipText + 16, L"tabbed") == 0) {
            BOOL value = TRUE;
            DwmSetWindowAttribute(mainHwnd, DWMWA_USE_HOSTBACKDROPBRUSH, &value, sizeof(value));
            DWM_SYSTEMBACKDROP_TYPE backdrop_type = DWMSBT_TABBEDWINDOW;
            DwmSetWindowAttribute(mainHwnd, DWMWA_SYSTEMBACKDROP_TYPE, &backdrop_type, sizeof(backdrop_type));
            dwmBackdropEnabled = TRUE;
        }
    // /WH:ResizeTo:<width>:<height>
    } else if (wcsncmp(clipText, L"/WH:ResizeTo:", 13) == 0) {
        if (mainHwnd == NULL) {
            return;
        }
        int width, height;
        if (swscanf(clipText + 13, L"%d:%d", &width, &height) == 2) {
            SetWindowPos(mainHwnd, NULL, 0, 0, width, height, SWP_NOMOVE | SWP_NOZORDER | SWP_NOOWNERZORDER | SWP_NOACTIVATE);
        }
    // /WH:SetMinSize:<width>:<height>
    } else if (wcsncmp(clipText, L"/WH:SetMinSize:", 15) == 0) {
        if (mainHwnd == NULL) {
            return;
        }
        int width, height;
        if (swscanf(clipText + 15, L"%d:%d", &width, &height) == 2) {
            minWidth = width;
            minHeight = height;
        }
    // /WH:Query
    // Following clipboard read will be responded with the settings JSON
    } else if (wcscmp(clipText, L"/WH:Query") == 0) {
        queryResponsePending = TRUE;
    }
}

using EmptyClipboard_t = decltype(&EmptyClipboard);
EmptyClipboard_t EmptyClipboard_original;
BOOL WINAPI EmptyClipboard_hook() {
    Wh_Log(L"EmptyClipboard_hook");
    // Just ignore this, as Chromium will call this function on every clipboard write
    // And empty clipboard will cause the navigator.clipboard.read() to return null
    return TRUE;
}

using SetClipboardData_t = decltype(&SetClipboardData);
SetClipboardData_t SetClipboardData_original;
HANDLE WINAPI SetClipboardData_hook(UINT uFormat, HANDLE hMem) {
    Wh_Log(L"SetClipboardData_hook: format=%u", uFormat);
    if (uFormat == CF_UNICODETEXT) {
        LPCWSTR clipboardText = (LPCWSTR)GlobalLock(hMem);
        if (clipboardText) {
            Wh_Log(L"Clipboard text: %s", clipboardText);
            GlobalUnlock(hMem);
            if (wcsncmp(clipboardText, L"/WH:", 4) == 0) {
                Wh_Log(L"Handling WindhawkComm");
                HandleWindhawkComm(clipboardText);
                return NULL;
            } else {
                EmptyClipboard_original();
            }
        }
    }
    return SetClipboardData_original(uFormat, hMem);
}

using GetClipboardData_t = decltype(&GetClipboardData);
GetClipboardData_t GetClipboardData_original;
HANDLE WINAPI GetClipboardData_hook(UINT uFormat) {
    Wh_Log(L"GetClipboardData_hook: format=%u", uFormat);
    if (uFormat == CF_UNICODETEXT) {
        Wh_Log(L"%s", queryResponsePending ? L"Query response pending" : L"Normal clipboard read");
        if (queryResponsePending) {
            queryResponsePending = FALSE;
            LPCWSTR response = L"{\
                \"type\":\"CTEWHQueryResponse\",\
                \"version\":0.6,\
                \"options\":{\
                    \"showframe\":%s,\
                    \"showframeonothers\":%s,\
                    \"showmenu\":%s,\
                    \"showcontrols\":%s,\
                    \"transparentcontrols\":%s,\
                    \"ignoreminsize\":%s,\
                    \"transparentrendering\":%s,\
                    \"noforceddarkmode\":%s,\
                    \"forceextensions\":%s\
                },\
                \"isOnTestedVersion\":%s,\
                \"supportedCommands\":[\"ExtendFrame\",\"Minimize\",\"MaximizeRestore\",\"Close\",\"SetLayered\",\"SetBackdrop\"],\
                \"isMaximized\":%s,\
                \"isMainWndLoaded\":%s,\
                \"isThemingEnabled\":%s,\
                \"isDwmEnabled\":%s\
            }";
            wchar_t responseBuffer[1024];
            swprintf(responseBuffer, 1024, response,
                cte_settings.showframe ? L"true" : L"false",
                cte_settings.showframeonothers ? L"true" : L"false",
                cte_settings.showmenu ? L"true" : L"false",
                cte_settings.showcontrols ? L"true" : L"false",
                cte_settings.transparentcontrols ? L"true" : L"false",
                cte_settings.ignoreminsize ? L"true" : L"false",
                cte_settings.transparentrendering ? L"true" : L"false",
                cte_settings.noforceddarkmode ? L"true" : L"false",
                cte_settings.forceextensions ? L"true" : L"false",
                get_window_handle_offset != NULL ? L"true" : L"false",
                mainHwnd != NULL ? IsZoomed(mainHwnd) ? L"true" : L"false" : L"false",
                mainHwnd != NULL ? L"true" : L"false",
                IsAppThemed() ? L"true" : L"false",
                IsDwmEnabled() ? L"true" : L"false"
            );
            HANDLE hMem = GlobalAlloc(GMEM_MOVEABLE, (wcslen(responseBuffer) + 1) * sizeof(wchar_t));
            if (hMem) {
                LPWSTR clipboardText = (LPWSTR)GlobalLock(hMem);
                if (clipboardText) {
                    wcscpy(clipboardText, responseBuffer);
                    GlobalUnlock(hMem);
                    return hMem;
                }
            }
        }
    }
    return GetClipboardData_original(uFormat);
}

typedef int (*cef_version_info_t)(int entry);

void LoadSettings() {
    cte_settings.showframe = Wh_GetIntSetting(L"showframe");
    cte_settings.showframeonothers = Wh_GetIntSetting(L"showframeonothers");
    cte_settings.showmenu = Wh_GetIntSetting(L"showmenu");
    cte_settings.showcontrols = Wh_GetIntSetting(L"showcontrols");
    cte_settings.transparentcontrols = Wh_GetIntSetting(L"transparentcontrols");
    cte_settings.ignoreminsize = Wh_GetIntSetting(L"ignoreminsize");
    cte_settings.transparentrendering = Wh_GetIntSetting(L"transparentrendering");
    cte_settings.noforceddarkmode = Wh_GetIntSetting(L"noforceddarkmode");
    cte_settings.forceextensions = Wh_GetIntSetting(L"forceextensions");
    cte_settings.allowuntested = Wh_GetIntSetting(L"allowuntested");
}

int FindOffset(int major, int minor, cte_offset_t offsets[], int offsets_size, BOOL allow_untested = TRUE) {
    int prev_major = offsets[0].ver_major;
    for (int i = 0; i < offsets_size; i++) {
        if (major <= offsets[i].ver_major && major >= prev_major) {
            if (offsets[i].ver_minor == ANY_MINOR ||
                (minor == offsets[i].ver_minor && major == offsets[i].ver_major) // mandate exact major match here
            ) {
                #ifdef _WIN64
                    return offsets[i].offset_x64;
                #else
                    return offsets[i].offset_x86;
                #endif
            }
        }
        prev_major = offsets[i].ver_major;
    }
    if (allow_untested && major >= offsets[offsets_size - 1].ver_major) {
        #ifdef _WIN64
            return offsets[offsets_size - 1].offset_x64;
        #else
            return offsets[offsets_size - 1].offset_x86;
        #endif
    }
    return NULL;
}

typedef struct _cef_string_utf16_t {
  char16_t* str;
  size_t length;
  void (*dtor)(char16_t* str);
} cef_string_utf16_t;

typedef cef_string_utf16_t cef_string_t;
typedef cef_string_utf16_t* cef_string_userfree_utf16_t;
typedef cef_string_userfree_utf16_t cef_string_userfree_t;

typedef struct _cef_v8value_t {
    void (*dtor)(struct _cef_v8value_t* self);
} cef_v8value_t;

typedef struct _cef_base_ref_counted_t {
  ///
  // Size of the data structure.
  ///
  size_t size;

  ///
  // Called to increment the reference count for the object. Should be called
  // for every new copy of a pointer to a given object.
  ///
  void(CEF_CALLBACK* add_ref)(struct _cef_base_ref_counted_t* self);

  ///
  // Called to decrement the reference count for the object. If the reference
  // count falls to 0 the object should self-delete. Returns true (1) if the
  // resulting reference count is 0.
  ///
  int(CEF_CALLBACK* release)(struct _cef_base_ref_counted_t* self);

  ///
  // Returns true (1) if the current reference count is 1.
  ///
  int(CEF_CALLBACK* has_one_ref)(struct _cef_base_ref_counted_t* self);

  ///
  // Returns true (1) if the current reference count is at least 1.
  ///
  int(CEF_CALLBACK* has_at_least_one_ref)(struct _cef_base_ref_counted_t* self);
} cef_base_ref_counted_t;

///
/// Structure that should be implemented to handle V8 function calls. The
/// functions of this structure will be called on the thread associated with the
/// V8 function.
///
typedef struct _cef_v8handler_t {
  ///
  /// Base structure.
  ///
  cef_base_ref_counted_t base;

  ///
  /// Handle execution of the function identified by |name|. |object| is the
  /// receiver ('this' object) of the function. |arguments| is the list of
  /// arguments passed to the function. If execution succeeds set |retval| to
  /// the function return value. If execution fails set |exception| to the
  /// exception that will be thrown. Return true (1) if execution was handled.
  ///
  int(CEF_CALLBACK* execute)(struct _cef_v8handler_t* self,
                             const cef_string_t* name,
                             struct _cef_v8value_t* object,
                             size_t argumentsCount,
                             struct _cef_v8value_t* const* arguments,
                             struct _cef_v8value_t** retval,
                             cef_string_t* exception);
} cef_v8handler_t;

typedef cef_v8value_t* (*cef_v8value_create_function_t)(const cef_string_t* name, cef_v8handler_t* handler);
cef_v8value_create_function_t cef_v8value_create_function_original;
cef_v8value_create_function_t cef_v8value_create_function_hook = [](const cef_string_t* name, cef_v8handler_t* handler) -> cef_v8value_t* {
    Wh_Log(L"cef_v8value_create_function called with name: %s", name->str);
    return cef_v8value_create_function_original(name, handler);
};

using UpdateProcThreadAttribute_t = decltype(&UpdateProcThreadAttribute);
UpdateProcThreadAttribute_t UpdateProcThreadAttribute_original;
BOOL WINAPI UpdateProcThreadAttribute_hook(
    LPPROC_THREAD_ATTRIBUTE_LIST lpAttributeList,
    DWORD dwFlags,
    DWORD_PTR Attribute,
    PVOID lpValue,
    SIZE_T cbSize,
    PVOID lpPreviousValue,
    PSIZE_T lpReturnSize
) {
    Wh_Log(L"UpdateProcThreadAttribute_hook called, ignoring.");
    return TRUE;
}

using SetProcessMitigationPolicy_t = decltype(&SetProcessMitigationPolicy);
SetProcessMitigationPolicy_t SetProcessMitigationPolicy_original;
BOOL WINAPI SetProcessMitigationPolicy_hook(
    PROCESS_MITIGATION_POLICY MitigationPolicy,
    PVOID lpBuffer,
    SIZE_T dwLength
) {
    Wh_Log(L"SetProcessMitigationPolicy_hook called, ignoring.");
    return TRUE;
}

using SetTokenInformation_t = decltype(&SetTokenInformation);
SetTokenInformation_t SetTokenInformation_original;
BOOL WINAPI SetTokenInformation_hook(HANDLE TokenHandle, TOKEN_INFORMATION_CLASS TokenInformationClass, LPVOID TokenInformation, DWORD TokenInformationLength) {
    Wh_Log(L"SetTokenInformation_hook called, ignoring.");
    return TRUE;
}

BOOL InitSpotifyRendererHooks(BOOL isInitialThread, char* pbExecutable, HMODULE cefModule) {
    Wh_Log(L"Initializing Spotify renderer hooks");
    Wh_SetFunctionHook((void*)SetTokenInformation, (void*)SetTokenInformation_hook, (void**)&SetTokenInformation_original);

    if (isInitialThread) {
        if (MarkCTEWHInJS((char*)GetModuleHandle(NULL))) {
            Wh_Log(L"Marked CTEWH in JS");
        }
    }

    cef_v8value_create_function_t cef_v8value_create_function =
        (cef_v8value_create_function_t)GetProcAddress(cefModule, "cef_v8value_create_function");
    Wh_SetFunctionHook((void*)cef_v8value_create_function, (void*)cef_v8value_create_function_hook,
                       (void**)&cef_v8value_create_function_original);

    return TRUE;
}

// The mod is being initialized, load settings, hook functions, and do other
// initialization stuff if required.
BOOL Wh_ModInit() {
    #ifdef _WIN64
        Wh_Log(L"Init - x86_64");
    #else
        Wh_Log(L"Init - x86");
    #endif

    LoadSettings();

    Wh_SetFunctionHook((void*)UpdateProcThreadAttribute, (void*)UpdateProcThreadAttribute_hook, (void**)&UpdateProcThreadAttribute_original);
    Wh_SetFunctionHook((void*)SetProcessMitigationPolicy, (void*)SetProcessMitigationPolicy_hook, (void**)&SetProcessMitigationPolicy_original);

    char* pbExecutable = (char*)GetModuleHandle(NULL);

    #ifdef _WIN64
        const size_t OFFSET_SAME_TEB_FLAGS = 0x17EE;
    #else
        const size_t OFFSET_SAME_TEB_FLAGS = 0x0FCA;
    #endif
    BOOL isInitialThread = *(USHORT*)((BYTE*)NtCurrentTeb() + OFFSET_SAME_TEB_FLAGS) & 0x0400;

    HMODULE cefModule = LoadLibrary(L"libcef.dll");
    if (!cefModule) {
        Wh_Log(L"Failed to load CEF!");
        return FALSE;
    }

    // Check if the app is Spotify
    wchar_t exeName[MAX_PATH];
    GetModuleFileName(NULL, exeName, MAX_PATH);
    BOOL isSpotify = wcsstr(_wcsupr(exeName), L"SPOTIFY.EXE") != NULL;
    if (isSpotify) {
        Wh_Log(L"Spotify detected");
    }

    // Check if this process is auxilliary process by checking if the arguments contain --type=
    LPWSTR args = GetCommandLineW();
    if (wcsstr(args, L"--type=") != NULL) {
        if (isSpotify && wcsstr(args, L"--type=renderer") != NULL) {
            return InitSpotifyRendererHooks(isInitialThread, pbExecutable, cefModule);
        }
        Wh_Log(L"Auxilliary process detected, skipping. (type=%s)", args + 7);
        return FALSE;
    }

    cef_window_create_top_level_t cef_window_create_top_level =
        (cef_window_create_top_level_t)GetProcAddress(cefModule,
                                                "cef_window_create_top_level");
    cef_panel_create_t cef_panel_create =
        (cef_panel_create_t)GetProcAddress(cefModule, "cef_panel_create");
    cef_version_info_t cef_version_info =
        (cef_version_info_t)GetProcAddress(cefModule, "cef_version_info");

    // Get CEF version
    int major = cef_version_info(0);
    int minor = cef_version_info(1);
    Wh_Log(L"CEF v%d.%d.%d.%d (Chromium v%d.%d.%d.%d) Loaded",
        major,
        minor,
        cef_version_info(2),
        cef_version_info(3),
        cef_version_info(4),
        cef_version_info(5),
        cef_version_info(6),
        cef_version_info(7)
    );

    // Get appropriate offsets for current CEF version
    is_frameless_offset = FindOffset(major, minor, is_frameless_offsets, ARRAYSIZE(is_frameless_offsets));
    Wh_Log(L"is_frameless offset: %#x", is_frameless_offset);
    get_window_handle_offset = FindOffset(major, minor, get_window_handle_offsets, ARRAYSIZE(get_window_handle_offsets), cte_settings.allowuntested);
    Wh_Log(L"get_window_handle offset: %#x", get_window_handle_offset);

    if (isSpotify) {
        add_child_view_offset = FindOffset(major, minor, add_child_view_offsets, ARRAYSIZE(add_child_view_offsets));
        Wh_Log(L"add_child_view offset: %#x", add_child_view_offset);
        set_background_color_offset = FindOffset(major, minor, set_background_color_offsets, ARRAYSIZE(set_background_color_offsets));
        Wh_Log(L"set_background_color offset: %#x", set_background_color_offset);
    }

    Wh_SetFunctionHook((void*)cef_window_create_top_level,
                       (void*)cef_window_create_top_level_hook,
                       (void**)&cef_window_create_top_level_original);
    Wh_SetFunctionHook((void*)CreateWindowExW, (void*)CreateWindowExW_hook,
                       (void**)&CreateWindowExW_original);
    if (isSpotify) {
        Wh_SetFunctionHook((void*)cef_panel_create, (void*)cef_panel_create_hook,
                           (void**)&cef_panel_create_original);
        Wh_SetFunctionHook((void*)SetWindowThemeAttribute, (void*)SetWindowThemeAttribute_hook,
                           (void**)&SetWindowThemeAttribute_original);
        Wh_SetFunctionHook((void*)EmptyClipboard, (void*)EmptyClipboard_hook,
                           (void**)&EmptyClipboard_original);
        Wh_SetFunctionHook((void*)SetClipboardData, (void*)SetClipboardData_hook,
                           (void**)&SetClipboardData_original);
        Wh_SetFunctionHook((void*)GetClipboardData, (void*)GetClipboardData_hook,
                           (void**)&GetClipboardData_original);
        Wh_SetFunctionHook((void*)CreateProcessAsUserW, (void*)CreateProcessAsUserW_hook,
                            (void**)&CreateProcessAsUserW_original);

        // Patch the executable in memory to enable transparent rendering, disable forced dark mode, or force enable extensions
        // (Only do this on process startup as patching after CEF initialization is pointless)
        if (isInitialThread) {
            if (cte_settings.transparentrendering) {
                if (EnableTransparentRendering(pbExecutable)) {
                    Wh_Log(L"Enabled transparent rendering");
                }
            }
            if (cte_settings.noforceddarkmode) {
                if (DisableForcedDarkMode(pbExecutable)) {
                    Wh_Log(L"Disabled forced dark mode");
                }
            }
            if (cte_settings.forceextensions) {
                if (ForceEnableExtensions(pbExecutable)) {
                    Wh_Log(L"Enabled extensions");
                }
            }
        }
    }

    EnumWindows(InitEnumWindowsProc, 1);
    return TRUE;
}

// The mod is being unloaded, free all allocated resources.
void Wh_ModUninit() {
    Wh_Log(L"Uninit");
    EnumWindows(UninitEnumWindowsProc, 1);

    // Restore the original set_background_color functions to prevent crashes
    // (Control colors hooks won't work till the app is restarted)
    for (int i = 0; i < 3; i++) {
        if (cte_controls[i].set_background_color_addr != NULL) {
            *((set_background_color_t*)cte_controls[i].set_background_color_addr) = cte_controls[i].set_background_color_original;
        }
    }
}

// The mod setting were changed, reload them.
void Wh_ModSettingsChanged() {
    BOOL prev_transparentcontrols = cte_settings.transparentcontrols;
    LoadSettings();
    EnumWindows(UpdateEnumWindowsProc, prev_transparentcontrols != cte_settings.transparentcontrols);
}
