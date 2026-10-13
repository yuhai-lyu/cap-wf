sap.ui.define(["sap/ui/core/mvc/Controller"], function (Controller) {
  "use strict";
  return Controller.extend("sap.cap.demo.bookshop.controller.Orders", {
    onBack: function () { this.getOwnerComponent().getRouter().navTo("books"); }
  });
});
