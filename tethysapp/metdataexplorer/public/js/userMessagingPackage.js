let notifyOfDanger;
let notifyOfInfo;
let notifyOfSuccess;

notifyOfDanger = function(message) {
    $.notify(
        {
            message: message,
        },
        {
            allow_dismiss: true,
            animate: {
                enter: "nimated fadeInRight",
                exit: "animated fadeOutRight"
            },
            delay: 5000,
            onShow: function () {
                this.css({"width": "auto", "height": "auto", "padding": "0.71em"});
            },
            type: "danger",
            z_index: 20000
        }
    );
};

notifyOfInfo = function(message) {
    $.notify(
        {
            message: message,
        },
        {
            allow_dismiss: true,
            animate: {
                enter: "animated fadeInRight",
                exit: "animated fadeOutRight"
            },
            delay: 5000,
            onShow: function () {
                this.css({"width": "auto", "height": "auto", "padding": "0.71em"});
            },
            type: "info",
            z_index: 20000
        }
    );
};

notifyOfSuccess = function(message) {
    $.notify(
        {
            message: message,
        },
        {
            allow_dismiss: true,
            animate: {
                enter: "animated fadeInRight",
                exit: "animated fadeOutRight"
            },
            delay: 5000,
            onShow: function () {
                this.css({"width": "auto", "height": "auto", "padding": "0.71em"});
            },
            type: "success",
            z_index: 20000
        }
    );
};

export {
    notifyOfDanger,
    notifyOfInfo,
    notifyOfSuccess
};
