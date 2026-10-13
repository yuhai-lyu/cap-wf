using { sap.cap.demo.bookshop as db } from '../db/schema';

@path: '/bookshop'
service BookShopService {
  @readonly
  entity Books  as projection on db.Books;
  @bpm.process.start: {
    id: 'us10.bd31c2a7trial.salesorderapproval.salesOrderApproval', // 从 SBPA 导入的 ID
    on: 'CREATE',
    inputs: [
      { path: $self.ID, as: 'orderID' },
      { path: $self.customerEmail, as: 'mail' } // 假设 Orders 实体有这个字段
    ]
  }
  entity Orders as projection on db.Orders;

  action approveOrder(orderID: UUID) returns Orders;
  action rejectOrder(orderID: UUID) returns Orders;
}
