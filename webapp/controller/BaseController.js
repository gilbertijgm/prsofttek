sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, History) {
        "use strict";
        return Controller.extend("com.softtek.academiatkd.controller.BaseController", {
            getRouter: function () {
                return this.getOwnerComponent().getRouter(); 
            },
            /**
             * Navigates back in browser history or to the home screen
             */
            onBack: function () {
                var oHistory = History.getInstance();
                var oPrevHash = oHistory.getPreviousHash();
                if (oPrevHash !== undefined) {
                    window.history.go(-1);
                } else {
                    this.getRouter().navTo("RouteMain");
                }
            },
        });
    });
