/* See license.txt for terms of usage */

// ********************************************************************************************* //
// Tracing Console Overlay Implementation

/**
 * This overlay is intended to append a new menu-item into the Firebug's icon menu.
 * This menu is used to open the Tracing Console.
 */
var FBTraceFirebugOverlay = {};

// traceFirebugOverlay.xul is applied on firebugOverlay.xul, which is living in an IFrame
// (firebugFrame.xul). FBTrace is creating a new option 'FirebugMenu_Options_alwaysOpenTraceConsole'
// that is inserted into 'fbFirebugMenuPopup'. This menu is used within the firebug's iframe
// scope (Firebug icon menu) as well as in the global Firefox scope (browser.xul). In order to make
// the global menu working, we need to expose 'FBTraceFirebugOverlay' to it.
top.FBTraceFirebugOverlay = FBTraceFirebugOverlay;

// ********************************************************************************************* //

(function() {

// ********************************************************************************************* //

var Cc = Components.classes;
var Ci = Components.interfaces;

this.initialize = function()
{
    window.removeEventListener("load", FBTraceFirebugOverlay.initialize, false);

    // Customization of Firebug's menu.
    var handler = FBTraceFirebugOverlay.onFirebugMenuShowing.bind(FBTraceFirebugOverlay);
    document.addEventListener("firebugMenuShowing", handler, false);
};

this.onFirebugMenuShowing = function(event)
{
    if (!Firebug.GlobalUI)
        return;

    var parent = event.detail;

    // Extend Firebug menu
    with (Firebug.GlobalUI)
    {
        // Open Test Console
        $menupopupOverlay(parent, [
            $menuseparator({
                insertbefore: "menu_firebug_aboutSeparator",
            }),
            $menuitem({
                id: "menu_openTraceConsole",
                label: "Open_Firebug_Tracing",
                command: "cmd_openTraceConsole",
                insertbefore: "menu_firebug_aboutSeparator",
                "class": "fbInternational",
                key: "key_openTraceConsole"
            })
        ]);

        // Always Open Test Console (option)
        var optionsPopup = parent.querySelector("#FirebugMenu_OptionsPopup");
        $menupopupOverlay(optionsPopup, [
            $menuitem({
                id: "FirebugMenu_Options_alwaysOpenTraceConsole",
                type: "checkbox",
                label: "Always_Open_Firebug_Tracing",
                oncommand: "FBTraceFirebugOverlay.onToggleOption(this)",
                insertbefore: "menu_firebug_optionsSeparator",
                option: "alwaysOpenTraceConsole"
            })
        ]);
    }
};

this.onToggleOption = function(target)
{
    var self = this;
    Firebug.GlobalUI.startFirebug(function()
    {
        Firebug.chrome.onToggleOption(target);

        // Open automatically if set to "always open", close otherwise.
        if (Firebug.Options.getPref(Firebug.prefDomain, "alwaysOpenTraceConsole"))
            self.openConsole();
        else
            self.closeConsole();
    });
};

this.openConsole = function(prefDomain, windowURL)
{
    if (!prefDomain)
        prefDomain = "extensions.firebug";

    var consoleWindow = null;
    FBL.iterateBrowserWindows("FBTraceConsole", function(win) {
        if (win.TraceConsole && win.TraceConsole.prefDomain == prefDomain) {
            consoleWindow = win;
            return true;
        }
    });

    // Try to connect an existing trace-console window first.
    if (consoleWindow && consoleWindow.TraceConsole) {
        consoleWindow.focus();
        return;
    }

    if (!windowURL)
        windowURL = this.getTraceConsoleURL();

    if (FBTrace.DBG_OPTIONS)
        FBTrace.sysout("traceModule.openConsole, prefDomain: " + prefDomain);

    var self = this;
    var args = {
        prefDomain: prefDomain,
    };

    if (FBTrace.DBG_OPTIONS) {
        for (var p in args)
            FBTrace.sysout("tracePanel.openConsole prefDomain:" +
                prefDomain +" args["+p+"]= "+ args[p]+"\n");
    }

    window.openDialog(
        windowURL,
        "FBTraceConsole." + prefDomain,
        "chrome,resizable,scrollbars=auto,minimizable,dialog=no",
        args);
},

this.closeConsole = function(prefDomain)
{
    if (!prefDomain)
        prefDomain = this.prefDomain;

    var consoleWindow = null;
    FBL.iterateBrowserWindows("FBTraceConsole", function(win) {
        if (win.TraceConsole && win.TraceConsole.prefDomain == prefDomain) {
            consoleWindow = win;
            return true;
        }
    });

    if (consoleWindow)
        consoleWindow.close();
},

this.getTraceConsoleURL = function()
{
    return "chrome://fbtrace/content/traceConsole.xul";
}

// ********************************************************************************************* //

// Register load listener for command line arguments handling.
window.addEventListener("load", FBTraceFirebugOverlay.initialize, false);

// ********************************************************************************************* //

}).apply(FBTraceFirebugOverlay);

// ********************************************************************************************* //
