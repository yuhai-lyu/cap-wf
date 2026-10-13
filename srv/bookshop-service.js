const cds = require('@sap/cds');

module.exports = cds.service.impl(function () {
  const { Books, Orders, OrderItems } = this.entities;

  this.before('CREATE', 'Orders', async (req) => {
    const { customerName, customerEmail, items } = req.data;

    if (!customerName || !customerEmail) {
      return req.reject(400, 'Customer name and email are required.');
    }
    if (!Array.isArray(items) || items.length === 0) {
      return req.reject(400, 'At least one book is required.');
    }

    const quantities = new Map();
    for (const item of items || []) {
      if (!item.book_ID || !Number.isInteger(item.quantity) || item.quantity < 1) {
        return req.reject(400, 'Each order item must have a book and a positive quantity.');
      }
      quantities.set(item.book_ID, (quantities.get(item.book_ID) || 0) + item.quantity);
    }

    const tx = cds.tx(req);
    const booksById = new Map();
    for (const [bookId, quantity] of quantities) {
      const book = await tx.run(SELECT.one.from(Books).where({ ID: bookId }));
      if (!book) {
        return req.reject(400, `Book ${bookId} does not exist.`);
      }
      if (book.stock < quantity) {
        return req.reject(409, `Not enough stock for "${book.title}". Available: ${book.stock}.`);
      }
      booksById.set(bookId, book);
      await tx.run(UPDATE(Books).set({ stock: book.stock - quantity }).where({ ID: bookId }));
    }

    for (const item of items) {
      const book = booksById.get(item.book_ID);
      item.price = book.price;
    }
    req.data.status = 'forApproval';
  });

  const changeOrderStatus = async (req, status, restoreStock = false) => {
    const { orderID } = req.data;
    if (!orderID) {
      return req.reject(400, 'Order ID is required.');
    }

    const tx = cds.tx(req);
    const order = await tx.run(SELECT.one.from(Orders).where({ ID: orderID }));
    if (!order) {
      return req.reject(404, `Order ${orderID} does not exist.`);
    }
    if (order.status !== 'forApproval') {
      return req.reject(409, `Order ${orderID} cannot be changed from status "${order.status}".`);
    }

    const items = restoreStock
      ? await tx.run(SELECT.from(OrderItems).where({ order_ID: orderID }))
      : [];
    const updatedRows = await tx.run(
      UPDATE(Orders)
        .set({ status })
        .where({ ID: orderID, status: 'forApproval' })
    );
    if (!updatedRows) {
      return req.reject(409, `Order ${orderID} has already been processed.`);
    }

    if (restoreStock) {
      const quantities = new Map();
      for (const item of items) {
        quantities.set(item.book_ID, (quantities.get(item.book_ID) || 0) + item.quantity);
      }
      for (const [bookId, quantity] of quantities) {
        await tx.run(
          UPDATE(Books)
            .set({ stock: { '+=': quantity } })
            .where({ ID: bookId })
        );
      }
    }

    return tx.run(SELECT.one.from(Orders).where({ ID: orderID }));
  };

  this.on('approveOrder', (req) => changeOrderStatus(req, 'approved'));
  this.on('rejectOrder', (req) => changeOrderStatus(req, 'rejected', true));
});
