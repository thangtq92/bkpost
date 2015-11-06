jQuery.fn.extend({
    timeago: function () {
        var self = this;
        return this.each(function () {
            var dt = $(this).attr("datetime");
            if (dt == undefined) dt = $(this).attr("title");
            $(this).text(self.timeExec(dt)).css("display", "inline-block");
        });
    },
    timeExec: function (dateStr) {
        if (!dateStr) {return "";}
        dateStr = $.trim(dateStr);
        dateStr = dateStr.replace(/\.\d\d\d+/,""); // remove the milliseconds
        dateStr = dateStr.replace(/-/,"/").replace(/-/,"/"); //substitute - with /
        dateStr = dateStr.replace(/T/," ").replace(/Z/," UTC"); //remove T and substitute Z with UTC
        dateStr = dateStr.replace(/([\+\-]\d\d)\:?(\d\d)/," $1$2"); // +08:00 -> +0800
        var parsedDate = new Date(dateStr);
        var relativeTo = (arguments.length > 1) ? arguments[1] : new Date(); //defines relative to what ..default is now
        var delta = parseInt((relativeTo.getTime()-parsedDate)/1000);
        delta=(delta<2)?2:delta;
        var r = '';
        if (delta < 60) {
            r = delta + ' giây trước';
        } else if(delta < 120) {
            r = "1' "+ (delta- 60)  +' giây trước';
        } else if(delta < (45*60)) {
            r = (parseInt(delta / 60, 10)).toString() + ' phút trước';
        } else {
            var m;
            if(delta < (2*60*60)) {
                m = (Math.floor(delta/60)-60);
                r = '1 giờ '+ (m <0? '': m +"'")  +' trước';
            } else if(delta < (24*60*60)) {
                var h = (parseInt(delta / 3600, 10));
                m = Math.floor((delta/60)-(h*60));
                r = '' + h + ' giờ '+ (m <0? '': m +"'") +' trước';
            } else { return HvHelpers.getFormatDate(dateStr); }
        }
        return ' ' + r;
    }
});