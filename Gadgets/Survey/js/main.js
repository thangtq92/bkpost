HvSurvey = Class.extend({

    Id: -1,

    Language: {
        "Title": "Result statistics", "EndDate": "End date", "ValidChosen": "Please choose one of the answers on!",
        "Vote": "vote",
    }, // default

    setLanguage: function (lang) {
        for (var i in lang) {
            this.Language[i] = lang[i];
        }
    },

    translate: function (id) {
        $.each(this.Language, function (k, v) {
            var obj = $("#" + id + "-" + k);
                obj.val(v);
                obj.html(v);
        });
    },

    run: function (fnCallback) {
        var self = this;
        self.getSurveySrv = new Services('survey/getsurvey', { Id: self.Id }, function (res) {
                if (res == null) {
                    $("[data-id=" + self.Id + "]").remove();
                }
                else {
                    var render = function () {
                        
                        $("#" + self.Id + "-SurveyWapper").show();
                        $("#" + self.Id + "-Question").html(res.Question);
                        $("#" + self.Id + "-ExpiredTime").html(res.ExpiredTime);
                        var answerHtml = []; var type = "";
                        switch (res.Type) {
                            case 1:
                                type = "radio";
                                break;
                            case 2:
                                type = "checkbox";
                            default:
                        }
                        var ops = res.Answers;
                        for (var ji = 0, len = ops.length; ji <= len; ji++) {
                            if (ops[ji]) {
                                var idx = ops[ji].Id;
                                if (ops[ji].Answer != "~") {
                                    var title = ops[ji].Answer;
                                    if (title.indexOf("#") != -1) title = "#";
                                    answerHtml.push('<input id="' + idx + '" name="op-" type="' + type + '" title="' + title + '" class="radio" value="' + ops[ji].Answer + '">' +
                                                        '<label class="choice" for="' + idx + '">' + ops[ji].Answer + '</label>'
                                                    );
                                }
                            }
                        }
                        if (res.AllowGuestsToVote != true && AppConfigs.isAuthenticated != "True") {
                            
                            $("#" + self.Id + "-Vote").remove();
                        }
                        $("#" + self.Id + "-Answer").html(answerHtml.join("")); 
                        $("#" + self.Id + "-Answer input").bind("click", function () {
                            if ($(this).attr("title") == '#') {
                                if($('#answer-outwardly').size() == 0)
                                    $("label:contains('#')").append('<input id="answer-outwardly" style="float: left; width: 100%; height: 20px;  font-size: 11px;   font-weight: 400;  line-height: 20px;" />');

                                    $('#answer-outwardly').show().focus();
                            }
                            else {
                                if ($('#answer-outwardly').size() > 0) {
                                    $('#answer-outwardly').hide();
                                }
                            }
                            self.AnswerId = this.id;
                        });
                        self.translate(self.Id);
                    };
                    render();  if (fnCallback) fnCallback();
                }
                
            });
            self.getSurveySrv.get();
    },

    bind: function () {
        var self = this;
        $("#" + this.Id + "-SubmitVote").bind("click", function () {
            self.postVote();
        });

        $("#" + this.Id + "-Result").bind("click", function () {
            self.getVotes();
        });
    },

    getVotes: function () {
        var self = this;
        HVGetFiles.Htm('/gadgets/survey/result.htm', function (innerHtml) {
            HVGetFiles.Script('/content/plugins/hv-modal/js/hv.interface.js', function () {
                HvInterface.showModal({ title: self.Language["Title"] + ':', content: innerHtml.replace(/id="Prefix-/g, 'id="' + self.Id + '-'), cover: ".page-inner" }, function (modal) {
                    modal.setStyle({ 'width': '504px', 'left': '-199px', 'top': window.scrollY + 172, 'margin-left': '48%' });
                    $("#" + self.Id + "-Question-Result").html($("#" + self.Id + "-Question").html());
                    $("#" + self.Id + "-ExpiredTime-Result").html((self.Language["EndDate"] + ': ') + HVHelper.getFormatDate($("#" + self.Id + "-ExpiredTime").html(), 'base'));
                    
                        var getVotesSrv = new Services('survey/getVotes', { surveyId: self.Id }, function (res) {
                            var votes = [];
                            var totalVotes = 0;
                            for (var ij = 0, leni = res.length; ij < leni; ij++) totalVotes += parseInt(res[ij].NumberOfVotes);
                            for (var ji = 0, lenj = res.length; ji < lenj; ji++) {
                                var per = 0;
                                if (totalVotes > 0)
                                    per = Math.round((parseInt(res[ji].NumberOfVotes) / totalVotes) * 100);
                                    votes.push('<li>' +
                                                    '<div class="info-result">' +
                                                            '<div class="rsv-left">' + res[ji].Answer + '</div>' +
                                                            '<div class="rsv-right">' +
                                                                '<label>' + res[ji].NumberOfVotes + '</label> ' + self.Language["Vote"] + '</div>' +
                                                    '<div class="scroll-color"> <span percent="96" class="bg-center-scroll" style="width: ' + per + '%;"> &nbsp;' +
                                                        '<label class="txt-number-result">' + per + '%</label>' +
                                                    '</span> </div></div>' +
                                                '</li>');
                                $("#" + self.Id + "-Votes-Result").html(votes.join(""));
                                $("#" + self.Id + "-Votes-Total-Result").html(totalVotes); self.translate(self.Id);
                            }
                        });
                        getVotesSrv.get();
                    });
            });
        }, 'no-cache');
    },

    postVote: function () {
        var self = this;
        if (self.AnswerId) {
            if (!self.posted) {
                var answerOutwardly = $('#answer-outwardly');
                    HvHelpers.getLocation(function (res) {
                        var postVoteSrv = new Services('survey/postVote', { answerOutwardly: answerOutwardly.val(), customerIp: res.Ip, path: window.location.pathname }, function (ret) {
                            if (ret == "OK") {
                                $("[data-id=" + self.Id + "]").find('input').attr('disabled', 'true');
                                self.getVotes(); self.posted = true;
                            }
                            else HvHelpers.alert(ret);
                        });
                        postVoteSrv.post({ surveyId: self.Id, Id: self.AnswerId });
                });
            } else self.getVotes();
        }
        else {
            HVHelper.Notify("error", self.Language["ValidChosen"]);
        }
    }

});
