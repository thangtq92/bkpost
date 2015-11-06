HvHelpers = {};

HvHelpers.loading = {
    skipShow: true, // default not loading
    show: function (force) {
        if (force)
            HvHelpers.loading.skipShow = false;

        if (!HvHelpers.loading.skipShow && $("#ajax_loader").size() == 1) {
            if (HvHelpers.loadingInstance == undefined) {
                HvHelpers.loadingInstance = $("#ajax_loader");
                this.showHandle();
            }
            else {

                this.showHandle();
            }
        }

    },
    hide: function (force) {
        if (force)
            HvHelpers.loading.forceHide = false;
        if (HvHelpers.loadingInstance && !HvHelpers.loading.forceHide) {
            HvHelpers.loadingInstance.addClass("hidden-opacity");
            setTimeout(function () {
                HvHelpers.loadingInstance.hide();
            }, 800);
        }
    },
    showHandle: function () {

        HvHelpers.loadingInstance.removeClass("hidden-opacity");
        HvHelpers.loadingInstance.show();
    }
};

HvHelpers.alert = function (msg, action, fn) {
    alert(msg);
    if (fn) fn();
};

HvHelpers.assignUrl = function (url) {

    HvHelpers.loading.show('force'); window.location.assign(url);
};

HvHelpers.timeServer = function () {

    try {
        return new Date($("#realdate").html().trim().split('/').reverse().join("-") + ' ' + $("#realtime").html());
    } catch (ex) {
        return new Date();
    }
};


HvHelpers.AdjustDateTime = function (dateInput) {

    Date.prototype.addHours = function (h) {
        this.setHours(this.getHours() + h);
        return this;
    };

    var adjust = (dateInput.indexOf("CH") == -1) ? 7 : 12;
    var from = dateInput.split(" ");
    var numbers = from[0].match(/\d+/g);
    var time = from[1].replace("SA", "").replace("CH", "").split(":");
    return new Date(numbers[2], numbers[1] - 1, numbers[0], time[0], time[1], time[2]).addHours(adjust);
};

HvHelpers.getLocation = function (fn) {

    var callFn = function () {
        clearTimeout(limitedWait);
        if (fn) fn(window.Profiles);
    };
    var limitedWait = setTimeout(function () {
        if (fn) fn({ Ip: "undefined", Region: "undefined" });
    }, 5000);

    if (typeof (Profiles) == "undefined") {
        $.get("http://ipinfo.io", function (response) {
            window.Profiles = { Ip: response.ip, Region: response.region };
            callFn(window.Profiles);
        }, "jsonp");
    } else {
        callFn();
    }
};

HvHelpers.getFormatDate = function (dateInput, format) {
    var date = new Date(dateInput);
    if (date == "Invalid Date") {
        date = HvHelpers.AdjustDateTime(dateInput);
    }
    var addZero = function (val) {

        if (val < 10) return "0" + val;
        else return val;
    };

    var dayMapping = { 1: 'Thứ hai', 2: 'Thứ ba', 3: 'Thứ tư', 4: 'Thứ năm', 5: 'Thứ sáu', 6: 'Thứ bẩy', 0: 'Chủ nhật' };

    var hours = addZero(date.getUTCHours());
    var minutes = addZero(date.getUTCMinutes());
    var seconds = addZero(date.getUTCSeconds());
    if (format == 'full')
        return dayMapping[date.getUTCDay()] + ', ' + (addZero(date.getUTCDate()) + '/' + addZero(date.getUTCMonth() + 1) + '/' + addZero(date.getUTCFullYear())) + ' - ' + hours + ':' + minutes + ':' + seconds + '  GMT + 7';
    else return (addZero(date.getUTCDate()) + '/' + addZero(date.getUTCMonth() + 1) + '/' + addZero(date.getUTCFullYear())) + ' - ' + hours + ':' + minutes + ':' + seconds;
};

HvHelpers.parseMoney = function (amount, callback) {
    if (parseInt(AppConfigs.CurrencyRate) == 1) {
        callback(HvHelpers.formatNumber(amount));
    }
    else {
        if (!isNaN(amount)) {
            $.getJSON(AppConfigs.HOST + "/api/Utils/GetFormatCurrency?value=" + amount, function (data) {
                callback(data);
            });
        }
    }
};

HvHelpers.formatNumber = function (v, n, x, s, c) {
    if (v == undefined) return "0.00";
    if (!n) {
        n = 0;
        x = 3;
        s = '.';
        c = ',';
    }
    if (typeof v == "string") v = parseFloat(v);
    var re = '\\d(?=(\\d{' + (x || 3) + '})+' + (n > 0 ? '\\D' : '$') + ')',
        num = v.toFixed(Math.max(0, ~~n));

    return (c ? num.replace('.', c) : num).replace(new RegExp(re, 'g'), '$&' + (s || ',')) + " ₫";
};


Number.prototype.formatMoney = function (n, x, s, c) {

    return HvHelpers.formatNumber(this, n, x, s, c);
};

