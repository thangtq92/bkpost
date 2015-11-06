

HvModal = Class.extend({

    init: function () {
        this.suffixId = new Date().getTime();
    },

    title: function (title, src, extstyles) {
        var styles = extstyles || "height: 30px;width: 30px;margin-top: 4px;margin-left: -10px;";
        styles += "position: absolute;";
        return "<img style='" + styles + "' src='" + HVConfigs.host + '/' + src + "' /><span style='font-size: 15px;margin-left: 28px;'>" + title + "</span>";
    },

    createFrame: function (customs) {
        if (document.body != null) {
            var divId = 'warrper-' + this.suffixId + '-modal';
            $("body, html").append("<div id=" + divId + "></div>");

            $('#' + divId).html(this.toHtml(customs));

            this.bg = $('#hv-modal-' + this.suffixId + '-bg');
            this.obj = $('#hv-modal-' + this.suffixId);
            this.header = $('#hv-modal-' + this.suffixId + '-title');
            this.content = $('#hv-modal-' + this.suffixId + '-content');
            this.btnClose = this.obj.find('#hv-modal-' + this.suffixId + '-close');
        }
        this.addEvent();
    },

    render: function (header, content, tag, neo, cover, customsFrame, extclasses) {
       
        this.createFrame(customsFrame || { extstyles: {} });
        this.tag = tag;
        this.cover = cover;
        this.bg.animate({ opacity: 0.9 }, 0).fadeIn(500);
        this.obj.fadeIn(1000).autoCenterpage(300);
        if (extclasses) this.obj.addClass(extclasses);
        
        try {
            this.obj.draggable({
                cancel: ".hv-modal-content", handle: ".hv-modal-header",
            });
        } catch (ex) { }

        switch (tag) {
            case "forUser":

            default:
                this.loadContent(header, content, cover);
                break;
        }
        if (isNaN(neo)) {
            var self = this;
            setTimeout(function () {
                self.obj.css({
                    'top': ($.getTop(neo) + "px")
                });
            }, 200);
        } else {
            var top = neo;
            this.obj.css({
                'top': (top + "px")
            });
        }
        this.bg.height($.getDocHeight());
    },

    addEvent: function () {

        var self = this;
        this.btnClose.click(function () {
            self.remove();
        });
        this.bg.click(function () {
            self.btnClose.click();
        });
        $(document).keyup(function (e) {
            if (e.keyCode == 27) {
                self.btnClose.click();
            }
        });
        return false;
    },


    toHtml: function (customs) {
        var styleP = customs.extstyles.p || "";
        var styleC = customs.extstyles.c || "";

        var classD = "hv-modal-header";
        if (customs.extclasses) {
            classD = customs.extclasses;
        }
        return '<div id="hv-modal-' + this.suffixId + '-bg" class="hv-modal-bg"></div>' +
            '<div style="' + styleP + '" id="hv-modal-' + this.suffixId + '" class="hv-modal">' +
            '<div class="' + classD + '" ><span id="hv-modal-' + this.suffixId + '-title" >..</span><span id="hv-modal-' + this.suffixId + '-close" class="hv-modal-close" title="Close"></span></div>' +
            '<div style="' + styleC + '" id="hv-modal-' + this.suffixId + '-content"  class="hv-modal-content scroll">' +
            '</div></div>';
    },

    loadContent: function (heardText, contentData) {
        this.header.html(heardText);
        this.content.html(contentData);

        if (this.cover) {
            this.cover = $(this.cover);
            this.cover.heightOrigin = this.cover.height();
            //this.cover.css('height', this.content.height());
        }
    },

    getContent: function () {
        return 'hv-modal-' + this.suffixId + '-content';
    },

    setStyle: function (extStyles) {
        this.obj.css(extStyles);
    },

    remove: function () {
        this.bg.fadeOut(1000);
        var self = this;
        this.obj.fadeOut(1000, function () {
            $('#warrper-' + self.suffixId + '-modal').remove();
        });
        if (this.cover) {
            //this.cover.css('height', this.cover.heightOrigin - 99);
        }
    },

    removeScroll: function () {
        this.content.removeClass('scroll');
        this.content.css({ 'overflow': 'hidden' });
    }
});



$.fn.autoCenterpage = function (marginleftpx) {
    this.each(function () {
        var marginleft = $("body").offset().left + marginleftpx + 'px';
        $(this).css({
            'position': 'absolute',
            'margin-left': marginleft,
            'left': 0
        });
        return this;
    });
};

$.getDocHeight = function () {
    var d = document;
    return Math.max(Math.max(d.body.scrollHeight, d.documentElement.scrollHeight), Math.max(d.body.offsetHeight, d.documentElement.offsetHeight), Math.max(d.body.clientHeight, d.documentElement.clientHeight));
};

$.getTop = function (ele) {
    return $(ele).offset().top;
};
$.getLeft = function (ele) {
    return $(ele).offset().left;
};
$.getTopLeft = function (ele) {
    return $(ele).offset();
};
