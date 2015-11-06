HvInterface = {};

HvInterface.showModal = function (configs, custom, instanceId) {
    HVGetFiles.CSS('/Content/plugins/hv-modal/css/hv.modal.css');
    HVGetFiles.Script('/Content/plugins/hv-modal/js/hv.modal.js', function () {
                var modal = instanceId || 'modal-*';
                HvInterface[modal] = new HvModal();
                HvInterface[modal].render(configs.title, configs.content, "", (configs.neo || 100), configs.cover, undefined, configs.extclasses);
                if (custom) custom(HvInterface[modal]);
            });
};

HvInterface.hideModal = function (instanceId) {
    var modal = instanceId || 'popup-*';
    if (HvInterface[modal]) HvInterface[modal].remove();
};


HvInterface.loading = { txt: 'Loading...' };
HvInterface.loading.show = function (insteadTxt) {
    if (insteadTxt) {
        HvInterface.loading.txt = insteadTxt;
        if (HvInterface.loadingInstance) { HvInterface.loadingInstance.remove(); delete HvInterface.loadingInstance; }
    }
    if (!HvInterface.loadingInstance) {
        HvInterface.loadingInstance = jQuery('<div class="ajax-loading-box" ><div id="ajax_loading_message" class="ajax-inner-loading-box">' + HvInterface.loading.txt + '</div></div>');
        jQuery('body').append(HvInterface.loadingInstance);
    } else {
        HvInterface.loadingInstance.show();
    }
};

HvInterface.loading.hide = function () {
    HvInterface.loadingInstance.hide();
};
