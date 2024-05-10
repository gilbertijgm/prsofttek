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
        return BaseController.extend("com.softtek.academiatkd.controller.Detail", {

            onInit: function () {
                that = this;
                var oRouter = this.getRouter();
                oRouter.getRoute("Detail").attachPatternMatched(this._onPatternMatched, this);
            },
            _onPatternMatched: function (oEvent) {
                let oTable = this.getView().byId("idAtletaTable");
                oTable.removeSelections();


                var sAcademia = oEvent.getParameter("arguments").idAcademia;
                // el enlace debe realizarse después de asegurarse de que los metadatos se carguen correctamente
                let oModel = this.getOwnerComponent().getModel();
                oModel.metadataLoaded().then(function () {
                    this.getView().bindElement({
                        path: `/AcademiaSet('${sAcademia}')`,
                        events: {
                            change: this._oBindingChange.bind(this),
                            dataRequested: function () {
                                that.getView().setBusy(true);
                            },
                            dataReceived: function () {
                                that.getView().setBusy(false);
                            }
                        }
                    });
                }.bind(this));

            },

            /******* CRUD Atleta INICIO ****************** */
            onCreateAtleta: function (oEvent) {
                if (!this.oCreateFragment) {
                    this.oCreateFragment =
                        sap.ui.core.Fragment.load({
                            name: "com.softtek.academiatkd.view.fragments.CrearAtleta",
                            controller: that
                        }).then(function (oDialog) {
                            that.getView().addDependent(oDialog);
                            let oModel = new sap.ui.model.json.JSONModel({
                                "IdAcademia": "",
                                "Dni": "",
                                "NombreAtl": "",
                                "Edad": "",
                                "Genero": "",
                                "Categoria": "",
                                "Peso": "",
                                "Cinturon": "",
                                "Telefono": "",
                            })
                            oModel.setDefaultBindingMode("TwoWay");
                            oDialog.setModel(oModel, "AtletaCreate");
                            oDialog.attachAfterClose(that._afterCloseDialog);
                            return oDialog;
                        }.bind(that));
                }
                that.oCreateFragment.then(function (oDialog) {
                    oDialog.open();
                }.bind(that));

            },

            validacionCreateAtleta: function (oData) {
                // Verificar si los campos obligatorios están llenos
                if (!oData.Dni || !oData.NombreAtl || !oData.Edad || !oData.Genero || !oData.Categoria || !oData.Peso || !oData.Cinturon || !oData.Telefono) {
                    // Al menos uno de los campos obligatorios está vacío
                    return false;
                }
                return true;
            },
            onAtletaCreate: function (oEvent) {
                var sAcademiaId = this.getView().getBindingContext().getProperty("IdAcademia");

                if (sAcademiaId) {
                    let oEntry = oEvent.getSource().getModel("AtletaCreate").getData();

                    // Validar los campos del atleta
                    if (!this.validacionCreateAtleta(oEntry)) {
                        sap.m.MessageBox.error("Por favor, complete todos los campos obligatorios.");
                        return;
                    }

                    // Predefinir el campo de ID de la academia en el modelo de datos del formulario
                    oEntry.IdAcademia = sAcademiaId;

                    oEntry.Edad = parseInt(oEntry.Edad);
                    oEntry.Peso = parseInt(oEntry.Peso);
                    var oDataModel = that.getView().getModel();
                    oDataModel.create("/AtletaSet", oEntry, {
                        success: function (oResponse) {
                            var result = oResponse?.results;
                            sap.m.MessageBox.success("Se generó un nuevo Atleta");
                            that.oCreateFragment.then(function (oDialog) {
                                oDialog.close();
                            });
                            that.getOwnerComponent().getModel().refresh(true, true);
                            that.onCerrarAtletaCreate();

                        },
                        error: function (oError) {
                            //manejar exepciones
                            sap.m.MessageBox.error("Se generó un error al intentar crear un nuevo Atleta");
                        }
                    })
                }


            },

            _afterCloseDialog: function (oEvent) {
                oEvent.getSource().destroy();
                that.oCreateFragment = null;
            },

            onCerrarAtletaCreate: function (oEvent) {
                that.oCreateFragment.then(function (oDialog) {
                    oDialog.close();
                }.bind(that));
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

            onDeleteAtleta: function (oEvent) {
                var that = this;
                var sPath = oEvent.getSource().getBindingContext().getPath();

                sap.m.MessageBox.confirm("¿Estás seguro que deseas eliminar el Atleta?", {
                    title: "Confirmación",
                    onClose: function (oAction) {
                        if (oAction === sap.m.MessageBox.Action.OK) {
                            var oDataModel = that.getOwnerComponent().getModel();
                            oDataModel.remove(`${sPath}`, {
                                success: function (oResponse) {
                                    sap.m.MessageBox.success("Se eliminó correctamente el Atleta ");
                                    that.getOwnerComponent().getModel().refresh(true, true);
                                },
                                error: function (oError) {
                                    sap.m.MessageBox.error("Error al eliminar el Atleta");
                                }
                            });
                        }
                    }
                });
            },
            /******* CRUD Atleta INICIO ****************** */    

             /******* FILTROS ATLETA INICIO ****************** */
             onSearch: function (oEvent) {
                var aFilters = [];
                var sDni;
                var sNombreAtl;
                var sCategoria;
                var sGenero;
                var sCinturon;

                var aSelectionSet = oEvent.getParameter("selectionSet");

                aSelectionSet.forEach(x => {
                    switch (x.getName()) {
                        case "Dni":
                            sDni = x.getValue();
                            break;
                        case "NombreAtl":
                            sNombreAtl = x.getValue();
                            break;
                        case "Categoria":
                            sCategoria = x.getValue();
                            break;
                        case "Genero":
                            sGenero = x.getValue();
                            break;
                        case "Cinturon":
                            sCinturon = x.getValue();
                            break;
                        default:
                    }
                })

                if (sDni) {
                    let oFiltersDni = new sap.ui.model.Filter({
                        path: 'Dni',
                        operator: 'EQ',
                        value1: sDni
                    })
                    aFilters.push(oFiltersDni)
                }
                if (sNombreAtl) {
                    let oFilterNombreAtl = new sap.ui.model.Filter({
                        path: 'NombreAtl',
                        operator: 'EQ',
                        value1: sNombreAtl
                    })
                    aFilters.push(oFilterNombreAtl)
                }
                if (sCategoria) {
                    let oFilterCategoria = new sap.ui.model.Filter({
                        path: 'Categoria',
                        operator: 'EQ',
                        value1: sCategoria
                    })
                    aFilters.push(oFilterCategoria)
                }
                if (sGenero) {
                    let oFilterGenero = new sap.ui.model.Filter({
                        path: 'Genero',
                        operator: 'EQ',
                        value1: sGenero
                    })
                    aFilters.push(oFilterGenero)
                }
                if (sCinturon) {
                    let oFilterCinturon = new sap.ui.model.Filter({
                        path: 'Cinturon',
                        operator: 'EQ',
                        value1: sCinturon
                    })
                    aFilters.push(oFilterCinturon)
                }

                this.getView().byId("idAtletaTable").getBinding("items").filter(aFilters);
            },
            /******* FILTROS ATLETA FIN ****************** */

            onUpdateAcademia: function (oEvent) {
                var oButton = oEvent.getSource();
                var oContext = oButton.getBindingContext();
                var oAcademia = oContext.getObject();

                // if (!this.oEditDialog) {
                //     this.oEditDialog = sap.ui.xmlfragment("com.softtek.academiatkd.view.fragments.EditarAcademia", this);
                //     this.getView().addDependent(this.oEditDialog);
                // }
                if (!this.oEditDialog) {
                    this.oEditDialog = sap.ui.xmlfragment("com.softtek.academiatkd.view.fragments.EditarAcademia", this);
                    this.getView().addDependent(this.oEditDialog);
                }

                // Establecer los datos de la academia en el formulario de edición
                this.oEditDialog.setModel(new sap.ui.model.json.JSONModel(oAcademia), "AcademiaEdit");

                // Abrir el diálogo de edición
                this.oEditDialog.open();
            },
            onEditAcademia: function (oEvent) {
                let oEntry = oEvent.getSource().getModel("AcademiaEdit").getData();

                var oDataModel = that.getView().getModel();
                var sIdAcademia = oEntry.IdAcademia; // Obtener el ID de la academia a partir de los datos
                var sRequestUri = `/AcademiaSet('${sIdAcademia}')`; // Construir la URI con el ID

                oDataModel.update(sRequestUri, oEntry, {
                    success: function (oResponse) {
                        var result = oResponse?.results;
                        sap.m.MessageBox.success("Se actualizo correctamente");
                        that.onCerrarEditAcademia();
                        that.getOwnerComponent().getModel().refresh(true, true);

                    },
                    error: function (oError) {
                        // manejar excepción del servicio
                        sap.m.MessageBox.error("Se generó un error al intentar actualizar");
                    }
                });
            },
            onCerrarEditAcademia: function () {
                if (this.oEditDialog) {
                    this.oEditDialog.close();
                }

            },


            onSelectionAtletaItem: function (oEvent) {
                // Obtener el ID de la academia desde el contexto de la vista
                var sIdAcademia = this.getView().getBindingContext().getProperty("IdAcademia");

                // Obtener el ID del atleta seleccionado
                let oTable = oEvent.getSource();
                var oSelected = oTable.getSelectedItem();
                var sAtleta = oSelected.getBindingContext().getProperty("IdAtleta");

                // Navegar a la ruta de detalle del atleta
                this.getRouter().navTo("DetailAtleta", {
                    idAcademia: sIdAcademia,
                    idAtleta: sAtleta
                });
            },
            _oBindingChange: function (oEvent) {
                // debugger
            }

        });
    });