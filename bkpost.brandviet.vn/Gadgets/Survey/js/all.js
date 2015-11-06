var limit = 100;
var waitLoad = setInterval(function () {
    if (typeof HVGetFiles === "undefined") {

    }
    else {
        clearInterval(waitLoad);
        HVGetFiles.Script("/gadgets/survey/js/hv.helper.js", function () {
            HVGetFiles.Script("/gadgets/survey/js/main.js", function () {
                var surveys = $("[data-name='survey']");
                if (typeof window.ListSurvey === "undefined") {
                    window.ListSurvey = {};
                }
                var dtr = ListSurvey;
                for (var ij = 0, len = surveys.length; ij < len; ij++) {
                    (function (ij) {
                        var hvsg = $(surveys[ij]);
                        var surveyId = hvsg.data("id");
                        if (!dtr.Survey) dtr.Survey = [];
                        if (HVHelper.indexOf(surveyId, dtr.Survey) != -1) {

                        }
                        else {
                            var hvs = new HvSurvey();
                            hvs.Id = surveyId;
                            hvs.setLanguage(window.Languages['Survey']);
                            dtr.Survey.push(hvs.Id);
                            HVGetFiles.Htm("/gadgets/survey/index.htm?3600", function (innerHtml) {
                                hvsg.html(innerHtml.replace(/id="Prefix-/g, 'id="' + hvs.Id + '-'));
                                hvs.run(function () {
                                    hvs.bind();
                                    hvsg.css({ "width": hvsg.data("width"), "display": "block" }).find(".survey-wapper").addClass(hvsg.data("class"));
                                });
                            });
                        }
                    }(ij));
                };
            });
        });
    }
    limit--;
    if (limit <= 0) clearInterval(waitLoad);
}, 100);
