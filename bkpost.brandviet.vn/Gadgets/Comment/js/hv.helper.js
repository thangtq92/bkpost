if (typeof HVHelper === "undefined") HVHelper = {};

HVHelper.indexOf = function (val, arr) {
    for (var i in arr) {
        if (arr[i] == val) return i;
    }
    return -1;
};

HVHelper.StandardizedNumber = function (num, length) {

    return (Array(length).join('0') + num).slice(-length);
};

HVHelper.ValidEmail = function (email) {

    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
};

HVHelper.ValidNumber = function (input) {

    return (input - 0) == input && ('' + input).replace(/^\s+|\s+$/g, "").length > 0;
};

HVHelper.getRandom = function (max) {
    return Math.floor((Math.random() * (max || 100)) + 1);
};

HVHelper.ToTitleCase = function (str) {
    return str.replace(/\w\S*/g, function (txt) { return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(); });
};

HVHelper.ToTitleCaseFirstWord = function (str) {
    return str.charAt(0).toUpperCase() + str.substr(1).toLowerCase();
};

HVHelper.reverseString = function (s) {
    return s.split("").reverse().join("");
};

HVHelper.TrunLength = function (str, strLength, stringEnd) {
    var ref = "";
    if (str != undefined) {
        if (str.toString().length <= strLength) {
            return str.toString();
        } else {
            if (str.toString().substring(strLength - 1, strLength) == "") {

                ref = str.toString().substring(0, strLength);
            } else {
                while (strLength > 0) {
                    if (str.toString().substring(strLength - 1, strLength) == ' ') {
                        ref = str.toString().substring(0, strLength).toString();
                        break;
                    }
                    strLength--;
                }
            }
        }
    } else {
        return "";

    }
    try {
        return ref.trim() + stringEnd;
    } catch (ex) {
        return ref + stringEnd;
    }
};


HVHelper.cloneObject = function (obj) {
    var copiedObj = {};
    for (var j in obj) {
        copiedObj[j] = obj[j];
    }
    return copiedObj;
};

HVHelper.Notify = function (types, msg) {
    HVGetFiles.CSS("/Content/plugins/jnotify/css/jquery.jnotify.css", function () {
        HVGetFiles.Script("/Content/plugins/jnotify/js/jquery.jnotify.min.js", function () {
            var opps = {
                HorizontalPosition: 'center',
                VerticalPosition: 'center',
                MinWidth: 400,
                ShowOverlay: true,
                ColorOverlay: '#000',
                OpacityOverlay: 0.6, TimeShown: 3200
            };
            switch (types) {
                case 'success': window.jSuccess(msg, opps); break;
                case 'notice': window.jNotify(msg, opps); break;
                case 'error': window.jError(msg, opps); break;
                default:
            }
        });
    });
};

HVHelper.getParams = function (at, decode) {
    $.urlParam = function (name) {
        var results = new RegExp('[\\?&amp;]' + name + '=([^&amp;#]*)').exec(window.location.href);
        if (results) {
            if (decode) return decodeURIComponent(results[1]);
            return results[1] || 0;
        } else return -1;
    };
    return decodeURIComponent((new RegExp('[?|&]' + at + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search) || [, ""])[1].replace(/\+/g, '%20')) || null;
};

HVHelper.getHashParams = function () {
    var hashdata = new Object();
    jQuery.each(window.location.hash.replace(/^#/, '').split('&'), function (i, t) {
        var s = t.split('=');
        if (s[1])
            hashdata[s[0]] = s[1];
    });
    return hashdata;
};

HVHelper.getLocaltion = function () {
    return window.location.href;
};

HVHelper.getUrl = function () {
    if (window.urlSaved) return window.urlSaved;
    else {
        if (document.URL.indexOf(".html") != -1)
            window.urlSaved = document.URL.substring(0, document.URL.lastIndexOf("/"));
        else if (document.URL.indexOf("page=") != -1)
            window.urlSaved = document.URL.split("?")[0];
        else {
            window.urlSaved = document.URL;
        }
        return window.urlSaved;
    }
};

HVHelper.scrollTo = function (x) {
    $('body,html').animate({ scrollTop: x }, 500);
};

HVHelper.replaceStateUrl = function (val) {
    try {
        window.history.pushState({}, 'data', val);
    } catch (ex) {
        window.location.href = val;
    }
};