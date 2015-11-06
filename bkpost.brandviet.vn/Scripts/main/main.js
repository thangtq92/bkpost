$(function () {
    "use strict";

    var hrefs = window.location.pathname;
    var active = function (el, applied, hrefa) {
        if (hrefa == "") {
            $($(el).find("li")[0]).addClass("active");
        }
        else {
            $.each($(el).find("a"), function (k, v) {
                if ($(v).attr("href").replace("/", "") == hrefa) {
                    if (applied == "parent")
                         $(v).parent().addClass("active");
                    else $(v).addClass("active");
                }
            });
        }
    };
    active(".menu-main", "parent", hrefs.replace("/", ""));
    active(".menu-main", "parent", hrefs.split("/")[1]);

    if ($('.notify').size() > 0) {
        setTimeout(function () { $(".notify").hide(); }, 7200);
    }

    // 

    // Post Activity:
    var actionType = "View";
    if (window.sessionStorage.getItem("firstAccess") == null) {
        actionType = "Visits";
        window.sessionStorage.setItem("firstAccess", true);
    }
    new Services("base/post-activity", {}, function () { }, 'no-api').post({ actionType: actionType });

}(jQuery));