import React from 'react';
import OrderList from './OrderList';

const OrderListCompact = ({ maxItems = 5 }) => {
  return (
    <OrderList 
      showHeader={false}
      maxItems={maxItems}
      variant="compact"
    />
  );
};

export default OrderListCompact;
