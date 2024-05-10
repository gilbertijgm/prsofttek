sap.ui.define([
    "./BaseController",
    "sap/ui/core/Element",
    "sap/m/MessageToast"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (BaseController, MessageToast, Dialog, Button) {
        "use strict";
        var that;
        return BaseController.extend("com.softtek.academiatkd.controller.Main", {
            onInit: function () {
                that = this;
                var sImagePath = this.getOwnerComponent().getManifestObject().getComponentName() + "/img/tkd.jpg";
                var sImagePath2 = this.getOwnerComponent().getManifestObject().getComponentName() + "/img/tkdl.jpg";
                var oModel = new sap.ui.model.json.JSONModel({
                    imagePath: sImagePath,
                    imagePath2: sImagePath2
                });
                that.getView().setModel(oModel, "imageModel");

                // var image = this.getOwnerComponent().getManifestObject().getURI('./images/tkd.jpg')
                // this.getAcademias(); 
                // this._crudApp();   
                var oRouter = this.getRouter();
                oRouter.getRoute("RouteMain").attachPatternMatched(this._onPatternMatched, this); 
            },
            _onPatternMatched: function () {
                let oTable = this.getView().byId("gridList");
                oTable.removeSelections();
            },

            // _crudApp: function () {
            //     var oDataModel = this.getOwnerComponent().getModel();
            //     oDataModel.attachRequestCompleted(this.__handleRequestCompleted);
            // },
            __handleRequestCompleted: function (oEvent) {
                MessageToast.show("Completado");
            },
            /******* CRUD ACADEMIA INICIO ****************** */
            onCreateAcademia: function (oEvent) {
                if (!this.oCreateFragment) {
                    this.oCreateFragment =
                        sap.ui.core.Fragment.load({
                            name: "com.softtek.academiatkd.view.fragments.CrearAcademia",
                            controller: that
                        }).then(function (oDialog) {
                            that.getView().addDependent(oDialog);
                            let oModel = new sap.ui.model.json.JSONModel({
                                "Nombreaca": "",
                                "Pais": "",
                                "Provincia": "",
                                "Localidad": "",
                                "DireccionAcademia": "",
                                "TelefonoAca": ""
                            })
                            oModel.setDefaultBindingMode("TwoWay");
                            oDialog.setModel(oModel, "AcademiaCreate");
                            oDialog.attachAfterClose(that._afterCloseDialog);
                            return oDialog;
                        }.bind(that));
                }
                that.oCreateFragment.then(function (oDialog) {
                    oDialog.open();
                }.bind(that));

            },
            _afterCloseDialog: function (oEvent) {
                oEvent.getSource().destroy();
                that.oCreateFragment = null;
            },

            validacionCreateAcademia: function (oData) {
                // Verificar si los campos obligatorios están llenos
                if (!oData.Nombreaca || !oData.Pais || !oData.Provincia || !oData.Localidad || !oData.DireccionAcademia || !oData.TelefonoAca) {
                    // Al menos uno de los campos obligatorios está vacío
                    return false;
                }
                return true;
            },
            onCrearAcademias: function (oEvent) {
                let oEntry = oEvent.getSource().getModel("AcademiaCreate").getData();
                // Validar los campos del academia
                if (!this.validacionCreateAcademia(oEntry)) {
                    sap.m.MessageBox.error("Por favor, complete todos los campos obligatorios.");
                    return;
                }
                var oDataModel = that.getView().getModel();
                oDataModel.create("/AcademiaSet", oEntry, {
                    success: function (oResponse) {
                        var result = oResponse?.results;
                        sap.m.MessageBox.success("Se generó un nuevo DOJAN");
                        that.oCreateFragment.then(function (oDialog) {
                            oDialog.close();
                        });
                        that.getOwnerComponent().getModel().refresh(true, true);
                        that.onCerrarCrearAcademias();

                    },
                    error: function (oError) {
                        //manejar exepciones
                        sap.m.MessageBox.error("Se generó un error al intentar crear un nuevo DOJAN");
                    }
                })
            },
            onCerrarCrearAcademias: function (oEvent) {
                that.oCreateFragment.then(function (oDialog) {
                    oDialog.close();
                }.bind(that));
            },

           
            onDeleteAcademia: function (oEvent) {
                var that = this;
                var sPath = oEvent.getSource().getBindingContext().getPath();

                sap.m.MessageBox.confirm("¿Estás seguro que deseas eliminar la academia?", {
                    title: "Confirmación",
                    onClose: function (oAction) {
                        if (oAction === sap.m.MessageBox.Action.OK) {
                            var oDataModel = that.getOwnerComponent().getModel();
                            oDataModel.remove(sPath, {
                                success: function (oResponse) {
                                    sap.m.MessageToast.show("Se eliminó correctamente la academia");
                                    that.getOwnerComponent().getModel().refresh(true, true);
                                },
                                error: function (oError) {
                                    sap.m.MessageBox.error("Error al eliminar la academia");
                                }
                            });
                        }
                    }
                });
            },



            getAcademias: function () {
                var that = this;
                var oDataModel = this.getOwnerComponent().getModel();
                oDataModel.read("/AcademiaSet", {
                    async: false,
                    success: function (oResponse) {
                        var aAcademias = oResponse.results; // Obtener los datos de la respuesta
                        that.getView().getModel("academiasModel").setProperty("/AcademiaSet", aAcademias); // Asignar los datos al modelo del controlador
                    },
                    error: function (oError) {
                        MessageToast.show("Error al leer los datos")
                    }
                })
            },
            /******* CRUD ACADEMIA FIN ****************** */

            /******* FILTROS ACADEMIA INICIO ****************** */
            onSearch: function (oEvent) {
                var aFilters = [];
                var sNombreAca;
                var sPais;
                var sProvincia;
                var sLocalidad;

                var aSelectionSet = oEvent.getParameter("selectionSet");

                aSelectionSet.forEach(x => {
                    switch (x.getName()) {
                        case "Nombreaca":
                             sNombreAca = x.getValue();
                            break;
                        case "Pais":
                             sPais = x.getValue();
                            break;
                        case "Provincia":
                             sProvincia = x.getValue();
                            break;
                        case "Localidad":
                             sLocalidad = x.getValue();
                            break;
                        default:
                    }
                })

                if (sNombreAca) {
                    let oFilterNombreAca = new sap.ui.model.Filter({
                        path: 'Nombreaca',
                        operator: 'EQ',
                        value1: sNombreAca
                    })
                    aFilters.push(oFilterNombreAca)
                }
                if (sPais) {
                    let oFilterPais = new sap.ui.model.Filter({
                        path: 'Pais',
                        operator: 'EQ',
                        value1: sPais
                    })
                    aFilters.push(oFilterPais)
                }
                if (sProvincia) {
                    let oFilterProvincia = new sap.ui.model.Filter({
                        path: 'Provincia',
                        operator: 'EQ',
                        value1: sProvincia
                    })
                    aFilters.push(oFilterProvincia)
                }
                if (sLocalidad) {
                    let oFilterLocalidad = new sap.ui.model.Filter({
                        path: 'Localidad',
                        operator: 'EQ',
                        value1: sLocalidad
                    })
                    aFilters.push(oFilterLocalidad)
                }

                this.getView().byId("gridList").getBinding("items").filter(aFilters);
            },
            /******* FILTROS ACADEMIA FIN ****************** */

            onExit: function () {

            },
            onBeforeRendering: function () {

            },
            onSelectionItem: function (oEvent) {
                let oTable = oEvent.getSource();
                var oSelected = oTable.getSelectedItem();
                var sAcademia = oSelected.getBindingContext().getProperty("IdAcademia");
                this.getRouter().navTo("Detail", {
                    idAcademia: sAcademia,
                });
            },
            onAfterRendering: function () {

            }
        });
    });
