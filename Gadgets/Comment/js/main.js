if (!HvComment)
    window.HvComment = { };

HvComment.translate = function () {

    $.each(this.Language, function (k, v) {

        var obj = $("[data-name=" + k + "]");
        if (k.indexOf("Placeholder") !=-1) {
            obj.attr("placeholder", v);
        }
        else {
            obj.val(v);
            obj.html(v);
        }
    });
};
HvComment.init = function() {
    var blogPostId = HvComment.BlogPostId;
    var mappingRegion = { "Ha Noi": "Hà Nội" };
    if (HvComment.Language == undefined || HvComment.Language === {}) {
        HvComment.Language = {
            Abuse: "Abuse",
            Abused: "Abused",
            Like: "Like",
            UnLike: "UnLike",
            DisLike: "DisLike",
            UnDisLike: "UnDisLike",
            ValidComment: "Content comments are not allowed Available!",
            ProfileTitle: "Your information",
            FullNameRequired: "Username required!",
            EmailRequired: "Email required!",
            EmailIsValid: "Email address is not valid!",
            NotifySuccessfully: "Thank you for submitting your comment, your comment will be approved in the shortest time!",
            FullNamePlaceholder: "Name (Displayed)",
            EmailPlaceholder: "Email (not displayed on the page)",
        }; // default
    }
    var getCommentsSrv = new Services('comment/getview', { blogPostId: blogPostId, Skip: HvComment.Skip, Take: HvComment.Take },
        function(dt) {
            var currentId, replyfor;
            var commentData = [];
            var svrLikeReportAbuseComment = new Services('comment/postlikeorabuse', { }, function() {
            });
            for (var j in HvComment.DatasCollection) commentData.push(HvComment.DatasCollection[j]);
            if (dt.length == 0) {
                HvComment.TotalCount = 0;
                HvComment.TotalSubCount = 0;
            }
            for (var i in dt) {
                commentData.push(dt[i]);
                HvComment.DatasCollection.push(dt[i]);
                HvComment.Skip++;
                if (i == 0) HvComment.scrollToElement = dt[i].Id;
            }

            var commentBase = function() {
                return {
                    Id: (new Date().getTime() + HVHelper.getRandom()) * -1,
                    FullName: "",
                    OtherInformation: "",
                    Email: "",
                    Avatar: "#",
                    CommentText: "",
                    LikeNumbers: -1,
                    DisLikeNumbers: 0,
                    CreatedTime: new Date(),
                    AbuseNumbers: 0
                };
            };

            var commentsModel = function(comments) {
                var self = this;
                self.comments = ko.observableArray(ko.utils.arrayMap(comments, function(comment) {
                    return {
                        Id: comment.Id,
                        FullName: comment.FullName,
                        Avatar: comment.Avatar,
                        CommentText: comment.CommentText,
                        OtherInformation: comment.OtherInformation,
                        CreatedTime: comment.CreatedTime,
                        LikeNumbers: comment.LikeNumbers,
                        DisLikeNumbers: comment.DisLikeNumbers,
                        AbuseNumbers: (comment.AbuseNumbers == 0 ? HvComment.Language["Abuse"] : HvComment.Language["Abused"]),
                        Replies: ko.observableArray(comment.Replies)
                    };
                }));

                self.like = function(e) {
                    if (e.Id < 0) {
                        return;
                    }
                    var likeObj = $("#like-" + e.Id);
                    var likeNumber = parseInt(likeObj.html());
                    var likeTag = 'like';
                    if (likeObj.attr('unlike') == "true") {
                        likeTag = 'unlike';
                        likeObj.html(likeNumber - 1).attr('unlike', "");
                        $("#like-action-" + e.Id).html(HvComment.Language["Like"]);
                    } else {

                        likeObj.html(likeNumber + 1).attr('unlike', true);
                        $("#like-action-" + e.Id).html(HvComment.Language["UnLike"]);
                    }
                    svrLikeReportAbuseComment.post({ Id: e.Id, Tags: likeTag });

                };

                self.dislike = function(e) {

                    if (e.Id < 0) {
                        return;
                    }

                    var disLikeObj = $("#dislike-" + e.Id);
                    var disLikeNumber = parseInt(disLikeObj.html());
                    var likeTag = 'dislike';
                    if (disLikeObj.attr('undislike') == "true") {
                        likeTag = 'undislike';
                        disLikeObj.html(disLikeNumber - 1).attr('undislike', "");
                        $("#dislike-action-" + e.Id).html(HvComment.Language["DisLike"]);

                    } else {

                        disLikeObj.html(disLikeNumber + 1).attr('undislike', true);
                        $("#dislike-action-" + e.Id).html(HvComment.Language["UnDisLike"]);
                    }
                    svrLikeReportAbuseComment.post({ Id: e.Id, Tags: likeTag });

                };

                self.abuse = function(e) {
                    if (e.Id < 0) {
                        return;
                    }
                    $("#abuse-action-" + e.Id).html(HvComment.Language["Abused"]).attr('id', "");
                    svrLikeReportAbuseComment.post({ Id: e.Id, Tags: 'abuse' });
                };


                self.addReply = function(comment) {

                    currentId = comment.Id;
                    var reply = HVHelper.cloneObject(new commentBase());

                    if (replyfor)
                        reply.CommentText = replyfor;
                    else reply.CommentText = "";
                    reply.ParentId = currentId;

                    comment.Replies.push(reply); HvComment.translate();
                    setTimeout(function() {
                        $('html, body').animate({ scrollTop: jQuery('#main-editer' + reply.Id).offset().top - 75 }, 500);
                        
                    }, 200);

                };

                self.pendingStatus = function(commentText) {
                    return "<b style='color:red'>" + commentText + "</b>";
                };

                self.submitComment = function() {

                    var acceptComment = HVHelper.cloneObject(new commentBase());
                    window.vaildField($("#comment-text").html(), function(datas) {
                        for (var k in datas) {
                            acceptComment[k] = datas[k];
                        }
                        acceptComment["blogPostId"] = blogPostId;
                        acceptComment["Replies"] = ko.observableArray([]);
                        var svrAddComment = new Services('comment/postnew', { }, function(ref) {
                            if (ref.indexOf("|") == -1) {
                                alert(ref);
                                return;
                            }
                            acceptComment.CreatedTime = ref.split("|")[1];
                            self.comments.reverse();
                            acceptComment["LikeNumbers"] = -1;
                            acceptComment["CommentText"] = self.pendingStatus(acceptComment["CommentText"]);
                            acceptComment.Avatar = ref.split("|")[2];
                            self.comments.push(acceptComment);
                            self.comments.reverse();
                            $("#comment-text").html('');
                            bindTimeAgo();
                            statusComments("complete");

                        });
                        svrAddComment.post(acceptComment);

                    });

                };


                self.submitReply = function(comment) {

                    var acceptComment = HVHelper.cloneObject(comment);
                    window.vaildField($("#main-editer" + comment.Id).html(), function(datas) {
                        for (var k in datas) {
                            acceptComment[k] = datas[k];
                        }
                        acceptComment["blogPostId"] = blogPostId;
                        comment["Id"] = comment.Id * -1;
                        acceptComment["Id"] = currentId;

                        var svrReplyComment = new Services('comment/postreply', { }, function(ref) {
                            $.each(self.comments(), function() {
                                if (acceptComment.Id == this.Id) {
                                    acceptComment.CreatedTime = ref.split("|")[1];
                                    this.Replies.remove(comment);
                                    acceptComment["LikeNumbers"] = -1;
                                    acceptComment["CommentText"] = self.pendingStatus(acceptComment["CommentText"]);
                                    acceptComment.Avatar = ref.split("|")[2];
                                    this.Replies.push(acceptComment);
                                }
                            });
                            statusComments("complete");
                        });

                        svrReplyComment.post(acceptComment);
                    });
                };

                self.cancelReply = function(comment) {
                    $.each(self.comments(), function() {
                        this.Replies.remove(comment);
                    });
                };
            };

            var wrapperComments = jQuery("#comment-wrapper");


            window.triggerReply = function(e) {
                replyfor = '<a contenteditable="false" style="white-space: nowrap;  background: #eee;  border: 1px solid #ddd;  -webkit-border-radius: 2px;  border-radius: 2px;  display: inline-block;  font: normal 13px/1.4 Roboto,arial,sans-serif;  margin: 0 1px;  padding: 0 1px;  vertical-align: baseline;  color: #427fed;margin-right: 6px;">@' + $(e).attr('href').replace("#", "") + ':</a></br>';
                $('#' + $(e).attr('name')).trigger("click");
                replyfor = undefined;
            };

            

            window.vaildField = function(commentText, passAll) {
                statusComments("pending");
                if (commentText == "") {
                    HVHelper.Notify("error", HvComment.Language["ValidComment"]);
                    window.statusComments("cancel");
                    return;
                } else {
                    HvHelpers.getLocation(function(ret) {
                        var profiles = {
                            CommentText: commentText,
                            OtherInformation: mappingRegion[ret.Region],
                            Ip: ret.Ip
                        };
                        var getProfiles = function() {
                            profiles["Email"] = HvComment.Credits["Email"];
                            profiles["FullName"] = HvComment.Credits["FullName"];

                            return profiles;
                        };

                        HVGetFiles.Htm('/gadgets/comment/getprofiles.htm', function(html) {
                            HVGetFiles.Script('/content/plugins/hv-modal/js/hv.interface.js', function() {
                                HvInterface.showModal({ title: HvComment.Language['ProfileTitle'] + ':', content: html, cover: ".page-inner" }, function (modal) {
                                    HvComment.translate();
                                    modal.setStyle({ 'width': '420px', 'left': '-199px', 'top': window.scrollY + 200, 'margin-left': '48%' });
                                    if (HvComment.Credits == null) {
                                        var profilesSaved = window.localStorage.getItem("Profiles");
                                        if (profilesSaved != null) {
                                            HvComment.Credits = {
                                                FullName: profilesSaved.split("|")[0],
                                                Email: profilesSaved.split("|")[1]
                                            };
                                        }
                                    }
                                    if (HvComment.Credits) {

                                        $("#txt-fullname").val(HvComment.Credits["FullName"]);
                                        $("#txt-email").val(HvComment.Credits["Email"]);

                                    } else {
                                        HvComment.Credits = { };
                                        $("#btt-earse").hide();
                                    }

                                    modal.btnClose.click(function() {
                                        window.statusComments("cancel");
                                    });

                                    $("#btt-complete").bind("click", function() {
                                        HvComment.Credits = {
                                            Email: $("#txt-email").val(),
                                            FullName: $("#txt-fullname").val()
                                        };
                                        window.localStorage.setItem("Profiles", (HvComment.Credits["FullName"] + "|" + HvComment.Credits["Email"]));

                                        if (HvComment.Credits["FullName"] == "") {
                                            $("#error_fullname").html( HvComment.Language["FullNameRequired"]);
                                            return;
                                        } else if (HvComment.Credits["Email"] == "") {
                                            $("#error_email").html(HvComment.Language["EmailRequired"]);
                                            $("#error_fullname").html("");
                                            return;
                                        } else if (!HVHelper.ValidEmail(HvComment.Credits["Email"])) {
                                            $("#error_email").html(HvComment.Language["EmailIsValid"]);
                                            return;
                                        } else {
                                            $("#error_email").html("");
                                            modal.remove();
                                            setTimeout(function() {
                                                if (passAll) passAll(getProfiles());
                                            }, 1200);
                                        }
                                    });

                                    $("#btt-earse").bind("click", function (e) {
                                        e.preventDefault();
                                        $("#txt-email").val("");
                                        $("#txt-fullname").val("");
                                        //window.localStorage.removeItem("Profiles");
                                    });

                                });
                            });
                        }, 'no-cache');
                    });
                    return;
                }
            };

            window.statusComments = function(status) {
                if (status == "pending")
                    wrapperComments.css("opacity", "0.1");
                else {
                    wrapperComments.css("opacity", "1");
                    if (status != "cancel")
                        HVHelper.Notify("notice", HvComment.Language["NotifySuccessfully"]);
                }
            };

            var bindTimeAgo = function() {
                if (jQuery("time.timeago").length > 0) {
                    HVGetFiles.Script("/Scripts/jquery.timeago.js", function() {
                        jQuery("time.timeago").timeago();
                    });
                }
            };

            ko.applyBindings(new commentsModel(commentData), document.getElementById('comment-wrapper'));
            bindTimeAgo();
            HvComment.translate();
            wrapperComments.show();

            if (HvComment.theN2d != undefined) {
                HVHelper.scrollTo(jQuery('#reply-action-' + HvComment.scrollToElement).offset().top - 120);
            } else HvComment.theN2d = true;

            var updatedStatus = function() {
                var stillCount = HvComment.TotalCount - (HvComment.Skip);
                $("#hv-still").html(stillCount);
                $("#hv-count").html(HvComment.TotalCount);
                HvComment.CountChanges(HvComment.TotalCount);
                if (stillCount <= 0) {
                    jQuery("#comment-view-more").hide();
                }
            };

            if (HvComment.TotalCount == undefined) {
                var getCountSrv = new Services('comment/getCount', { blogPostId: blogPostId }, function(ret) {
                    HvComment.TotalCount = ret;
                    updatedStatus();
                });
                getCountSrv.get();

            } else updatedStatus();

        });

    getCommentsSrv.get();

};
HvComment.getMore = function () {
    $("#comment-wrapper").css("opacity", 0.2);
    HvComment.Start();
};
HvComment.CountChanges = function (count) { $("#comment-count").html(count); };