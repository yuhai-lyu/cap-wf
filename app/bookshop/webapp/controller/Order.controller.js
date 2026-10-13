sap.ui.define(["sap/ui/core/mvc/Controller", "sap/m/MessageBox"], function (Controller, MessageBox) {
  "use strict";
  return Controller.extend("sap.cap.demo.bookshop.controller.Order", {
    onBack: function () { this.getOwnerComponent().getRouter().navTo("books"); },
    onSubmit: async function () {
      const name = this.byId("customerName").getValue().trim();
      const email = this.byId("customerEmail").getValue().trim();
      const selected = this.getOwnerComponent().getModel("app").getProperty("/selectedBooks");
      if (!name || !email || !selected.length) {
        MessageBox.error("Enter customer details and select at least one book.");
        return;
      }
      const payload = {
        customerName: name,
        customerEmail: email,
        items: selected.map((book) => ({ book_ID: book.ID, quantity: book.quantity }))
      };
      try {
        const response = await fetch("/bookshop/Orders", {
          method: "POST",
          headers: { "Content-Type": "application/json", "Accept": "application/json" },
          body: JSON.stringify(payload)
        });
        if (!response.ok) {
          const error = await response.json().catch(() => ({}));
          throw new Error(error?.error?.message || "The order could not be created.");
        }
        this.getOwnerComponent().getModel("app").setProperty("/selectedBooks", []);
        await this.getOwnerComponent().getModel().refresh();
        MessageBox.success("Order created with status forApproval.", {
          onClose: () => this.getOwnerComponent().getRouter().navTo("orders")
        });
      } catch (error) {
        MessageBox.error(error.message);
      }
    }
  });
});
