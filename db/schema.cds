namespace sap.cap.demo.bookshop;

using { cuid, managed } from '@sap/cds/common';

entity Books {
  key ID    : UUID;
      title : String(200) not null;
      author: String(120);
      price : Decimal(9, 2) not null;
      stock : Integer not null default 0;
}

entity Orders : cuid, managed {
      customerName : String(120) not null;
      customerEmail: String(200) not null;
      status       : String(30) not null default 'forApproval';
      items        : Composition of many OrderItems on items.order = $self;
}

entity OrderItems : cuid {
      order   : Association to Orders not null;
      book    : Association to Books not null;
      quantity: Integer not null;
      price   : Decimal(9, 2) not null;
}
