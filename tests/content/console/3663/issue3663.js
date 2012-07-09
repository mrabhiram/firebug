function runTest()
{
    FBTest.sysout("issue3663.START");

    FBTest.openNewTab(basePath + "console/3663/issue3663.html", function(win)
    {
        FBTest.openFirebug();
        FBTest.enableConsolePanel(function()
        {
            var config = {tagName: "pre", classes: "objectBox-array"};
            FBTest.waitForDisplayedElement("console", config, function(row)
            {
                var expected = /\s*\[\"a1\"\,\s*\[\.\.\.\]\,\s*\"b1\"\]\s*/;
                FBTest.compare(expected, row.textContent, "The log must match");
                FBTest.testDone("issue3663.DONE");
            });

            FBTest.click(win.document.getElementById("testButton"));
        });
    });
}
