export const requirement = 'When an order is placed, notify the vendor, create an invoice, update inventory if the stock is physical, and send a confirmation to the customer.'
export const steps = [
  { id: '01', label: 'Notify Vendor', type: 'FUNCTION', icon: 'Bell', path: '/forms/function/NotifyVendorOnOrder', message: 'Vendor notified successfully', duration: 210 },
  { id: '02', label: 'Create Invoice', type: 'CREATE', icon: 'FilePlus', path: '/forms/formCreate/invoices', message: 'Invoice created successfully', duration: 280 },
  { id: '03', label: 'Update Inventory', type: 'OPERATION', icon: 'Settings2', path: '/forms/operation', message: 'Inventory updated (stock_type: physical)', duration: 340, conditional: true },
  { id: '04', label: 'Send Confirmation', type: 'FUNCTION', icon: 'Send', path: '/forms/function/SendOrderConfirmation', message: 'Confirmation sent to customer', duration: 190 },
]