HvHelpers.modifyUrlParameter = function (param, val, url) {

    url = url == undefined ? window.location.href : url;
    if (val == null || val == "") return url;
    var theAnchor = null;
    var newAdditionalUrl = "";
    var tempArray = url.split("?");
    var baseUrl = tempArray[0];
    var additionalUrl = tempArray[1];
    var temp = "";
    var tmpAnchor;
    var theParams;
    if (additionalUrl) {
        tmpAnchor = additionalUrl.split("#");
        theParams = tmpAnchor[0];
        theAnchor = tmpAnchor[1];
        if (theAnchor)
            additionalUrl = theParams;

        tempArray = additionalUrl.split("&");

        for (i = 0; i < tempArray.length; i++) {
            if (tempArray[i].split('=')[0] != param) {
                newAdditionalUrl += temp + tempArray[i];
                temp = "&";
            }
        }
    }
    else {
        tmpAnchor = baseUrl.split("#");
        theParams = tmpAnchor[0];
        theAnchor = tmpAnchor[1];

        if (theParams)
            baseUrl = theParams;
    }

    if (theAnchor)
        val += "#" + theAnchor;

    var rowsTxt = temp + "" + param + "=" + val;
    return baseUrl + "?" + newAdditionalUrl + rowsTxt;
};


HvHelpers.loadJsQueued = [];
HvHelpers.loadJs = function (url, obj, isready, asyn) {

    var scripts = document.getElementsByTagName('script');
    var len = scripts.length;
    for (var i = 0; i < len; i++) {
        if (scripts[i].src.search(url) > 0 && scripts[i].src.lastIndexOf("/") >= 0) {
            HvHelpers.loadJsQueued.push(url);
            break;
        }
    }
    if (HvHelpers.loadJsQueued.indexOf(url) == -1) {
        HvHelpers.loadJsQueued.push(url);
        var script = document.createElement('script');
        script.src = AppConfigs.HOST + "/" + url;
        var head = document.getElementsByTagName('head')[0], done = false;
        head.appendChild(script);
        // Attach handlers for all browsers
        script.onload = script.onreadystatechange = function () {
            if (!done && (!this.readyState || this.readyState == 'loaded' || this.readyState == 'complete')) {
                done = true; console.log(url, ":: load when not ready!");
                if (isready) isready();
                script.onload = script.onreadystatechange = null;
                //head.removeChild(script);
            }
        };
    }
    else {
        //console.log(url,"::is ready, no load!");
        if (isready && asyn == undefined) isready();
    }
};

HvHelpers.Jsonify = (function (div) {
    return function (json) {
        if (json == "") return {};
        div.setAttribute('onclick', 'this.__json__ = ' + json);
        div.click();
        return div.__json__;
    };
})(document.createElement('div'));

HvHelpers.scrollTo = function (target, margin) {

    $('html, body').animate({ scrollTop: ($(target).offset().top - (margin)) }, 100);
};

Number.prototype.format = function (n, x, s, c) {

    return HvHelpers.formatNumber(this, n, x, s, c);
};

Number.prototype.round = function (places) {
    return +(Math.round(this + "e+" + places) + "e-" + places);
};

HVGetFiles = { cssLoaded: {}, scriptLoaded: {}, waiting: {} };
HVGetFiles.Script = function (urlJs, callbacks) {
    if (urlJs) urlJs = AppConfigs.HOST + urlJs + "?7200";
    if (!HVGetFiles.scriptLoaded[urlJs]) {
        HVGetFiles.waiting[urlJs] = true;
        HVGetFiles.scriptLoaded[urlJs] = "__loaded__";
        jQuery.ajax({
            url: urlJs,
            type: 'GET',
            dataType: "script",
            cache: true,
            success: function () {
                delete HVGetFiles.waiting[urlJs];
                if (callbacks) callbacks();
            },
            error: function (response) {
                console.error("Ajax js Error: ", response);
            }
        });
    } else {
        if (callbacks) {
            if (HVGetFiles.waiting[urlJs] == true) {
                setTimeout(function () { callbacks(); }, 3200);
            } else callbacks();
        }
    }
};

HVGetFiles.Scripts = function (arrayLink) {

    for (var i in arrayLink) {
        HVGetFiles.Script("/" + arrayLink[i]);
    }
};

HVGetFiles.CSS = function (urlCss, callbacks) {
    if (urlCss) urlCss = AppConfigs.HOST + urlCss + "?7200";
    if (!HVGetFiles.cssLoaded[urlCss]) {
        var stylesheet = document.createElement('link');
        stylesheet.href = urlCss;
        stylesheet.rel = 'stylesheet';
        stylesheet.type = 'text/css';
        document.getElementsByTagName('head')[0].appendChild(stylesheet);
        HVGetFiles.cssLoaded[urlCss] = "__loaded__";
        if (callbacks) callbacks();

    } else {
        if (callbacks) callbacks();
    }
};

HVGetFiles.CSSs = function (arrayLink) {
    for (var i in arrayLink) {
        HVGetFiles.CSS("/" + arrayLink[i]);
    }
};

HVGetFiles.Htm = function (urlHtm, callbacks) {
    if (urlHtm) urlHtm = AppConfigs.HOST + urlHtm;
    $.get(urlHtm, callbacks);
};