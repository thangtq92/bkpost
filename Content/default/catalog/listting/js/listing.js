// Override Ko:

var NBList = window.NBList || {};
NBList.getLs = function (key, valueDefault) {

    var result = window.localStorage.getItem(window.location.pathname + "-" + key);
    if (result == null)
        return valueDefault;
    else {
        if (key == "filterValuesFix") return JSON.parse(result);
        else if (key == "tags" || key == "filterValues") return result.split(",");
        return result;
    }

};

NBList.setLs = function (key, value) {
    if (typeof value == "object")
               value = JSON.stringify(value);
    window.localStorage.setItem(window.location.pathname + "-" + key, value);
};

NBList.DataGridAjax = (function () {
    var getListApi = '';

    function dataGridAjax(api, categoryId, pageSizeInit, renderTo) {
        var preload = setTimeout(function () {
            $("#nb-list-wrapper").show(); clearTimeout(preload);
        });
        var params = {};
        params.pageSize = NBList.getLs("pageSize", pageSizeInit);
        params.pageIndex = NBList.getLs("pageIndex", 1);
        params.searchBy = NBList.getLs("searchBy", "");
        params.tags = NBList.getLs("tags", []);
        params.sortType = NBList.getLs("sortType", "price-desc"); // norder_desc/price_asc/price_desc/product_desc/view_desc
        params.filterValues = NBList.getLs("filterValues", []);
        params.filterValuesFix = NBList.getLs("filterValuesFix", { CategoryId: categoryId });

        var self = this;

        self.url = window.location.href.split("?")[0];
        self.renderTo = renderTo;

        getListApi = api.list;

        self.GridParams = {
            searchBy: ko.observable(params.searchBy),
            pageIndex: ko.observable(params.pageIndex),
            pageSize: ko.observable(params.pageSize),
            tags: ko.observableArray(params.tags),
            filterValues: ko.observableArray(params.filterValues),
            filterValuesFix: ko.observable(params.filterValuesFix),
            sortType: ko.observable(params.sortType),
            totalRows: ko.observable(0),
            totalPages: ko.observable(0),
            requestedPage: ko.observable(0)
        };

        self.pageSizeOptions = [3, 6, 9, 12, 15, 30];

        self.Processing = ko.observable(false);

        self.DataRows = ko.observableArray();

        self.DataColumns = ko.observableArray();

        self.filterValueHanlder = function () {
    
            $.each($(".bg-img-attr"), function (k, v) {
                var me = $(v);
                if (me.find('input').is(":checked")) {
                    me.addClass("active").prepend('<i class="fa fa-close"></i>');
                }
                else {
                    me.removeClass("active").find('i').remove();
                }
            });
        };

        self.Changes = function (status) {

            switch (status) {
                case "filterValues":
                    self.filterValueHanlder();
                    break;
                default:
                    
                    break;
            }
            self.GridParams.pageIndex(1);
            self.GridParams.requestedPage(1);
            self.GetData();
        };

        self.Total = ko.observable("");

        self.SelectedPageSizeOption = ko.observable(params.pageSize);
        self.GridParams.tags.subscribe(self.Changes, self);
        self.GridParams.filterValues.subscribe(function () { self.Changes("filterValues"); }, self);
        self.GridParams.requestedPage.subscribe(self.FlipPageDirect, self);
        self.SelectedPageSizeOption.subscribe(self.ChangePageSize, self);
        
        setTimeout(function () {
            self.filterValueHanlder();
        }, 200);
    }

    dataGridAjax.prototype.GetData = function () {
        var self = this;
        if (self.Processing() == true) return;
            self.Processing(true); HvHelpers.loading.forceHide = true;
        if (!self.srvGet) {
            var params = {};
            for (var i in self.GridParams) {
                var val;
                if (typeof self.GridParams[i] == 'function') {

                    val = self.GridParams[i]();
                    if (typeof val == "object") {

                        if (JSON.stringify(val) == "{}") {
                            val = undefined;
                        }
                        else if (i == "tags" || i == "filterValues") {
                            if (i == "filterValues") {
                                val.sort();
                                val.sort(function (a, b) {
                                    return a.split('_')[1] - b.split('_')[1];
                                });
                            }
                            if (val[0] == "") val = val.splice(0, 1);
                                val = val.join(",");
                        }
                        else {
                            for (var ik in val) {
                                if (val[ik] == "") val[ik] = undefined;
                            }
                        }
                    }
                }
                else val = self.GridParams[i];

                if (val != "") params[i] = val;
                if (i == "pageSize" || i == "pageIndex" || i == "searchBy" || i == "sortType" || i == "filterValuesFix" || i == "tags" || i == "filterValues")
                    NBList.setLs(i, val);
            }
            var data = params.filterValuesFix; delete params.filterValuesFix;
            params = self.pushState(params);
            self.srvGet = new Services(getListApi, params, $.proxy(self.OnGetDataDone, this));
            self.srvGet.post(data);
        }
    };

    dataGridAjax.prototype.pushState = function (params) {

        var self = this;
        delete params.totalRows;
        delete params.totalPages;
        delete params.requestedPage;
        //history.pushState(null, null, self.url + "?" + decodeURIComponent($.param(params)));

        return params;

    };

    dataGridAjax.prototype.deleteItem = function (item) {
        $("#" + item.Id).remove();
    };

    dataGridAjax.prototype.OnGetDataDone = function (ref) {

        var self = this;
        self.DataRows(ref.Data);
        self.GridParams.totalRows(ref.Total);
        var totalPages = Math.ceil(self.GridParams.totalRows() / self.GridParams.pageSize());
        self.GridParams.totalPages(totalPages);
        if (ref.Total == 0) {
             self.GridParams.requestedPage(0);
        }
        else self.GridParams.requestedPage(self.GridParams.pageIndex());
        self.Total(ref.Total || 0);

        delete self.srvGet;
        self.Processing(false);

        HvHelpers.loading.hide("force");

        //if (typeof "BindImgError" != "undefined") window.BindImgError();


    };

    dataGridAjax.prototype.FlipPage = function (newPageNo) {
        var self = this;
        if (parseInt(newPageNo) > 0 && parseInt(newPageNo) <= self.GridParams.totalPages()) {
            self.GridParams.pageIndex(newPageNo);
            self.GetData();
        }
    };

    dataGridAjax.prototype.FlipPageDirect = function () {
        var self = this;
        var ri = parseInt(self.GridParams.requestedPage());
        if (ri == NaN) {
            self.GridParams.requestedPage(self.GridParams.pageIndex());
            return;
        }
        if (ri > 0 && ri <= self.GridParams.totalPages()) {
            self.GridParams.pageIndex(ri);
            self.GetData();
            return;
        }
        self.GridParams.requestedPage(self.GridParams.pageIndex());
        return;
    };

    dataGridAjax.prototype.ChangePageSize = function () {
        var self = this;
        if (self.GridParams.pageSize() != self.SelectedPageSizeOption()) {
            self.GridParams.pageSize(self.SelectedPageSizeOption());
            self.GridParams.pageIndex(1);
            self.GridParams.requestedPage(1);
            self.GetData();
        }
    };

    dataGridAjax.prototype.Sort = function (event, col, el) {
        event.preventDefault();

        var self = this;
        if (col == "price") {
                var orderby = $(el).attr('class');
                    col = col + "-" + orderby;
                if (orderby == "asc") {
                    $(el).removeClass("asc").addClass("desc")
                          .find("i").removeClass("fa-long-arrow-down").addClass("fa-long-arrow-up");
                }
                else {
                    $(el).removeClass("desc").addClass("asc")
                         .find("i").removeClass("fa-long-arrow-up").addClass("fa-long-arrow-down");
                           
                }
            }
            self.GridParams.sortType(col);
            self.GetData();
    };

    dataGridAjax.prototype.searchKeyboardCmd = function (event) {
        var self = this;
        if (event.keyCode == 13) {
            setTimeout(function () {
                self.GridParams.pageIndex(1);
                self.GridParams.requestedPage(1);
                self.GetData();
            }, 200);
        }
        return false;
    };

    return dataGridAjax;
})();

