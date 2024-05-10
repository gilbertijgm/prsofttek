sap.ui.define([
    "./BaseController",
    "sap/m/MessageToast",
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (BaseController, MessageToast) {
        "use strict";
        var that;
        return BaseController.extend("com.softtek.academiatkd.controller.DetailAtleta", {
            
            onInit: function () {
                that = this;
                var oRouter = this.getRouter();
                oRouter.getRoute("DetailAtleta").attachPatternMatched(this._onPatternMatched, this);
            },
            _onPatternMatched: function (oEvent) {
                var sAtleta = oEvent.getParameter("arguments").idAtleta;
                var sAcademia = oEvent.getParameter("arguments").idAcademia;
                var sRequestUri = `/AtletaSet(IdAcademia='${sAcademia}',IdAtleta='${sAtleta}')`;
                console.log(sAtleta)
                console.log(sAcademia)
                console.log(sRequestUri)
                // La vinculación debe hacerse después de asegurarse de que los metadatos se carguen correctamente
                var oModel = this.getOwnerComponent().getModel();
                oModel.metadataLoaded().then(function () {
                    this.getView().bindElement({
                        path: sRequestUri,
                        events: {
                            change: this._oBindingChange.bind(this),
                            dataRequested: function () {
                                this.getView().setBusy(true);
                            }.bind(this),
                            dataReceived: function () {
                                this.getView().setBusy(false);
                            }.bind(this)
                        }
                    });
                }.bind(this));

            },

            onUpdateAtleta: function (oEvent) {
                var oButton = oEvent.getSource();
                var oContext = oButton.getBindingContext();
                var oAcademia = oContext.getObject();

                // if (!this.oEditDialog) {
                //     this.oEditDialog = sap.ui.xmlfragment("com.softtek.academiatkd.view.fragments.EditarAcademia", this);
                //     this.getView().addDependent(this.oEditDialog);
                // }
                if (!this.oEditDialog) {
                    this.oEditDialog = sap.ui.xmlfragment("com.softtek.academiatkd.view.fragments.EditAtleta", this);
                    this.getView().addDependent(this.oEditDialog);
                }

                // Establecer los datos de la academia en el formulario de edición
                this.oEditDialog.setModel(new sap.ui.model.json.JSONModel(oAcademia), "AtletaEdit");

                // Abrir el diálogo de edición
                this.oEditDialog.open();
            },
            onAtletaEdit: function (oEvent) {
                let oEntry = oEvent.getSource().getModel("AtletaEdit").getData();
                oEntry.Edad = parseInt(oEntry.Edad);
                oEntry.Peso = parseInt(oEntry.Peso);
                var oDataModel = that.getView().getModel();
                var sIdAtleta = oEntry.IdAtleta;
                var sIdAcademia = oEntry.IdAcademia; // Obtener el ID de la academia a partir de los datos
                var sRequestUri = `/AtletaSet(IdAcademia='${sIdAcademia}',IdAtleta='${sIdAtleta}')`; // Construir la URI con el ID
                
                oDataModel.update(sRequestUri, oEntry, {
                    success: function (oResponse) {
                        var result = oResponse?.results;
                        sap.m.MessageBox.success("Se actualizo correctamente");
                        that.onCerrarAtletaEdit();
                        that.getOwnerComponent().getModel().refresh(true, true);
                        
                    },
                    error: function (oError) {
                        // manejar excepción del servicio
                        sap.m.MessageBox.error("Se generó un error al intentar actualizar");
                    }
                });
            },
            onCerrarAtletaEdit: function () {
                if (this.oEditDialog) {
                    this.oEditDialog.close();
                }
                
            },
            
 
            _oBindingChange: function (oEvent) {
                // debugger
            }
        
    });
});