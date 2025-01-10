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
## Important Notes (for now - Windhawk 1.5.1 and below)
* Replace `%PROGRAMDATA%` with `%ProgramData%` in `C:\Program Files\Windhawk\windhawk.ini` and `C:\Program Files\Windhawk\Engine\<version>\engine.ini` then restart Windhawk to get the renderer hook working
* Not needed in portable installations of Windhawk
* Run Spotify with `--no-sandbox` flag to get Windhawk logging working in the renderer process
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
* Notes for Spicetify extension/theme developers
    * Use `window.outerHeight - window.innerHeight > 0` to detect if the window has a native title bar
    * This mod exposes a JavaScript API that can be used to interact with the main window and this mod
    * The API is available with `window._getSpotifyModule('ctewh')`
    * Use `_getSpotifyModule('ctewh').query()` to get various information about the window and the mod
    * Use `_getSpotifyModule('ctewh').executeCommand('/WH:<command>')` to execute a command. See `HandleWindhawkComm` function below for available commands, or see [here](https://github.com/Ingan121/WMPotify/blob/master/theme/src/js/WindhawkComm.js) for a usage example
    * This API is only available on Spotify 1.2.4 and above, and only if the mod is enabled before Spotify starts
    * The API is disabled by default on untested CEF versions
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
  $description: Allows calling unsafe functions on untested CEF versions. May cause crashes or other issues. If disabled, an inefficient alternative method will be used on untested versions. JS API will also be disabled on untested versions
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
#include <codecvt>
#include <condition_variable>
#include <thread>
#include <mutex>
#include <vector>
#include <regex>
#include <aclapi.h>
#include <dwmapi.h>
#include <sddl.h>
#include <uxtheme.h>
#include <windows.h>

#define CEF_CALLBACK __stdcall
#define CEF_EXPORT __cdecl
#define cef_window_handle_t HWND
#define ANY_MINOR -1
#define PIPE_NAME L"\\\\.\\pipe\\CTEWH-IPC"

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

BOOL g_isSpotifyRenderer = FALSE;

HWND g_mainHwnd = NULL;
int g_minWidth = 0;
int g_minHeight = 0;
BOOL g_hwAccelerated = FALSE;
BOOL g_dwmBackdropEnabled = FALSE;

HANDLE g_hSrvPipe = INVALID_HANDLE_VALUE;
HANDLE g_hClientPipe = INVALID_HANDLE_VALUE;
BOOL g_shouldClosePipe = FALSE;
std::thread g_pipeThread;

std::condition_variable g_queryResponseCv;
std::mutex g_queryResponseMutex;
bool g_queryResponseReceived = false;

struct cte_queryResponse_t {
    BOOL success;
    BOOL isMaximized;
    BOOL isTopMost;
    BOOL isLayered;
    BOOL isThemingEnabled;
    BOOL isDwmEnabled;
    BOOL dwmBackdropEnabled;
    BOOL hwAccelerated;
    int minWidth;
    int minHeight;
} g_queryResponse;

#pragma region CEF structs (as minimal and cross-version compatible as possible)
typedef struct _cef_string_utf16_t {
  char16_t* str;
  size_t length;
  void (*dtor)(char16_t* str);
} cef_string_utf16_t;

typedef cef_string_utf16_t cef_string_t;
typedef cef_string_utf16_t* cef_string_userfree_utf16_t;
typedef cef_string_userfree_utf16_t cef_string_userfree_t;

typedef struct _cef_string_list_t* cef_string_list_t;

typedef uint32_t cef_color_t;

typedef struct _cef_base_ref_counted_t {
  size_t size;
  void(CEF_CALLBACK* add_ref)(struct _cef_base_ref_counted_t* self);
  int(CEF_CALLBACK* release)(struct _cef_base_ref_counted_t* self);
  int(CEF_CALLBACK* has_one_ref)(struct _cef_base_ref_counted_t* self);
  int(CEF_CALLBACK* has_at_least_one_ref)(struct _cef_base_ref_counted_t* self);
} cef_base_ref_counted_t;

typedef struct _cef_size_t {
  int width;
  int height;
} cef_size_t;

typedef struct _cef_view_delegate_t {
  cef_base_ref_counted_t base;
  cef_size_t(CEF_CALLBACK* get_preferred_size)(struct _cef_view_delegate_t* self);
} cef_view_delegate_t;

typedef struct _cef_panel_delegate_t {
  cef_view_delegate_t base;
} cef_panel_delegate_t;

typedef struct _cef_basetime_t {
  int64_t val;
} cef_basetime_t;

typedef enum {
  V8_PROPERTY_ATTRIBUTE_NONE = 0,
  V8_PROPERTY_ATTRIBUTE_READONLY = 1 << 0,
  V8_PROPERTY_ATTRIBUTE_DONTENUM = 1 << 1,
  V8_PROPERTY_ATTRIBUTE_DONTDELETE = 1 << 2
} cef_v8_propertyattribute_t;

typedef struct _cef_v8handler_t {
  cef_base_ref_counted_t base;
  int(CEF_CALLBACK* execute)(struct _cef_v8handler_t* self,
                             const cef_string_t* name,
                             struct _cef_v8value_t* object,
                             size_t argumentsCount,
                             struct _cef_v8value_t* const* arguments,
                             struct _cef_v8value_t** retval,
                             cef_string_t* exception);
} cef_v8handler_t;

// CEF 108+
typedef struct _cef_v8value_t {
    cef_base_ref_counted_t base;

    int(CEF_CALLBACK* is_valid)(struct _cef_v8value_t* self);
    int(CEF_CALLBACK* is_undefined)(struct _cef_v8value_t* self);
    int(CEF_CALLBACK* is_null)(struct _cef_v8value_t* self);
    int(CEF_CALLBACK* is_bool)(struct _cef_v8value_t* self);
    int(CEF_CALLBACK* is_int)(struct _cef_v8value_t* self);
    int(CEF_CALLBACK* is_uint)(struct _cef_v8value_t* self);
    int(CEF_CALLBACK* is_double)(struct _cef_v8value_t* self);
    int(CEF_CALLBACK* is_date)(struct _cef_v8value_t* self);
    int(CEF_CALLBACK* is_string)(struct _cef_v8value_t* self);
    int(CEF_CALLBACK* is_object)(struct _cef_v8value_t* self);
    int(CEF_CALLBACK* is_array)(struct _cef_v8value_t* self);
    int(CEF_CALLBACK* is_array_buffer)(struct _cef_v8value_t* self);
    int(CEF_CALLBACK* is_function)(struct _cef_v8value_t* self);
    int(CEF_CALLBACK* is_promise)(struct _cef_v8value_t* self);
    int(CEF_CALLBACK* is_same)(struct _cef_v8value_t* self, struct _cef_v8value_t* that);
    int(CEF_CALLBACK* get_bool_value)(struct _cef_v8value_t* self);
    int32_t(CEF_CALLBACK* get_int_value)(struct _cef_v8value_t* self);
    uint32_t(CEF_CALLBACK* get_uint_value)(struct _cef_v8value_t* self);
    double(CEF_CALLBACK* get_double_value)(struct _cef_v8value_t* self);
    cef_basetime_t(CEF_CALLBACK* get_date_value)(struct _cef_v8value_t* self);
    cef_string_userfree_t(CEF_CALLBACK* get_string_value)(struct _cef_v8value_t* self);
    int(CEF_CALLBACK* is_user_created)(struct _cef_v8value_t* self);
    int(CEF_CALLBACK* has_exception)(struct _cef_v8value_t* self);
    struct _cef_v8exception_t*(CEF_CALLBACK* get_exception)(struct _cef_v8value_t* self);
    int(CEF_CALLBACK* clear_exception)(struct _cef_v8value_t* self);
    int(CEF_CALLBACK* will_rethrow_exceptions)(struct _cef_v8value_t* self);
    int(CEF_CALLBACK* set_rethrow_exceptions)(struct _cef_v8value_t* self, int rethrow);
    int(CEF_CALLBACK* has_value_bykey)(struct _cef_v8value_t* self, const cef_string_t* key);
    int(CEF_CALLBACK* has_value_byindex)(struct _cef_v8value_t* self, int index);
    int(CEF_CALLBACK* delete_value_bykey)(struct _cef_v8value_t* self, const cef_string_t* key);
    int(CEF_CALLBACK* delete_value_byindex)(struct _cef_v8value_t* self, int index);
    struct _cef_v8value_t*(CEF_CALLBACK* get_value_bykey)(struct _cef_v8value_t* self, const cef_string_t* key);
    struct _cef_v8value_t*(CEF_CALLBACK* get_value_byindex)(struct _cef_v8value_t* self, int index);
    int(CEF_CALLBACK* set_value_bykey)(struct _cef_v8value_t* self, const cef_string_t* key, struct _cef_v8value_t* value, cef_v8_propertyattribute_t attribute);
    int(CEF_CALLBACK* set_value_byindex)(struct _cef_v8value_t* self, int index, struct _cef_v8value_t* value);
    // below here is updated quite recently (CEF 126), so it's avoided
} cef_v8value_t;
#pragma endregion

#pragma region "full cef_v8value_t in case it's needed later"
// typedef struct _cef_v8value_t {
//   ///
//   /// Base structure.
//   ///
//   cef_base_ref_counted_t base;

//   ///
//   /// Returns true (1) if the underlying handle is valid and it can be accessed
//   /// on the current thread. Do not call any other functions if this function
//   /// returns false (0).
//   ///
//   int(CEF_CALLBACK* is_valid)(struct _cef_v8value_t* self);

//   ///
//   /// True if the value type is undefined.
//   ///
//   int(CEF_CALLBACK* is_undefined)(struct _cef_v8value_t* self);

//   ///
//   /// True if the value type is null.
//   ///
//   int(CEF_CALLBACK* is_null)(struct _cef_v8value_t* self);

//   ///
//   /// True if the value type is bool.
//   ///
//   int(CEF_CALLBACK* is_bool)(struct _cef_v8value_t* self);

//   ///
//   /// True if the value type is int.
//   ///
//   int(CEF_CALLBACK* is_int)(struct _cef_v8value_t* self);

//   ///
//   /// True if the value type is unsigned int.
//   ///
//   int(CEF_CALLBACK* is_uint)(struct _cef_v8value_t* self);

//   ///
//   /// True if the value type is double.
//   ///
//   int(CEF_CALLBACK* is_double)(struct _cef_v8value_t* self);

//   ///
//   /// True if the value type is Date.
//   ///
//   int(CEF_CALLBACK* is_date)(struct _cef_v8value_t* self);

//   ///
//   /// True if the value type is string.
//   ///
//   int(CEF_CALLBACK* is_string)(struct _cef_v8value_t* self);

//   ///
//   /// True if the value type is object.
//   ///
//   int(CEF_CALLBACK* is_object)(struct _cef_v8value_t* self);

//   ///
//   /// True if the value type is array.
//   ///
//   int(CEF_CALLBACK* is_array)(struct _cef_v8value_t* self);

//   ///
//   /// True if the value type is an ArrayBuffer.
//   ///
//   int(CEF_CALLBACK* is_array_buffer)(struct _cef_v8value_t* self);

//   ///
//   /// True if the value type is function.
//   ///
//   int(CEF_CALLBACK* is_function)(struct _cef_v8value_t* self);

//   ///
//   /// True if the value type is a Promise.
//   ///
//   int(CEF_CALLBACK* is_promise)(struct _cef_v8value_t* self);

//   ///
//   /// Returns true (1) if this object is pointing to the same handle as |that|
//   /// object.
//   ///
//   int(CEF_CALLBACK* is_same)(struct _cef_v8value_t* self,
//                              struct _cef_v8value_t* that);

//   ///
//   /// Return a bool value.
//   ///
//   int(CEF_CALLBACK* get_bool_value)(struct _cef_v8value_t* self);

//   ///
//   /// Return an int value.
//   ///
//   int32_t(CEF_CALLBACK* get_int_value)(struct _cef_v8value_t* self);

//   ///
//   /// Return an unsigned int value.
//   ///
//   uint32_t(CEF_CALLBACK* get_uint_value)(struct _cef_v8value_t* self);

//   ///
//   /// Return a double value.
//   ///
//   double(CEF_CALLBACK* get_double_value)(struct _cef_v8value_t* self);

//   ///
//   /// Return a Date value.
//   ///
//   cef_basetime_t(CEF_CALLBACK* get_date_value)(struct _cef_v8value_t* self);

//   ///
//   /// Return a string value.
//   ///
//   // The resulting string must be freed by calling cef_string_userfree_free().
//   cef_string_userfree_t(CEF_CALLBACK* get_string_value)(
//       struct _cef_v8value_t* self);

//   ///
//   /// Returns true (1) if this is a user created object.
//   ///
//   int(CEF_CALLBACK* is_user_created)(struct _cef_v8value_t* self);

//   ///
//   /// Returns true (1) if the last function call resulted in an exception. This
//   /// attribute exists only in the scope of the current CEF value object.
//   ///
//   int(CEF_CALLBACK* has_exception)(struct _cef_v8value_t* self);

//   ///
//   /// Returns the exception resulting from the last function call. This
//   /// attribute exists only in the scope of the current CEF value object.
//   ///
//   struct _cef_v8exception_t*(CEF_CALLBACK* get_exception)(
//       struct _cef_v8value_t* self);

//   ///
//   /// Clears the last exception and returns true (1) on success.
//   ///
//   int(CEF_CALLBACK* clear_exception)(struct _cef_v8value_t* self);

//   ///
//   /// Returns true (1) if this object will re-throw future exceptions. This
//   /// attribute exists only in the scope of the current CEF value object.
//   ///
//   int(CEF_CALLBACK* will_rethrow_exceptions)(struct _cef_v8value_t* self);

//   ///
//   /// Set whether this object will re-throw future exceptions. By default
//   /// exceptions are not re-thrown. If a exception is re-thrown the current
//   /// context should not be accessed again until after the exception has been
//   /// caught and not re-thrown. Returns true (1) on success. This attribute
//   /// exists only in the scope of the current CEF value object.
//   ///
//   int(CEF_CALLBACK* set_rethrow_exceptions)(struct _cef_v8value_t* self,
//                                             int rethrow);

//   ///
//   /// Returns true (1) if the object has a value with the specified identifier.
//   ///
//   int(CEF_CALLBACK* has_value_bykey)(struct _cef_v8value_t* self,
//                                      const cef_string_t* key);

//   ///
//   /// Returns true (1) if the object has a value with the specified identifier.
//   ///
//   int(CEF_CALLBACK* has_value_byindex)(struct _cef_v8value_t* self, int index);

//   ///
//   /// Deletes the value with the specified identifier and returns true (1) on
//   /// success. Returns false (0) if this function is called incorrectly or an
//   /// exception is thrown. For read-only and don't-delete values this function
//   /// will return true (1) even though deletion failed.
//   ///
//   int(CEF_CALLBACK* delete_value_bykey)(struct _cef_v8value_t* self,
//                                         const cef_string_t* key);

//   ///
//   /// Deletes the value with the specified identifier and returns true (1) on
//   /// success. Returns false (0) if this function is called incorrectly,
//   /// deletion fails or an exception is thrown. For read-only and don't-delete
//   /// values this function will return true (1) even though deletion failed.
//   ///
//   int(CEF_CALLBACK* delete_value_byindex)(struct _cef_v8value_t* self,
//                                           int index);

//   ///
//   /// Returns the value with the specified identifier on success. Returns NULL
//   /// if this function is called incorrectly or an exception is thrown.
//   ///
//   struct _cef_v8value_t*(CEF_CALLBACK* get_value_bykey)(
//       struct _cef_v8value_t* self,
//       const cef_string_t* key);

//   ///
//   /// Returns the value with the specified identifier on success. Returns NULL
//   /// if this function is called incorrectly or an exception is thrown.
//   ///
//   struct _cef_v8value_t*(
//       CEF_CALLBACK* get_value_byindex)(struct _cef_v8value_t* self, int index);

//   ///
//   /// Associates a value with the specified identifier and returns true (1) on
//   /// success. Returns false (0) if this function is called incorrectly or an
//   /// exception is thrown. For read-only values this function will return true
//   /// (1) even though assignment failed.
//   ///
//   int(CEF_CALLBACK* set_value_bykey)(struct _cef_v8value_t* self,
//                                      const cef_string_t* key,
//                                      struct _cef_v8value_t* value,
//                                      cef_v8_propertyattribute_t attribute);

//   ///
//   /// Associates a value with the specified identifier and returns true (1) on
//   /// success. Returns false (0) if this function is called incorrectly or an
//   /// exception is thrown. For read-only values this function will return true
//   /// (1) even though assignment failed.
//   ///
//   int(CEF_CALLBACK* set_value_byindex)(struct _cef_v8value_t* self,
//                                        int index,
//                                        struct _cef_v8value_t* value);

//   ///
//   /// Registers an identifier and returns true (1) on success. Access to the
//   /// identifier will be forwarded to the cef_v8accessor_t instance passed to
//   /// cef_v8value_t::cef_v8value_create_object(). Returns false (0) if this
//   /// function is called incorrectly or an exception is thrown. For read-only
//   /// values this function will return true (1) even though assignment failed.
//   ///
//   int(CEF_CALLBACK* set_value_byaccessor)(struct _cef_v8value_t* self,
//                                           const cef_string_t* key,
//                                           cef_v8_propertyattribute_t attribute);

//   ///
//   /// Read the keys for the object's values into the specified vector. Integer-
//   /// based keys will also be returned as strings.
//   ///
//   int(CEF_CALLBACK* get_keys)(struct _cef_v8value_t* self,
//                               cef_string_list_t keys);

//   ///
//   /// Sets the user data for this object and returns true (1) on success.
//   /// Returns false (0) if this function is called incorrectly. This function
//   /// can only be called on user created objects.
//   ///
//   int(CEF_CALLBACK* set_user_data)(struct _cef_v8value_t* self,
//                                    struct _cef_base_ref_counted_t* user_data);

//   ///
//   /// Returns the user data, if any, assigned to this object.
//   ///
//   struct _cef_base_ref_counted_t*(CEF_CALLBACK* get_user_data)(
//       struct _cef_v8value_t* self);

//   ///
//   /// Returns the amount of externally allocated memory registered for the
//   /// object.
//   ///
//   int(CEF_CALLBACK* get_externally_allocated_memory)(
//       struct _cef_v8value_t* self);

//   ///
//   /// Adjusts the amount of registered external memory for the object. Used to
//   /// give V8 an indication of the amount of externally allocated memory that is
//   /// kept alive by JavaScript objects. V8 uses this information to decide when
//   /// to perform global garbage collection. Each cef_v8value_t tracks the amount
//   /// of external memory associated with it and automatically decreases the
//   /// global total by the appropriate amount on its destruction.
//   /// |change_in_bytes| specifies the number of bytes to adjust by. This
//   /// function returns the number of bytes associated with the object after the
//   /// adjustment. This function can only be called on user created objects.
//   ///
//   int(CEF_CALLBACK* adjust_externally_allocated_memory)(
//       struct _cef_v8value_t* self,
//       int change_in_bytes);

//   ///
//   /// Returns the number of elements in the array.
//   ///
//   int(CEF_CALLBACK* get_array_length)(struct _cef_v8value_t* self);

//   ///
//   /// Returns the ReleaseCallback object associated with the ArrayBuffer or NULL
//   /// if the ArrayBuffer was not created with CreateArrayBuffer.
//   ///
//   struct _cef_v8array_buffer_release_callback_t*(
//       CEF_CALLBACK* get_array_buffer_release_callback)(
//       struct _cef_v8value_t* self);

//   ///
//   /// Prevent the ArrayBuffer from using it's memory block by setting the length
//   /// to zero. This operation cannot be undone. If the ArrayBuffer was created
//   /// with CreateArrayBuffer then
//   /// cef_v8array_buffer_release_callback_t::ReleaseBuffer will be called to
//   /// release the underlying buffer.
//   ///
//   int(CEF_CALLBACK* neuter_array_buffer)(struct _cef_v8value_t* self);

//   ///
//   /// Returns the length (in bytes) of the ArrayBuffer.
//   ///
//   size_t(CEF_CALLBACK* get_array_buffer_byte_length)(
//       struct _cef_v8value_t* self);

//   ///
//   /// Returns a pointer to the beginning of the memory block for this
//   /// ArrayBuffer backing store. The returned pointer is valid as long as the
//   /// cef_v8value_t is alive.
//   ///
//   void*(CEF_CALLBACK* get_array_buffer_data)(struct _cef_v8value_t* self);

//   ///
//   /// Returns the function name.
//   ///
//   // The resulting string must be freed by calling cef_string_userfree_free().
//   cef_string_userfree_t(CEF_CALLBACK* get_function_name)(
//       struct _cef_v8value_t* self);

//   ///
//   /// Returns the function handler or NULL if not a CEF-created function.
//   ///
//   struct _cef_v8handler_t*(CEF_CALLBACK* get_function_handler)(
//       struct _cef_v8value_t* self);

//   ///
//   /// Execute the function using the current V8 context. This function should
//   /// only be called from within the scope of a cef_v8handler_t or
//   /// cef_v8accessor_t callback, or in combination with calling enter() and
//   /// exit() on a stored cef_v8context_t reference. |object| is the receiver
//   /// ('this' object) of the function. If |object| is NULL the current context's
//   /// global object will be used. |arguments| is the list of arguments that will
//   /// be passed to the function. Returns the function return value on success.
//   /// Returns NULL if this function is called incorrectly or an exception is
//   /// thrown.
//   ///
//   struct _cef_v8value_t*(CEF_CALLBACK* execute_function)(
//       struct _cef_v8value_t* self,
//       struct _cef_v8value_t* object,
//       size_t argumentsCount,
//       struct _cef_v8value_t* const* arguments);

//   ///
//   /// Execute the function using the specified V8 context. |object| is the
//   /// receiver ('this' object) of the function. If |object| is NULL the
//   /// specified context's global object will be used. |arguments| is the list of
//   /// arguments that will be passed to the function. Returns the function return
//   /// value on success. Returns NULL if this function is called incorrectly or
//   /// an exception is thrown.
//   ///
//   struct _cef_v8value_t*(CEF_CALLBACK* execute_function_with_context)(
//       struct _cef_v8value_t* self,
//       struct _cef_v8context_t* context,
//       struct _cef_v8value_t* object,
//       size_t argumentsCount,
//       struct _cef_v8value_t* const* arguments);

//   ///
//   /// Resolve the Promise using the current V8 context. This function should
//   /// only be called from within the scope of a cef_v8handler_t or
//   /// cef_v8accessor_t callback, or in combination with calling enter() and
//   /// exit() on a stored cef_v8context_t reference. |arg| is the argument passed
//   /// to the resolved promise. Returns true (1) on success. Returns false (0) if
//   /// this function is called incorrectly or an exception is thrown.
//   ///
//   int(CEF_CALLBACK* resolve_promise)(struct _cef_v8value_t* self,
//                                      struct _cef_v8value_t* arg);

//   ///
//   /// Reject the Promise using the current V8 context. This function should only
//   /// be called from within the scope of a cef_v8handler_t or cef_v8accessor_t
//   /// callback, or in combination with calling enter() and exit() on a stored
//   /// cef_v8context_t reference. Returns true (1) on success. Returns false (0)
//   /// if this function is called incorrectly or an exception is thrown.
//   ///
//   int(CEF_CALLBACK* reject_promise)(struct _cef_v8value_t* self,
//                                     const cef_string_t* errorMsg);
// } cef_v8value_t;

// ///
// /// Structure representing a V8 context handle. V8 handles can only be accessed
// /// from the thread on which they are created. Valid threads for creating a V8
// /// handle include the render process main thread (TID_RENDERER) and WebWorker
// /// threads. A task runner for posting tasks on the associated thread can be
// /// retrieved via the cef_v8context_t::get_task_runner() function.
// ///
// typedef struct _cef_v8context_t {
//   ///
//   /// Base structure.
//   ///
//   cef_base_ref_counted_t base;

//   ///
//   /// Returns the task runner associated with this context. V8 handles can only
//   /// be accessed from the thread on which they are created. This function can
//   /// be called on any render process thread.
//   ///
//   struct _cef_task_runner_t*(CEF_CALLBACK* get_task_runner)(
//       struct _cef_v8context_t* self);

//   ///
//   /// Returns true (1) if the underlying handle is valid and it can be accessed
//   /// on the current thread. Do not call any other functions if this function
//   /// returns false (0).
//   ///
//   int(CEF_CALLBACK* is_valid)(struct _cef_v8context_t* self);

//   ///
//   /// Returns the browser for this context. This function will return an NULL
//   /// reference for WebWorker contexts.
//   ///
//   struct _cef_browser_t*(CEF_CALLBACK* get_browser)(
//       struct _cef_v8context_t* self);

//   ///
//   /// Returns the frame for this context. This function will return an NULL
//   /// reference for WebWorker contexts.
//   ///
//   struct _cef_frame_t*(CEF_CALLBACK* get_frame)(struct _cef_v8context_t* self);

//   ///
//   /// Returns the global object for this context. The context must be entered
//   /// before calling this function.
//   ///
//   struct _cef_v8value_t*(CEF_CALLBACK* get_global)(
//       struct _cef_v8context_t* self);

//   ///
//   /// Enter this context. A context must be explicitly entered before creating a
//   /// V8 Object, Array, Function or Date asynchronously. exit() must be called
//   /// the same number of times as enter() before releasing this context. V8
//   /// objects belong to the context in which they are created. Returns true (1)
//   /// if the scope was entered successfully.
//   ///
//   int(CEF_CALLBACK* enter)(struct _cef_v8context_t* self);

//   ///
//   /// Exit this context. Call this function only after calling enter(). Returns
//   /// true (1) if the scope was exited successfully.
//   ///
//   int(CEF_CALLBACK* exit)(struct _cef_v8context_t* self);

//   ///
//   /// Returns true (1) if this object is pointing to the same handle as |that|
//   /// object.
//   ///
//   int(CEF_CALLBACK* is_same)(struct _cef_v8context_t* self,
//                              struct _cef_v8context_t* that);

//   ///
//   /// Execute a string of JavaScript code in this V8 context. The |script_url|
//   /// parameter is the URL where the script in question can be found, if any.
//   /// The |start_line| parameter is the base line number to use for error
//   /// reporting. On success |retval| will be set to the return value, if any,
//   /// and the function will return true (1). On failure |exception| will be set
//   /// to the exception, if any, and the function will return false (0).
//   ///
//   int(CEF_CALLBACK* eval)(struct _cef_v8context_t* self,
//                           const cef_string_t* code,
//                           const cef_string_t* script_url,
//                           int start_line,
//                           struct _cef_v8value_t** retval,
//                           struct _cef_v8exception_t** exception);
// } cef_v8context_t;
#pragma endregion

#pragma region CEF V8 functions + helpers
typedef int CEF_CALLBACK (*v8func_exec_t)(cef_v8handler_t* self, const cef_string_t* name, cef_v8value_t* object, size_t argumentsCount, cef_v8value_t* const* arguments, cef_v8value_t** retval, cef_string_t* exception);
v8func_exec_t CEF_CALLBACK _getSpotifyModule_original;

typedef cef_v8value_t* CEF_EXPORT (*cef_v8value_create_function_t)(const cef_string_t* name, cef_v8handler_t* handler);
cef_v8value_create_function_t CEF_EXPORT cef_v8value_create_function_original;

typedef cef_v8value_t* CEF_EXPORT (*cef_v8value_create_bool_t)(int value);
cef_v8value_create_bool_t cef_v8value_create_bool;

typedef cef_v8value_t* CEF_EXPORT (*cef_v8value_create_int_t)(int value);
cef_v8value_create_int_t cef_v8value_create_int;

typedef cef_v8value_t* CEF_EXPORT (*cef_v8value_create_string_t)(const cef_string_t* value);
cef_v8value_create_string_t cef_v8value_create_string;

typedef cef_v8value_t* CEF_EXPORT (*cef_v8value_create_object_t)(void* accessor, void* interceptor);
cef_v8value_create_object_t cef_v8value_create_object;

typedef cef_v8value_t* CEF_EXPORT (*cef_v8value_create_array_t)(int length);
cef_v8value_create_array_t cef_v8value_create_array;

typedef int (*cef_version_info_t)(int entry);

std::u16string to_u16string(int const &i) {
  std::wstring_convert<std::codecvt_utf8_utf16<char16_t, 0x10ffff, std::little_endian>, char16_t> conv;
  return conv.from_bytes(std::to_string(i));
}

cef_string_t* GenerateCefString(std::u16string str) {
    cef_string_t* cefStr = (cef_string_t*)calloc(1, sizeof(cef_string_t));
    cefStr->str = (char16_t*)calloc(str.size() + 1, sizeof(char16_t));
    cefStr->length = str.size();
    memcpy(cefStr->str, str.c_str(), str.size() * sizeof(char16_t));
    return cefStr;
}
#pragma endregion

void CreateNamedPipeServer();

// Whether DwmExtendFrameIntoClientArea should be called
// False if DWM is disabled, visual styles are disabled, or some kind of basic themer is used
BOOL IsDwmEnabled() {
    if (!IsAppThemed() && !IsThemeActive()) {
        return FALSE;
    }
    BOOL dwmEnabled = FALSE;
    DwmIsCompositionEnabled(&dwmEnabled);
    BOOL dwmFrameEnabled = FALSE;
    if (dwmEnabled && g_mainHwnd != NULL) {
        HRESULT hr = DwmGetWindowAttribute(g_mainHwnd, DWMWA_NCRENDERING_ENABLED, &dwmFrameEnabled, sizeof(dwmFrameEnabled));
        if (!SUCCEEDED(hr)) {
            return dwmEnabled;
        }
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
            if (g_dwmBackdropEnabled) {
                // Fix MicaForEveryone not working well with native frames
                return DefWindowProc(hWnd, uMsg, wParam, lParam);
            }
            break;
        case WM_NCPAINT:
            if (hWnd == g_mainHwnd && g_hwAccelerated && cte_settings.transparentrendering && !cte_settings.showframe && !IsDwmEnabled()) {
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
                mmi->ptMinTrackSize.x = g_minWidth;
                mmi->ptMinTrackSize.y = g_minHeight;
                return 0;
            }
            break;
        case WM_PAINT:
            if (hWnd == g_mainHwnd && g_hwAccelerated && cte_settings.transparentrendering && !cte_settings.showframe) {
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

#pragma region Memory patches
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
#pragma endregion

#pragma region CEF hooks
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
            if (g_hwAccelerated && cte_settings.transparentrendering) {
                InvalidateRect(hWnd, NULL, TRUE);
            }
        }
        if (g_mainHwnd == NULL) {
            g_pipeThread = std::thread([=]() {
                CreateNamedPipeServer();
            });
            g_pipeThread.detach();
            g_mainHwnd = hWnd;
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

typedef _cef_panel_t* CEF_EXPORT (*cef_panel_create_t)(cef_panel_delegate_t* delegate);
cef_panel_create_t CEF_EXPORT cef_panel_create_original;
_cef_panel_t* CEF_EXPORT cef_panel_create_hook(cef_panel_delegate_t* delegate) {
    Wh_Log(L"cef_panel_create_hook");
    if ((cnt != 2 || cte_settings.showmenu == FALSE) && // left panel
        (cnt != -1 || cte_settings.showcontrols == FALSE) // right panel
    ) {
        // Nullify get_preferred_size to make the leftover space from hiding the window controls clickable
        // This has side effect of making the menu button ignore the height set by cosmos endpoint (used by noControls Spicetify extension)
        // So only nullify get_preferred_size for the left panel if menu button is hidden
        delegate->base.get_preferred_size = NULL;
    }
    _cef_panel_t* panel = cef_panel_create_original(delegate);
    if (add_child_view_offset != NULL) {
        add_child_view_original = *((add_child_view_t*)((char*)panel + add_child_view_offset));
        *((add_child_view_t*)((char*)panel + add_child_view_offset)) = add_child_view_hook;
    }
    return panel;
}
#pragma endregion

#pragma region Win32 API hooks
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


// renderer and gpu process spawn with this when --no-sandbox is used
using CreateProcessW_t = decltype(&CreateProcessW);
CreateProcessW_t CreateProcessW_original;
BOOL WINAPI CreateProcessW_hook(
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
    Wh_Log(L"CreateProcessW_hook");

    BOOL result = CreateProcessW_original(
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
        g_hwAccelerated = TRUE;
        Wh_Log(L"GPU process detected, hardware acceleration enabled");
    }
    Wh_Log(L"lpCommandLine: %s", lpCommandLine);

    return result;
}

// renderer and gpu process spawn with this when sandbox is enabled
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

    BOOL result = CreateProcessAsUserW_original(
        hToken,
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
        g_hwAccelerated = TRUE;
        Wh_Log(L"GPU process detected, hardware acceleration enabled");
    }
    Wh_Log(L"lpCommandLine: %s", lpCommandLine);

    return result;
}
#pragma endregion

#pragma region Renderer JS API injection + IPC
void HandleWindhawkComm(LPCWSTR clipText) {
    if (g_mainHwnd == NULL) {
        return;
    }
    Wh_Log(L"HandleWindhawkComm: %s, len: %d, size: %d", clipText, wcslen(clipText), sizeof(clipText));
    // /WH:ExtendFrame:<left>:<right>:<top>:<bottom>
    // Set DWM margins to extend frame into client area
    if (wcsncmp(clipText, L"/WH:ExtendFrame:", 16) == 0) {
        if (!IsDwmEnabled()) {
            return;
        }
        int left, right, top, bottom;
        if (swscanf(clipText + 16, L"%d:%d:%d:%d", &left, &right, &top, &bottom) == 4) {
            MARGINS margins = {left, right, top, bottom};
            DwmExtendFrameIntoClientArea(g_mainHwnd, &margins);
        }
    // /WH:Minimize, /WH:MaximizeRestore, /WH:Close
    // Send respective window messages to the main window
    } else if (wcscmp(clipText, L"/WH:Minimize") == 0) {
        ShowWindow(g_mainHwnd, SW_MINIMIZE);
    } else if (wcscmp(clipText, L"/WH:MaximizeRestore") == 0) {
        ShowWindow(g_mainHwnd, IsZoomed(g_mainHwnd) ? SW_RESTORE : SW_MAXIMIZE);
    } else if (wcscmp(clipText, L"/WH:Close") == 0) {
        PostMessage(g_mainHwnd, WM_CLOSE, 0, 0);
    // /WH:SetLayered:<layered (1/0)>:<alpha>:<optional-transparentColor>
    // Make the window layered with optional transparent color key
    } else if (wcsncmp(clipText, L"/WH:SetLayered:", 15) == 0) {
        int layered, alpha, color;
        if (swscanf(clipText + 15, L"%d:%d:%x", &layered, &alpha, &color) == 3) {
            if (layered) {
                SetWindowLong(g_mainHwnd, GWL_EXSTYLE, GetWindowLong(g_mainHwnd, GWL_EXSTYLE) | WS_EX_LAYERED);
                SetLayeredWindowAttributes(g_mainHwnd, color, alpha, LWA_COLORKEY | LWA_ALPHA);
            } else {
                SetWindowLong(g_mainHwnd, GWL_EXSTYLE, GetWindowLong(g_mainHwnd, GWL_EXSTYLE) & ~WS_EX_LAYERED);
            }
        } else if (swscanf(clipText + 15, L"%d:%d", &layered, &alpha) == 2) {
            if (layered) {
                SetWindowLong(g_mainHwnd, GWL_EXSTYLE, GetWindowLong(g_mainHwnd, GWL_EXSTYLE) | WS_EX_LAYERED);
                SetLayeredWindowAttributes(g_mainHwnd, 0, alpha, LWA_ALPHA);
            } else {
                SetWindowLong(g_mainHwnd, GWL_EXSTYLE, GetWindowLong(g_mainHwnd, GWL_EXSTYLE) & ~WS_EX_LAYERED);
            }
        } else if (swscanf(clipText + 15, L"%d", &layered) == 1) {
            if (layered) {
                SetWindowLong(g_mainHwnd, GWL_EXSTYLE, GetWindowLong(g_mainHwnd, GWL_EXSTYLE) | WS_EX_LAYERED);
            } else {
                SetWindowLong(g_mainHwnd, GWL_EXSTYLE, GetWindowLong(g_mainHwnd, GWL_EXSTYLE) & ~WS_EX_LAYERED);
            }
        }
    // /WH:SetBackdrop:<mica|acrylic|tabbed>
    // Set the window backdrop type (Windows 11 only)
    } else if (wcsncmp(clipText, L"/WH:SetBackdrop:", 16) == 0) {
        if (wcscmp(clipText + 16, L"mica") == 0) {
            BOOL value = TRUE;
            DwmSetWindowAttribute(g_mainHwnd, DWMWA_USE_HOSTBACKDROPBRUSH, &value, sizeof(value));
            DWM_SYSTEMBACKDROP_TYPE backdrop_type = DWMSBT_MAINWINDOW;
            DwmSetWindowAttribute(g_mainHwnd, DWMWA_SYSTEMBACKDROP_TYPE, &backdrop_type, sizeof(backdrop_type));
            g_dwmBackdropEnabled = TRUE;
        } else if (wcscmp(clipText + 16, L"acrylic") == 0) {
            BOOL value = TRUE;
            DwmSetWindowAttribute(g_mainHwnd, DWMWA_USE_HOSTBACKDROPBRUSH, &value, sizeof(value));
            DWM_SYSTEMBACKDROP_TYPE backdrop_type = DWMSBT_TRANSIENTWINDOW;
            DwmSetWindowAttribute(g_mainHwnd, DWMWA_SYSTEMBACKDROP_TYPE, &backdrop_type, sizeof(backdrop_type));
            g_dwmBackdropEnabled = TRUE;
        } else if (wcscmp(clipText + 16, L"tabbed") == 0) {
            BOOL value = TRUE;
            DwmSetWindowAttribute(g_mainHwnd, DWMWA_USE_HOSTBACKDROPBRUSH, &value, sizeof(value));
            DWM_SYSTEMBACKDROP_TYPE backdrop_type = DWMSBT_TABBEDWINDOW;
            DwmSetWindowAttribute(g_mainHwnd, DWMWA_SYSTEMBACKDROP_TYPE, &backdrop_type, sizeof(backdrop_type));
            g_dwmBackdropEnabled = TRUE;
        }
    // /WH:ResizeTo:<width>:<height>
    } else if (wcsncmp(clipText, L"/WH:ResizeTo:", 13) == 0) {
        int width, height;
        if (swscanf(clipText + 13, L"%d:%d", &width, &height) == 2) {
            SetWindowPos(g_mainHwnd, NULL, 0, 0, width, height, SWP_NOMOVE | SWP_NOZORDER | SWP_NOOWNERZORDER | SWP_NOACTIVATE);
        }
    // /WH:SetMinSize:<width>:<height>
    } else if (wcsncmp(clipText, L"/WH:SetMinSize:", 15) == 0) {
        int width, height;
        if (swscanf(clipText + 15, L"%d:%d", &width, &height) == 2) {
            g_minWidth = width;
            g_minHeight = height;
        }
    // /WH:SetTopMost:<topmost (1/0), toggle if absent>
    } else if (wcsncmp(clipText, L"/WH:SetTopMost:", 15) == 0) {
        int topmost;
        if (swscanf(clipText + 15, L"%d", &topmost) == 1) {
            SetWindowPos(g_mainHwnd, topmost ? HWND_TOPMOST : HWND_NOTOPMOST, 0, 0, 0, 0, SWP_NOMOVE | SWP_NOSIZE | SWP_NOACTIVATE);
        } else {
            SetWindowPos(g_mainHwnd, GetWindowLong(g_mainHwnd, GWL_EXSTYLE) & WS_EX_TOPMOST ? HWND_NOTOPMOST : HWND_TOPMOST, 0, 0, 0, 0, SWP_NOMOVE | SWP_NOSIZE | SWP_NOACTIVATE);
        }
    // /WH:Query
    // Following clipboard read will be responded with the settings JSON
    } else if (wcscmp(clipText, L"/WH:Query") == 0) {
        if (g_hSrvPipe == INVALID_HANDLE_VALUE) {
            return;
        }
        wchar_t queryResponse[256];
        // <showframe:showframeonothers:showmenu:showcontrols:transparentcontrols:transparentrendering:ignoreminsize:isMaximized:isTopMost:isLayered:isThemingEnabled:isDwmEnabled:dwmBackdropEnabled:hwAccelerated:minWidth:minHeight>
        swprintf(queryResponse, 256, L"/WH:QueryResponse:%d:%d:%d:%d:%d:%d:%d:%d:%d:%d:%d:%d:%d:%d:%d:%d",
            cte_settings.showframe,
            cte_settings.showframeonothers,
            cte_settings.showmenu,
            cte_settings.showcontrols,
            cte_settings.transparentcontrols,
            cte_settings.transparentrendering,
            cte_settings.ignoreminsize,
            IsZoomed(g_mainHwnd),
            GetWindowLong(g_mainHwnd, GWL_EXSTYLE) & WS_EX_TOPMOST,
            GetWindowLong(g_mainHwnd, GWL_EXSTYLE) & WS_EX_LAYERED,
            IsAppThemed() && IsThemeActive(),
            IsDwmEnabled(),
            g_dwmBackdropEnabled,
            g_hwAccelerated,
            g_minWidth,
            g_minHeight
        );
        DWORD bytesWritten;
        WriteFile(g_hSrvPipe, queryResponse, wcslen(queryResponse) * sizeof(wchar_t), &bytesWritten, NULL);
    }
}

// Copy-pasted from https://source.chromium.org/chromium/chromium/src/+/main:third_party/crashpad/crashpad/util/win/registration_protocol_win.cc;drc=f39c57f31413abcb41d3068cfb2c7a1718003cc5;l=253
// Same logic as in crashpad to allow processes with untrusted integrity level to connect to the named pipe
void* GetSecurityDescriptorWithUser(const wchar_t* sddl_string, size_t* size) {
    if (size)
        *size = 0;

    PSECURITY_DESCRIPTOR base_sec_desc;
    if (!ConvertStringSecurityDescriptorToSecurityDescriptor(
            sddl_string, SDDL_REVISION_1, &base_sec_desc, nullptr)) {
        Wh_Log(L"ConvertStringSecurityDescriptorToSecurityDescriptor failed");
        return nullptr;
    }

    EXPLICIT_ACCESS access;
    wchar_t username[] = L"CURRENT_USER";
    BuildExplicitAccessWithName(
        &access, username, GENERIC_ALL, GRANT_ACCESS, NO_INHERITANCE);

    PSECURITY_DESCRIPTOR user_sec_desc;
    ULONG user_sec_desc_size;
    DWORD error = BuildSecurityDescriptor(nullptr,
                                          nullptr,
                                          1,
                                          &access,
                                          0,
                                          nullptr,
                                          base_sec_desc,
                                          &user_sec_desc_size,
                                          &user_sec_desc);
    if (error != ERROR_SUCCESS) {
        SetLastError(error);
        Wh_Log(L"BuildSecurityDescriptor failed");
        return nullptr;
    }

    *size = user_sec_desc_size;
    return user_sec_desc;
}

const void* GetSecurityDescriptorForNamedPipeInstance(size_t* size) {
    // Get a security descriptor which grants the current user and SYSTEM full
    // access to the named pipe. Also grant AppContainer RW access through the ALL
    // APPLICATION PACKAGES SID (S-1-15-2-1). Finally add an Untrusted Mandatory
    // Label for non-AppContainer sandboxed users.
    static size_t sd_size;
    static void* sec_desc = GetSecurityDescriptorWithUser(
        L"D:(A;;GA;;;SY)(A;;GWGR;;;S-1-15-2-1)(A;;GA;;;LW)S:(ML;;;;;S-1-16-0)", &sd_size);

    if (size)
        *size = sd_size;
    return sec_desc;
}

void CreateNamedPipeServer() {
    void* pSecurityDescriptor = const_cast<void*>(GetSecurityDescriptorForNamedPipeInstance(NULL));
    if (!pSecurityDescriptor) {
        Wh_Log(L"GetSecurityDescriptorForNamedPipeInstance failed. Pipe won't be accessible to sandboxed CEF renderers.");
    }

    SECURITY_ATTRIBUTES securityAttributes = {};
    securityAttributes.nLength = sizeof(SECURITY_ATTRIBUTES);
    securityAttributes.lpSecurityDescriptor = pSecurityDescriptor;
    securityAttributes.bInheritHandle = TRUE;

    while (!g_shouldClosePipe) {
        g_hSrvPipe = CreateNamedPipe(
            PIPE_NAME,                                       // Pipe name
            PIPE_ACCESS_DUPLEX | FILE_FLAG_OVERLAPPED,       // Read/Write access with overlapped I/O
            PIPE_TYPE_MESSAGE |                              // Message type pipe
            PIPE_READMODE_MESSAGE |                          // Message-read mode
            PIPE_WAIT,                                       // Blocking mode
            PIPE_UNLIMITED_INSTANCES,                        // Max instances
            512,                                             // Output buffer size
            512,                                             // Input buffer size
            0,                                               // Client time-out
            pSecurityDescriptor ? &securityAttributes : NULL // Security attributes
        );

        if (g_hSrvPipe == INVALID_HANDLE_VALUE) {
            Wh_Log(L"CreateNamedPipe failed, GLE=%d", GetLastError());
            return;
        }

        Wh_Log(L"Waiting for client to connect...");
        BOOL connected = ConnectNamedPipe(g_hSrvPipe, NULL) ? TRUE : (GetLastError() == ERROR_PIPE_CONNECTED);

        if (connected) {
            Wh_Log(L"Client connected, waiting for message...");
            wchar_t buffer[512];
            DWORD bytesRead;
            while (!g_shouldClosePipe) {
                BOOL result = ReadFile(g_hSrvPipe, buffer, sizeof(buffer) - sizeof(wchar_t), &bytesRead, NULL);
                if (result) {
                    buffer[bytesRead / sizeof(wchar_t)] = L'\0';
                    Wh_Log(L"Received message: %s", buffer);
                    HandleWindhawkComm(buffer);
                }
            }
        } else {
            Wh_Log(L"ConnectNamedPipe failed, GLE=%d", GetLastError());
        }

        Wh_Log(L"Closing pipe...");
        CloseHandle(g_hSrvPipe);
        g_hSrvPipe = INVALID_HANDLE_VALUE;
    }

    LocalFree(pSecurityDescriptor);
}

int ConnectToNamedPipe(LPCWSTR pipeName) {
    Wh_Log(L"Pipe name: %s", pipeName);

    g_hClientPipe = CreateFile(
        pipeName,
        GENERIC_READ | GENERIC_WRITE,
        0,
        NULL,
        OPEN_EXISTING,
        FILE_FLAG_OVERLAPPED,
        NULL
    );

    if (g_hClientPipe == INVALID_HANDLE_VALUE) {
        int gle = GetLastError();
        Wh_Log(L"CreateFile failed, GLE=%d", gle);
        return gle;
    }

    g_pipeThread = std::thread([]() {
        wchar_t buffer[512];
        DWORD bytesRead;
        OVERLAPPED overlapped = {};
        overlapped.hEvent = CreateEvent(NULL, TRUE, FALSE, NULL);
        if (!overlapped.hEvent) {
            Wh_Log(L"CreateEvent failed, GLE=%d", GetLastError());
            return;
        }

        while (!g_shouldClosePipe) {
            BOOL result = ReadFile(g_hClientPipe, buffer, sizeof(buffer) - sizeof(wchar_t), &bytesRead, &overlapped);
            if (!result && GetLastError() == ERROR_IO_PENDING) {
                DWORD waitResult = WaitForSingleObject(overlapped.hEvent, INFINITE);
                if (waitResult == WAIT_OBJECT_0) {
                    if (GetOverlappedResult(g_hClientPipe, &overlapped, &bytesRead, FALSE)) {
                        buffer[bytesRead / sizeof(wchar_t)] = L'\0';
                        Wh_Log(L"Received message: %s", buffer);
                        if (wcsncmp(buffer, L"/WH:QueryResponse:", 18) == 0) {
                            int showframe, showframeonothers, showmenu, showcontrols, transparentcontrols, transparentrendering, ignoreminsize, isMaximized, isTopMost, isLayered, isThemingEnabled, isDwmEnabled, dwmBackdropEnabled, hwAccelerated, minWidth, minHeight;
                            if (swscanf(buffer + 18, L"%d:%d:%d:%d:%d:%d:%d:%d:%d:%d:%d:%d:%d:%d:%d:%d", &showframe, &showframeonothers, &showmenu, &showcontrols, &transparentcontrols, &transparentrendering, &ignoreminsize, &isMaximized, &isTopMost, &isLayered, &isThemingEnabled, &isDwmEnabled, &dwmBackdropEnabled, &hwAccelerated, &minWidth, &minHeight) == 16) {
                                cte_settings.showframe = showframe;
                                cte_settings.showframeonothers = showframeonothers;
                                cte_settings.showmenu = showmenu;
                                cte_settings.showcontrols = showcontrols;
                                cte_settings.transparentcontrols = transparentcontrols;
                                cte_settings.transparentrendering = transparentrendering;
                                cte_settings.ignoreminsize = ignoreminsize;
                                g_queryResponse.success = TRUE;
                                g_queryResponse.isMaximized = isMaximized;
                                g_queryResponse.isTopMost = isTopMost;
                                g_queryResponse.isLayered = isLayered;
                                g_queryResponse.isThemingEnabled = isThemingEnabled;
                                g_queryResponse.isDwmEnabled = isDwmEnabled;
                                g_queryResponse.dwmBackdropEnabled = dwmBackdropEnabled;
                                g_queryResponse.hwAccelerated = hwAccelerated;
                                g_queryResponse.minWidth = minWidth;
                                g_queryResponse.minHeight = minHeight;
                                // Notify the condition variable
                                {
                                    std::lock_guard<std::mutex> lock(g_queryResponseMutex);
                                    g_queryResponseReceived = true;
                                }
                                g_queryResponseCv.notify_one();
                            }
                        }
                    }
                }
            }
        }
        CloseHandle(overlapped.hEvent);
        CloseHandle(g_hClientPipe);
        g_hClientPipe = INVALID_HANDLE_VALUE;
    });
    g_pipeThread.detach();

    return 0;
}

int SendNamedPipeMessage(LPCWSTR message) {
    if (g_hClientPipe == INVALID_HANDLE_VALUE) {
        Wh_Log(L"SendNamedPipeMessage failed: pipe is not connected");
        return ERROR_PIPE_NOT_CONNECTED;
    }

    DWORD bytesWritten;
    size_t messageLength = wcslen(message) * sizeof(wchar_t);
    Wh_Log(L"Sending message: %s", message);

    OVERLAPPED overlapped = {};
    overlapped.hEvent = CreateEvent(NULL, TRUE, FALSE, NULL);
    if (!overlapped.hEvent) {
        int gle = GetLastError();
        Wh_Log(L"CreateEvent failed, GLE=%d", gle);
        return gle;
    }

    BOOL result = WriteFile(g_hClientPipe, message, messageLength, &bytesWritten, &overlapped);
    if (!result && GetLastError() != ERROR_IO_PENDING) {
        int gle = GetLastError();
        Wh_Log(L"WriteFile failed, GLE=%d", gle);
        CloseHandle(overlapped.hEvent);
        return gle;
    }

    // Wait for the write operation to complete
    DWORD waitResult = WaitForSingleObject(overlapped.hEvent, INFINITE);
    if (waitResult != WAIT_OBJECT_0) {
        int gle = GetLastError();
        Wh_Log(L"WaitForSingleObject failed, GLE=%d", gle);
        CloseHandle(overlapped.hEvent);
        return gle;
    }

    // Check the result of the write operation
    if (!GetOverlappedResult(g_hClientPipe, &overlapped, &bytesWritten, FALSE)) {
        int gle = GetLastError();
        Wh_Log(L"GetOverlappedResult failed, GLE=%d", gle);
        CloseHandle(overlapped.hEvent);
        return gle;
    }

    Wh_Log(L"Message sent successfully");
    CloseHandle(overlapped.hEvent);

    if (wcsncmp(message, L"/WH:Query", 9) == 0) {
        // Wait for the query response
        std::unique_lock<std::mutex> lock(g_queryResponseMutex);
        g_queryResponseCv.wait(lock, [] { return g_queryResponseReceived; });
        g_queryResponseReceived = false;
    }

    return 0;
}

int CEF_CALLBACK WindhawkCommV8Handler(cef_v8handler_t* self, const cef_string_t* name, cef_v8value_t* object, size_t argumentsCount, cef_v8value_t* const* arguments, cef_v8value_t** retval, cef_string_t* exception) {
    Wh_Log(L"WindhawkCommV8Handler called with name: %s", name->str);
    std::u16string nameStr(name->str, name->length);
    if (nameStr == u"executeCommand") {
        if (argumentsCount == 1) {
            cef_string_t* arg = arguments[0]->get_string_value(arguments[0]);
            std::wstring argStr(arg->str, arg->str + arg->length);
            Wh_Log(L"Argument: %s", argStr.c_str());
            int res = SendNamedPipeMessage(argStr.c_str());
            if (res != 0) {
                *exception = *GenerateCefString(u"Error: " + to_u16string(res));
            }
        }
    } else if (nameStr == u"query") {
        int res = SendNamedPipeMessage(L"/WH:Query");
        if (res != 0) {
            *exception = *GenerateCefString(u"Error: " + to_u16string(res));
        }
        if (g_queryResponse.success) {
            cef_v8value_t* retobj = cef_v8value_create_object(NULL, NULL);
            cef_v8value_t* configObj = cef_v8value_create_object(NULL, NULL);
            configObj->set_value_bykey(configObj, GenerateCefString(u"showframe"), cef_v8value_create_bool(cte_settings.showframe), V8_PROPERTY_ATTRIBUTE_NONE);
            configObj->set_value_bykey(configObj, GenerateCefString(u"showframeonothers"), cef_v8value_create_bool(cte_settings.showframeonothers), V8_PROPERTY_ATTRIBUTE_NONE);
            configObj->set_value_bykey(configObj, GenerateCefString(u"showmenu"), cef_v8value_create_bool(cte_settings.showmenu), V8_PROPERTY_ATTRIBUTE_NONE);
            configObj->set_value_bykey(configObj, GenerateCefString(u"showcontrols"), cef_v8value_create_bool(cte_settings.showcontrols), V8_PROPERTY_ATTRIBUTE_NONE);
            configObj->set_value_bykey(configObj, GenerateCefString(u"transparentcontrols"), cef_v8value_create_bool(cte_settings.transparentcontrols), V8_PROPERTY_ATTRIBUTE_NONE);
            configObj->set_value_bykey(configObj, GenerateCefString(u"ignoreminsize"), cef_v8value_create_bool(cte_settings.ignoreminsize), V8_PROPERTY_ATTRIBUTE_NONE);
            configObj->set_value_bykey(configObj, GenerateCefString(u"transparentrendering"), cef_v8value_create_bool(cte_settings.transparentrendering), V8_PROPERTY_ATTRIBUTE_NONE);
            configObj->set_value_bykey(configObj, GenerateCefString(u"noforceddarkmode"), cef_v8value_create_bool(cte_settings.noforceddarkmode), V8_PROPERTY_ATTRIBUTE_NONE);
            configObj->set_value_bykey(configObj, GenerateCefString(u"forceextensions"), cef_v8value_create_bool(cte_settings.forceextensions), V8_PROPERTY_ATTRIBUTE_NONE);
            configObj->set_value_bykey(configObj, GenerateCefString(u"allowuntested"), cef_v8value_create_bool(cte_settings.allowuntested), V8_PROPERTY_ATTRIBUTE_NONE);
            retobj->set_value_bykey(retobj, GenerateCefString(u"options"), configObj, V8_PROPERTY_ATTRIBUTE_NONE);
            retobj->set_value_bykey(retobj, GenerateCefString(u"isMaximized"), cef_v8value_create_bool(g_queryResponse.isMaximized), V8_PROPERTY_ATTRIBUTE_NONE);
            retobj->set_value_bykey(retobj, GenerateCefString(u"isTopMost"), cef_v8value_create_bool(g_queryResponse.isTopMost), V8_PROPERTY_ATTRIBUTE_NONE);
            retobj->set_value_bykey(retobj, GenerateCefString(u"isLayered"), cef_v8value_create_bool(g_queryResponse.isLayered), V8_PROPERTY_ATTRIBUTE_NONE);
            retobj->set_value_bykey(retobj, GenerateCefString(u"isThemingEnabled"), cef_v8value_create_bool(g_queryResponse.isThemingEnabled), V8_PROPERTY_ATTRIBUTE_NONE);
            retobj->set_value_bykey(retobj, GenerateCefString(u"isDwmEnabled"), cef_v8value_create_bool(g_queryResponse.isDwmEnabled), V8_PROPERTY_ATTRIBUTE_NONE);
            retobj->set_value_bykey(retobj, GenerateCefString(u"dwmBackdropEnabled"), cef_v8value_create_bool(g_queryResponse.dwmBackdropEnabled), V8_PROPERTY_ATTRIBUTE_NONE);
            retobj->set_value_bykey(retobj, GenerateCefString(u"hwAccelerated"), cef_v8value_create_bool(g_queryResponse.hwAccelerated), V8_PROPERTY_ATTRIBUTE_NONE);
            retobj->set_value_bykey(retobj, GenerateCefString(u"minWidth"), cef_v8value_create_int(g_queryResponse.minWidth), V8_PROPERTY_ATTRIBUTE_NONE);
            retobj->set_value_bykey(retobj, GenerateCefString(u"minHeight"), cef_v8value_create_int(g_queryResponse.minHeight), V8_PROPERTY_ATTRIBUTE_NONE);
            *retval = retobj;
            g_queryResponse.success = FALSE;
        } else {
            *exception = *GenerateCefString(u"Error: Query response not received");
        }
    }
    return TRUE;
}

int CEF_CALLBACK _getSpotifyModule_hook(cef_v8handler_t* self, const cef_string_t* name, cef_v8value_t* object, size_t argumentsCount, cef_v8value_t* const* arguments, cef_v8value_t** retval, cef_string_t* exception) {
    Wh_Log(L"_getSpotifyModule_hook called with name: %s", name->str);
    if (argumentsCount == 1) {
        cef_string_t* arg = arguments[0]->get_string_value(arguments[0]); // NULL when it's an empty string
        if (arg != NULL && u"ctewh" == std::u16string(arg->str, arg->length)) {
            Wh_Log(L"CTEWH is being requested");
            cef_v8handler_t* ctewh = (cef_v8handler_t*)calloc(1, sizeof(cef_v8handler_t));
            ctewh->base.size = sizeof(cef_v8handler_t);
            ctewh->execute = WindhawkCommV8Handler;
            cef_v8value_t* retobj = cef_v8value_create_object(NULL, NULL);
            cef_string_t* name = GenerateCefString(u"executeCommand");
            retobj->set_value_bykey(retobj, name, cef_v8value_create_function_original(name, ctewh), V8_PROPERTY_ATTRIBUTE_NONE);
            cef_string_t* name2 = GenerateCefString(u"query");
            retobj->set_value_bykey(retobj, name2, cef_v8value_create_function_original(name2, ctewh), V8_PROPERTY_ATTRIBUTE_NONE);
            cef_v8value_t* initialConfigObj = cef_v8value_create_object(NULL, NULL);
            initialConfigObj->set_value_bykey(initialConfigObj, GenerateCefString(u"showframe"), cef_v8value_create_bool(cte_settings.showframe), V8_PROPERTY_ATTRIBUTE_NONE);
            initialConfigObj->set_value_bykey(initialConfigObj, GenerateCefString(u"showframeonothers"), cef_v8value_create_bool(cte_settings.showframeonothers), V8_PROPERTY_ATTRIBUTE_NONE);
            initialConfigObj->set_value_bykey(initialConfigObj, GenerateCefString(u"showmenu"), cef_v8value_create_bool(cte_settings.showmenu), V8_PROPERTY_ATTRIBUTE_NONE);
            initialConfigObj->set_value_bykey(initialConfigObj, GenerateCefString(u"showcontrols"), cef_v8value_create_bool(cte_settings.showcontrols), V8_PROPERTY_ATTRIBUTE_NONE);
            initialConfigObj->set_value_bykey(initialConfigObj, GenerateCefString(u"transparentcontrols"), cef_v8value_create_bool(cte_settings.transparentcontrols), V8_PROPERTY_ATTRIBUTE_NONE);
            initialConfigObj->set_value_bykey(initialConfigObj, GenerateCefString(u"ignoreminsize"), cef_v8value_create_bool(cte_settings.ignoreminsize), V8_PROPERTY_ATTRIBUTE_NONE);
            initialConfigObj->set_value_bykey(initialConfigObj, GenerateCefString(u"transparentrendering"), cef_v8value_create_bool(cte_settings.transparentrendering), V8_PROPERTY_ATTRIBUTE_NONE);
            initialConfigObj->set_value_bykey(initialConfigObj, GenerateCefString(u"noforceddarkmode"), cef_v8value_create_bool(cte_settings.noforceddarkmode), V8_PROPERTY_ATTRIBUTE_NONE);
            initialConfigObj->set_value_bykey(initialConfigObj, GenerateCefString(u"forceextensions"), cef_v8value_create_bool(cte_settings.forceextensions), V8_PROPERTY_ATTRIBUTE_NONE);
            retobj->set_value_bykey(retobj, GenerateCefString(u"initialOptions"), initialConfigObj, V8_PROPERTY_ATTRIBUTE_NONE);
            cef_v8value_t* supportedCommandsArr = cef_v8value_create_array(9);
            supportedCommandsArr->set_value_byindex(supportedCommandsArr, 0, cef_v8value_create_string(GenerateCefString(u"ExtendFrame")));
            supportedCommandsArr->set_value_byindex(supportedCommandsArr, 1, cef_v8value_create_string(GenerateCefString(u"Minimize")));
            supportedCommandsArr->set_value_byindex(supportedCommandsArr, 2, cef_v8value_create_string(GenerateCefString(u"MaximizeRestore")));
            supportedCommandsArr->set_value_byindex(supportedCommandsArr, 3, cef_v8value_create_string(GenerateCefString(u"Close")));
            supportedCommandsArr->set_value_byindex(supportedCommandsArr, 4, cef_v8value_create_string(GenerateCefString(u"SetLayered")));
            supportedCommandsArr->set_value_byindex(supportedCommandsArr, 5, cef_v8value_create_string(GenerateCefString(u"SetBackdrop")));
            supportedCommandsArr->set_value_byindex(supportedCommandsArr, 6, cef_v8value_create_string(GenerateCefString(u"ResizeTo")));
            supportedCommandsArr->set_value_byindex(supportedCommandsArr, 7, cef_v8value_create_string(GenerateCefString(u"SetMinSize")));
            supportedCommandsArr->set_value_byindex(supportedCommandsArr, 8, cef_v8value_create_string(GenerateCefString(u"SetTopMost")));
            retobj->set_value_bykey(retobj, GenerateCefString(u"supportedCommands"), supportedCommandsArr, V8_PROPERTY_ATTRIBUTE_NONE);
            retobj->set_value_bykey(retobj, GenerateCefString(u"version"), cef_v8value_create_string(GenerateCefString(u"0.6")), V8_PROPERTY_ATTRIBUTE_NONE);
            *retval = retobj;
            return TRUE;
        }
    }
    return _getSpotifyModule_original(self, name, object, argumentsCount, arguments, retval, exception);
}

cef_v8value_create_function_t CEF_EXPORT cef_v8value_create_function_hook = [](const cef_string_t* name, cef_v8handler_t* handler) -> cef_v8value_t* {
    Wh_Log(L"cef_v8value_create_function called with name: %s", name->str);
    if (u"_getSpotifyModule" == std::u16string(name->str, name->length)) {
        Wh_Log(L"_getSpotifyModule is being created");
        _getSpotifyModule_original = handler->execute;
        handler->execute = _getSpotifyModule_hook;
        return cef_v8value_create_function_original(name, handler);
    }
    return cef_v8value_create_function_original(name, handler);
};

BOOL InitSpotifyRendererHooks(HMODULE cefModule) {
    g_isSpotifyRenderer = TRUE;
    Wh_Log(L"Initializing Spotify renderer hooks");

    if (ConnectToNamedPipe(PIPE_NAME) == 0) {
        Wh_Log(L"Connected to named pipe");
    } else {
        Wh_Log(L"Unable to connect to named pipe");
        return FALSE;
    }

    cef_v8value_create_function_t cef_v8value_create_function = (cef_v8value_create_function_t)GetProcAddress(cefModule, "cef_v8value_create_function");
    cef_v8value_create_bool = (cef_v8value_create_bool_t)GetProcAddress(cefModule, "cef_v8value_create_bool");
    cef_v8value_create_int = (cef_v8value_create_int_t)GetProcAddress(cefModule, "cef_v8value_create_int");
    cef_v8value_create_string = (cef_v8value_create_string_t)GetProcAddress(cefModule, "cef_v8value_create_string");
    cef_v8value_create_object = (cef_v8value_create_object_t)GetProcAddress(cefModule, "cef_v8value_create_object");
    cef_v8value_create_array = (cef_v8value_create_array_t)GetProcAddress(cefModule, "cef_v8value_create_array");

    if (!cef_v8value_create_function || !cef_v8value_create_bool || !cef_v8value_create_string || !cef_v8value_create_object) {
        Wh_Log(L"Failed to get CEF functions");
        return FALSE;
    }
    Wh_SetFunctionHook((void*)cef_v8value_create_function, (void*)cef_v8value_create_function_hook,
                       (void**)&cef_v8value_create_function_original);

    return TRUE;
}
#pragma endregion

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

// The mod is being initialized, load settings, hook functions, and do other
// initialization stuff if required.
BOOL Wh_ModInit() {
    #ifdef _WIN64
        Wh_Log(L"Init - x86_64");
    #else
        Wh_Log(L"Init - x86");
    #endif

    LoadSettings();

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

    cef_version_info_t cef_version_info = (cef_version_info_t)GetProcAddress(cefModule, "cef_version_info");

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

    get_window_handle_offset = FindOffset(major, minor, get_window_handle_offsets, ARRAYSIZE(get_window_handle_offsets), cte_settings.allowuntested);
    Wh_Log(L"get_window_handle offset: %#x", get_window_handle_offset);

    // Check if this process is auxilliary process by checking if the arguments contain --type=
    LPWSTR args = GetCommandLineW();
    if (wcsstr(args, L"--type=") != NULL) {
        if (isSpotify && isInitialThread && major >= 108 &&
            get_window_handle_offset != NULL &&
            wcsstr(args, L"--type=renderer") != NULL &&
            wcsstr(args, L"--extension-process") == NULL
        ) {
            return InitSpotifyRendererHooks(cefModule);
        }
        Wh_Log(L"Auxilliary process detected, skipping.");
        return FALSE;
    }

    // Get appropriate offsets for current CEF version
    is_frameless_offset = FindOffset(major, minor, is_frameless_offsets, ARRAYSIZE(is_frameless_offsets));
    Wh_Log(L"is_frameless offset: %#x", is_frameless_offset);
    if (isSpotify) {
        add_child_view_offset = FindOffset(major, minor, add_child_view_offsets, ARRAYSIZE(add_child_view_offsets));
        Wh_Log(L"add_child_view offset: %#x", add_child_view_offset);
        set_background_color_offset = FindOffset(major, minor, set_background_color_offsets, ARRAYSIZE(set_background_color_offsets));
        Wh_Log(L"set_background_color offset: %#x", set_background_color_offset);
    }

    cef_window_create_top_level_t cef_window_create_top_level = (cef_window_create_top_level_t)GetProcAddress(cefModule, "cef_window_create_top_level");
    cef_panel_create_t cef_panel_create = (cef_panel_create_t)GetProcAddress(cefModule, "cef_panel_create");

    Wh_SetFunctionHook((void*)cef_window_create_top_level,
                       (void*)cef_window_create_top_level_hook,
                       (void**)&cef_window_create_top_level_original);
    Wh_SetFunctionHook((void*)CreateWindowExW, (void*)CreateWindowExW_hook,
                       (void**)&CreateWindowExW_original);
    if (isSpotify) {
        Wh_Log(L"Hooking Spotify functions");
        Wh_SetFunctionHook((void*)cef_panel_create, (void*)cef_panel_create_hook,
                           (void**)&cef_panel_create_original);
        Wh_SetFunctionHook((void*)SetWindowThemeAttribute, (void*)SetWindowThemeAttribute_hook,
                           (void**)&SetWindowThemeAttribute_original);
        Wh_SetFunctionHook((void*)CreateProcessW, (void*)CreateProcessW_hook,
                           (void**)&CreateProcessW_original);
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

    g_shouldClosePipe = TRUE;

    if (g_isSpotifyRenderer) {
        // Note: sandboxed renderers won't even respond to the uninit request
        if (g_hClientPipe != INVALID_HANDLE_VALUE) {
            CloseHandle(g_hClientPipe);
            g_hClientPipe = INVALID_HANDLE_VALUE;
        }
        if (g_pipeThread.joinable()) {
            g_pipeThread.join();
        }
        return;
    }

    if (g_hSrvPipe != INVALID_HANDLE_VALUE) {
        CancelIoEx(g_hSrvPipe, NULL);
        CloseHandle(g_hSrvPipe);
        g_hSrvPipe = INVALID_HANDLE_VALUE;
    }
    if (g_pipeThread.joinable()) {
        g_pipeThread.join();
    }

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
    if (g_isSpotifyRenderer) {
        // Won't work in a sandboxed renderer process
        // Our pipe server will handle the settings change instead
        return;
    }
    BOOL prev_transparentcontrols = cte_settings.transparentcontrols;
    LoadSettings();
    EnumWindows(UpdateEnumWindowsProc, prev_transparentcontrols != cte_settings.transparentcontrols);
}
