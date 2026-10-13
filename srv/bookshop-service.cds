using { sap.cap.demo.bookshop as db } from '../db/schema';

@path: '/bookshop'
service BookShopService {
  @readonly
  entity Books  as projection on db.Books;
  entity Orders as projection on db.Orders;

  action approveOrder(orderID: UUID) returns Orders;
  action rejectOrder(orderID: UUID) returns Orders;
}
