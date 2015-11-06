var stateProvinces = [];
var allShippingMethod, allPaymentMethod;
var wrapper = $(".form-horizontal");
var loading = $(".loading-text");
$(function () {
// CLASS 
    var tabs = $("#check-out-steps");
    var line = $(".b-header__step-line-color");
    var arrow = $(".b-header__step-line-arrow");
var objAddress = function (id, firstName, lastName, email, phoneNumber, stateProvince, district, address1) {
    var self = this;
    this.Id = ko.observable(id);
    this.firstName = ko.observable(firstName).extend({ required: { params: true, message: "*" }, maxLength: { params: 20, message: "Họ đệm yêu cầu từ 2=> 20 ký tự" } });
    this.lastName = ko.observable(lastName).extend({ required: { params: true, message: "*" }, maxLength: { params: 10, message: "Tên yêu cầu từ 2=> 10 ký tự" } });

    this.fullName = ko.computed(function () {
        if (self.lastName()) {
            return self.firstName() + " " + self.lastName();
        }
        return "";
    }, this);

    this.email = ko.observable(email).extend({ email: { params: true, message: "Vui lòng nhập email đúng định dạng!" }, });
    this.phoneNumber = ko.observable(phoneNumber).extend({ required: { params: true, message: "*" }, minLength: { params: 9, message: "Số điện thoại từ 9 số" }, maxLength: { params: 12, message: "Số điện thoại nhỏ hơn 12 số" }, pattern: { params: /^\+?[0-9\-]+\*?$/, message: "Vui lòng nhập số điện thoại đúng định dạng!" } });
    this.stateProvince = ko.observable(stateProvince).extend({ required: true });
    this.stateProvince.subscribe(function () {
        self.district(undefined);
    });
    this.stateProvinceName = ko.observable();

    this.district = ko.observable(district).extend({ required: true });
    this.districtName = ko.computed(function () {

        if (self.district()) {
            var did = self.district().Id;
            if (did == undefined) did = self.district();
            for (var i = 0; i < stateProvinces.length; i += 1) {
                var data = stateProvinces[i];
                for (var j in data.Districts) {
                    if (data.Districts[j].Id === did) {
                        self.stateProvinceName(data.Name);
                        return data.Districts[j].Name;
                    }
                }
            }
        }
        self.stateProvinceName("--");
        return "--";
    }, this);

    this.address1 = ko.observable(address1).extend({ required: true });

    self.valid = ko.validation.group(this, { deep: true });

    //validation.rules['phoneVN'] = {
    //    validator: function (phone, validate) {
    //        if (!validate) return true;
    //        if (typeof (phone) !== 'string') { return false; }
    //        if (utils.isEmptyVal(phone)) { return true; } // makes it optional, use 'required' rule if it should be required
    //        phone = phone.replace(/\s+/g, "");
    //        return validate && phone.length > 9 && phone.match(/^(1-?)?(\([2-9]\d{2}\)|[2-9]\d{2})-?[2-9]\d{2}-?\d{4}$/);
    //    },
    //    message: 'Please specify a valid phone number'
    //};
};

var objShipping = function (method, addressCurrent, addressNew) {
    var self = this; // Scope Trick
    self.flags = ko.observable("current-shipping");
    self.method = ko.observable(method);
    this.methodName = ko.computed(function () {
        for (var i in allShippingMethod) {
            if (allShippingMethod[i]["Id"] == self.method()) {
                if ($.cart)
                    $.cart.shipping_cost(allShippingMethod[i]["Fees"]);
                return allShippingMethod[i]["Name"];
            }
        };
        return "--";
    }, this);
    self.addressCurrent = ko.observable(addressCurrent);
    self.addressNew = ko.observable(addressNew);
    this.address = ko.computed(function () {
        // Knockout tracks dependencies automatically. It knows that fullName depends on firstName and lastName, because these get called when evaluating fullName.
        if (self.flags() == "current-shipping") {
            return self.addressCurrent;
        }
        else return self.addressNew;
    }, this);
};

var objPayment = function (method, addressCurrent, addressNew) {
    var self = this; // Scope Trick
    self.flags = ko.observable("current-payment");
    self.method = ko.observable(method);
    self.methodName = ko.computed(function () {
        for (var i in allPaymentMethod) {
            if (allPaymentMethod[i]["Id"] == self.method()) {
                return allPaymentMethod[i]["Name"];
            }
        };
        return "";
    }, this);
    self.addressCurrent = ko.observable(addressCurrent);
    self.addressNew = ko.observable(addressNew);
    this.address = ko.computed(function () {
        // Knockout tracks dependencies automatically. It knows that fullName depends on firstName and lastName, because these get called when evaluating fullName.
        if (self.flags() == "reuse-payment") {
            return self.addressShipping;
        }
        else if (self.flags() == "current-payment") {
            return self.addressCurrent;
        }
        else {
            return self.addressNew;
        }
        
    }, this);
};

var objRedBilling = function (companyName, taxCode, address) {

    self.companyName = ko.observable(companyName);
    self.taxCode = ko.observable(taxCode);
    self.address = ko.observable(address);
};

var objOrder = function (cart, note, redBilling) {
    var self = this; // Scope Trick
    self.details = cart;
    self.isReady = ko.observable(false);
    self.note = ko.observable(note);
    self.redBilling = ko.observable(redBilling);
    self.redBillingRequire = ko.observable(false);
};

// CLASS viewModelCheckout
var viewModelCheckout = function () {

    var self = this; // Scope Trick
    var addDefault = new objAddress(1, "", "", "", "", 1, 1, "");
    /**
    * Observables
    */
    /**
    * Observable Arrays
    */
    self.stateProvinces = ko.observableArray();
    
    self.shipping = ko.observable(new objShipping(1, addDefault, addDefault));
    self.methodShipping = ko.observableArray();

    self.payment = ko.observable(new objPayment(-1, addDefault, addDefault));
    self.methodPayment = ko.observableArray();

    self.order = ko.observable(new objOrder([], "", new objRedBilling("","","")));

    self.steps = ko.observable();
    self.noAddress = ko.observable(0);
    self.completed = ko.observable();

    self.submitShippingVaild = ko.observable(false);

    self.submitPaymentVaild = ko.observable(false);

    /**
    * Computed Observables
    */
    self.stepsView = ko.computed(function () {
         
        var offset = 0;
        if (self.steps() == 1) {
            offset = 60;
            if (window.IsAuthenticated === "True") {
                self.steps(2); self.completed(2);
                tabs.find('a[data-steps="' + 1 + '"]').addClass("passed");
                offset = 140;
            }
        }
        else if (self.steps() == 2) {
            
            if (self.shipping().flags() == "new-shipping" && !self.shipping().addressNew().isValid()) {
                self.submitShippingVaild(false);
                //return;
            }
            else {
                self.submitShippingVaild(true);
                //clone:
                if ($.checkout.shipping().addressCurrent().fullName() == "") {
                    $.checkout.shipping().addressCurrent($.checkout.shipping().addressNew());
                    $.checkout.shipping().addressCurrent().Id(-99);
                }
            }
            offset = 140;
        }
        else if (self.steps() == 3) {
            
            if (self.payment().flags() == "new-payment" && !self.payment().addressNew().isValid()) {
                self.submitPaymentVaild(false);
                //return;
            }
            else {
                self.submitPaymentVaild(true);
            }
            offset = 323;
            if (self.shipping().flags() == "new-shipping" && !self.shipping().addressNew().isValid()) { return; }
        }
        else if (self.steps() == 4) {

            
            offset = 458;
            if (self.payment().flags() == "new-payment" && !self.payment().addressNew().isValid()) { return; }
        }
        line.css("width", "" + offset + "px");
        arrow.css("left", "" + offset + "px");

        tabs.find('a[data-steps="' + self.steps() + '"]').tab('show').addClass("passed");

    });

    /**
       * Actions
    */
    
    self.processing = function () {
        loading.show();
        wrapper.css("opacity", "0.1");

    };

    self.processCompleted = function () {
        wrapper.css("opacity", "1"); loading.hide();
    };

    self.init = function () {

        self.processing();
        new Services("checkout/get-addresses", { identifier: $("input[name=Identifier]").val() }, function (ret) {
            
            new Services("general/get-method", { type: "Shipping" }, function (shipping) {

                new Services("general/get-method", { type: "Payment" }, function (payment) {
                    
                    self.methodShipping(shipping);
                    self.methodPayment(payment);

                    var addShipping = new objAddress();
                    var addPayment = new objAddress();
                    var addShippingNew = new objAddress(-1);

                    if (ret.length == 1) {

                            addShipping = new objAddress(ret[0].Id, ret[0].FirstName, ret[0].LastName, ret[0].Email, ret[0].PhoneNumber, ret[0].DistrictId,
                                                         ret[0].StateProvinceId, ret[0].Address1);

                       if (ret[0].Address1 == null) {
                                for (var k in addShipping) {
                                    if (k == "Id") {
                                        addShippingNew[k]((parseInt(addShipping[k]()) * -1));
                                    }
                                    else addShippingNew[k] = addShipping[k];
                                }
                                self.noAddress(2); 
                        }
                        else self.noAddress(1);

                        
                    }
                    else if (ret.length > 1) {
                        addShipping = new objAddress(ret[0].Id, ret[0].FirstName, ret[0].LastName, ret[0].Email, ret[0].PhoneNumber, ret[0].DistrictId,
                                                     ret[0].StateProvinceId, ret[0].Address1);

                        addPayment = new objAddress(ret[1].Id, ret[1].FirstName, ret[1].LastName, ret[1].Email, ret[1].PhoneNumber, ret[1].DistrictId,
                                                     ret[1].StateProvinceId, ret[1].Address1);
                    }
                    else {
                        self.noAddress(2);
                    }
                    // Shipping:
                    allShippingMethod = self.methodShipping();

                    self.shipping(new objShipping(-1, addShipping, addShippingNew));

                    // Payment:
                    allPaymentMethod = self.methodPayment();
                    self.payment(new objPayment(1, addPayment, new objAddress(-1)));

                    self.payment().addressShipping = ko.observable(self.shipping().address());

                    if (self.noAddress() == 2) {
                        self.shipping().flags('new-shipping');
                        self.payment().flags('reuse-payment');
                    }
                    else if (self.noAddress() == 1) {
                        self.payment().flags('reuse-payment');
                    }

                    self.processCompleted();
                }).get();

            }).get();

            self.order(new objOrder($.cart, "", new objRedBilling("","","")));

        }, "no-api").get();

    };

    // Whenever the category changes, reset the product selection

    self.submitShipping = function () {
        self.steps(3);
        if(self.completed() < 3) self.completed(3);
    };

    self.submitpayment = function () {
        self.steps(4);
        self.completed(4);
    };

    self.submitOrder = function () {
       
        self.processing(); $('button').attr('disabled', 'disabled');
        var data = JSON.parse(ko.toJSON(self));
        var orderDetails = data["order"]["details"];
        var order = {
            AddressShipping: data["shipping"].address,
            AddressPayment: data["payment"].address,
            ShippingMethodId: (data["shipping"]["method"] * -1),
            PaymentMethodId: data["payment"]["method"],
            OrderTax: orderDetails.tax,
            OrderDiscount: (orderDetails.discount / orderDetails.quantity),
            OrderTotal: orderDetails.total,
            RedBillingRequire: data["order"].redBillingRequire,
            RedBilling: JSON.stringify(data["order"].redBilling),
            OrderNotes: [], OrderItems: []
        };

        for (var i in orderDetails.cart) {
            var dtall = orderDetails.cart[i];
            order.OrderItems.push({ ProductId: dtall.product["id"], Quantity: dtall["quantity"], Price: dtall["cost"], Discount: dtall["saving"], ItemWeight: 0, AttributesSelected: dtall.product["optionValue"].join(",") });
        }

        if (data["order"].note != "") order.OrderNotes.push({ Note: data["order"].note, DisplayToCustomer: true });

        new Services("Checkout", { cuponCode: $.cart.cupon(), identifier : $("input[name=Identifier]").val() }, function (ret) {

            if (ret == "True") window.location.reload();
            else {
                HvHelpers.alert("Quá trình thanh toán lỗi, bạn thử lại");
                self.processCompleted(); $('button').removeAttr('disabled');
            }

        },"no-api").post({ order: order });
    };

    
};

if ($.cart.quantity() == 0) {
    $("body").hide();
    window.location.href = "/";
}
else {
    // Instantiate the viewModelCheckout 
    $.checkout = new viewModelCheckout();
    new Services("general/get-state-province", { isAll: true }, function (ret) {

        stateProvinces = ret;
        ko.validation.registerExtenders();
        $(".checkout-bind-able:not(.cart-bind-able)").each(function () {
            ko.applyBindings($.checkout, this);
        });

        var step = 1;
        if (window.IsAuthenticated === "True") {
            $.checkout.init();
            step = 2;
        }

        $.checkout.steps(step); $.checkout.completed(step);

    }).get();
}

$(".nav-tabs:not(.partial) a").on("click", function (e) {
    
    if ($.checkout.completed() > 2 && $.checkout.steps() <= $.checkout.completed()) {
            $.checkout.steps($(this).data().steps);
        }
        e.preventDefault();
        return false;
});

}(jQuery));


