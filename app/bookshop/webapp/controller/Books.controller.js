sap.ui.define(["sap/ui/core/mvc/Controller", "sap/m/MessageToast"], function (Controller, MessageToast) {
  "use strict";
  return Controller.extend("sap.cap.demo.bookshop.controller.Books", {
    onOrder: function () {
      const table = this.byId("booksTable");
      const selected = table.getSelectedItems().map((item) => {
        const book = item.getBindingContext().getObject();
        return { ID: book.ID, title: book.title, stock: book.stock, quantity: 1 };
      }).filter((book) => book.stock > 0);
      if (!selected.length) {
        MessageToast.show("Select at least one book with available stock.");
        return;
      }
      this.getOwnerComponent().getModel("app").setProperty("/selectedBooks", selected);
      this.getOwnerComponent().getRouter().navTo("order");
    },
    onOrders: function () { this.getOwnerComponent().getRouter().navTo("orders"); }
  });
});
