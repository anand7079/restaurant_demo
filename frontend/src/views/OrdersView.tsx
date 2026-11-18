import { useState, useEffect } from 'react'
import { getOrders, placeOrder, updateOrderStatus, getCurrentMenu } from '../api'
import type { OrderResponse, OrderRequest, OrderItemRequest, OrderStatus, Portion, CurrentMenuItemResponse } from '../api'

export function OrdersView() {
  const [orders, setOrders] = useState<OrderResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(0)
  const [size] = useState(20)
  const [totalPages, setTotalPages] = useState(1)
  const [statusFilter, setStatusFilter] = useState<OrderStatus | ''>('')
  const [selectedStatuses, setSelectedStatuses] = useState<Record<number, OrderStatus>>({})
  const [menuItems, setMenuItems] = useState<CurrentMenuItemResponse[]>([])

  const [showPlaceOrderModal, setShowPlaceOrderModal] = useState(false)
  const [orderItems, setOrderItems] = useState<OrderItemRequest[]>([{ menuItemId: 0, portion: 'FULL', quantity: 1, useOffer: false }])
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')

  useEffect(() => {
    loadMenuItems()
    loadOrders()
  }, [page, statusFilter])

  const loadMenuItems = async () => {
    try {
      const data = await getCurrentMenu()
      setMenuItems(data)
    } catch (e) {
      console.error('Failed to load menu items', e)
    }
  }

  const loadOrders = async () => {
    try {
      setLoading(true)
      const data = await getOrders(page, size, statusFilter || undefined)
      setOrders(data.content)
      setSelectedStatuses(Object.fromEntries(data.content.map(order => [order.id, order.status])))
      setTotalPages(data.totalPages)
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load orders')
    } finally {
      setLoading(false)
    }
  }

  const handleAddOrderItem = () => {
    setOrderItems([...orderItems, { menuItemId: 0, portion: 'FULL', quantity: 1, useOffer: false }])
  }

  const handleRemoveOrderItem = (index: number) => {
    if (orderItems.length <= 1) return
    setOrderItems(orderItems.filter((_, i) => i !== index))
  }

  const handleOrderItemChange = (index: number, field: keyof OrderItemRequest, value: any) => {
    setOrderItems(orderItems.map((item, i) => i === index ? { ...item, [field]: value } : item))
  }

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    const validItems = orderItems.filter(item => item.menuItemId > 0 && item.quantity > 0)
    if (validItems.length === 0) {
      setError('Please add at least one item')
      return
    }
    try {
      const body: OrderRequest = {
        customerName: customerName || null,
        customerPhone: customerPhone || null,
        items: validItems
      }
      await placeOrder(body)
      setShowPlaceOrderModal(false)
      setOrderItems([{ menuItemId: 0, portion: 'FULL', quantity: 1, useOffer: false }])
      setCustomerName('')
      setCustomerPhone('')
      loadOrders()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to place order')
    }
  }

  const handleSubmitStatus = async (order: OrderResponse) => {
    try {
      const newStatus = selectedStatuses[order.id] ?? order.status
      await updateOrderStatus(order.id, newStatus)
      await loadOrders()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update status')
    }
  }

  const handlePrintBill = (order: OrderResponse) => {
    const printWindow = window.open('', '_blank', 'width=800,height=600')
    if (!printWindow) {
      setError('Allow pop-ups to print the bill.')
      return
    }
    const htmlReplacements: Record<string, string> = {
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }
    const escapeHtml = (value: string) => value.replace(/[&<>"']/g, character => htmlReplacements[character])
    const itemsHtml = order.items.map(item => `
      <tr>
        <td>${escapeHtml(item.name)}</td>
        <td>${item.portion}</td>
        <td>${item.quantity}</td>
        <td>${formatPrice(item.unitPrice)}</td>
        <td>${formatPrice(item.totalPrice)}</td>
      </tr>
      ${item.offerApplied ? `<tr><td colspan="5">Offer: ${escapeHtml(item.offerLabel || 'Offer')}</td></tr>` : ''}
    `).join('')
    printWindow.document.open()
    printWindow.document.write(`<!doctype html><html><head><title>Bill #${order.id}</title>
      <style>body{font:14px Arial,sans-serif;margin:32px;color:#111}h1{text-align:center}table{width:100%;border-collapse:collapse;margin-top:24px}th,td{padding:8px;border-bottom:1px solid #ccc;text-align:left}.total{text-align:right;font-size:18px;font-weight:bold;margin-top:20px}</style>
      </head><body><h1>Restaurant Bill</h1><p>Order #${order.id}</p>
      <p>Customer: ${escapeHtml(order.customerName || 'Walk-in')}</p>
      <p>Phone: ${escapeHtml(order.customerPhone || '—')}</p>
      <p>Date: ${escapeHtml(order.createdAt ? new Date(order.createdAt).toLocaleString() : '—')}</p>
      <table><thead><tr><th>Item</th><th>Portion</th><th>Qty</th><th>Unit price</th><th>Total</th></tr></thead>
      <tbody>${itemsHtml}</tbody></table><div class="total">Total: ${formatPrice(order.totalAmount)}</div>
      </body></html>`)
    printWindow.document.close()
    printWindow.focus()
    window.setTimeout(() => printWindow.print(), 300)
  }

  const formatPrice = (price: number) => `₹${price.toFixed(2)}`

  const statusColors: Record<OrderStatus, string> = {
    IN_QUEUE: '#f59e0b',
    ACCEPTED: '#3b82f6',
    PENDING: '#f59e0b',
    CONFIRMED: '#3b82f6',
    PREPARING: '#8b5cf6',
    PREPARED: '#06b6d4',
    READY: '#06b6d4',
    SERVED: '#10b981',
    DELIVERED: '#10b981',
    CANCELLED: '#ef4444'
  }

  const statusOrder: OrderStatus[] = ['IN_QUEUE', 'ACCEPTED', 'PREPARING', 'PREPARED', 'SERVED', 'CANCELLED', 'PENDING', 'CONFIRMED', 'READY', 'DELIVERED']
  const statusLabels: Record<OrderStatus, string> = {
    IN_QUEUE: 'In Queue', ACCEPTED: 'Accepted', PREPARING: 'Preparing', PREPARED: 'Prepared', SERVED: 'Served',
    PENDING: 'Pending', CONFIRMED: 'Confirmed', READY: 'Ready', DELIVERED: 'Delivered', CANCELLED: 'Cancelled'
  }

  if (loading) return <div className="loading">Loading orders...</div>

  return (
    <div className="orders-view">
      <div className="header">
        <h1>Orders</h1>
        <div className="filters">
          <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value as OrderStatus | ''); setPage(0) }}>
            <option value="">All Status</option>
            {statusOrder.map(s => <option key={s} value={s}>{statusLabels[s]}</option>)}
          </select>
          <button onClick={() => setShowPlaceOrderModal(true)}>Place Order</button>
        </div>
      </div>

      {error && <div className="error">{error}</div>}

      <table className="orders-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Customer</th>
            <th>Phone</th>
            <th>Status</th>
            <th>Total</th>
            <th>Items</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(order => (
            <tr key={order.id}>
              <td>{order.id}</td>
              <td>{order.customerName || 'Walk-in'}</td>
              <td>{order.customerPhone || '—'}</td>
              <td>
                <span className="status-badge" style={{ backgroundColor: statusColors[order.status] }}>
                  {order.status}
                </span>
              </td>
              <td>{formatPrice(order.totalAmount)}</td>
              <td>
                {order.items.map(item => (
                  <div key={item.id} className="order-item-line">
                    {item.name} × {item.quantity} ({item.portion}) = {formatPrice(item.totalPrice)}
                    {item.offerApplied && <span className="offer-tag">{item.offerLabel || 'Offer'}</span>}
                  </div>
                ))}
              </td>
              <td>{order.createdAt ? new Date(order.createdAt).toLocaleString() : '—'}</td>
              <td className="actions-cell">
                <select
                  className="order-status-select"
                  value={selectedStatuses[order.id] ?? order.status}
                  onChange={e => setSelectedStatuses(current => ({ ...current, [order.id]: e.target.value as OrderStatus }))}
                  aria-label={`Status for order ${order.id}`}
                >
                  {!statusOrder.includes(order.status) && <option value={order.status}>{statusLabels[order.status]}</option>}
                  {statusOrder.map(status => <option key={status} value={status}>{statusLabels[status]}</option>)}
                </select>
                <button className="small" onClick={() => handleSubmitStatus(order)}>Submit Status</button>
                <button className="small secondary" onClick={() => handlePrintBill(order)}>Print Bill</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="pagination">
        <button onClick={() => setPage(p => p - 1)} disabled={page === 0}>Previous</button>
        <span>Page {page + 1} of {totalPages}</span>
        <button onClick={() => setPage(p => p + 1)} disabled={page >= totalPages - 1}>Next</button>
      </div>

      {showPlaceOrderModal && (
        <div className="modal-overlay" onClick={() => setShowPlaceOrderModal(false)}>
          <div className="modal large" onClick={e => e.stopPropagation()}>
            <h2>Place New Order</h2>
            <form onSubmit={handlePlaceOrder}>
              <div className="form-row">
                <div className="form-group">
                  <label>Customer Name</label>
                  <input type="text" value={customerName} onChange={e => setCustomerName(e.target.value)} placeholder="Optional" />
                </div>
                <div className="form-group">
                  <label>Customer Phone</label>
                  <input type="text" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} placeholder="Optional" />
                </div>
              </div>
              <div className="order-items-form">
                <h3>Order Items</h3>
                {orderItems.map((item, index) => (
                  <div key={index} className="order-item-form">
                    <div className="form-group">
                      <label>Menu Item</label>
                      <select value={item.menuItemId} onChange={e => handleOrderItemChange(index, 'menuItemId', parseInt(e.target.value))}>
                        <option value={0}>Select item</option>
                        {menuItems.map(m => (
                          <option key={m.id} value={m.id}>
                            {m.name} ({formatPrice(m.priceFull)}/{m.priceHalf !== null ? formatPrice(m.priceHalf) : 'N/A'})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Portion</label>
                      <select value={item.portion} onChange={e => handleOrderItemChange(index, 'portion', e.target.value as Portion)}>
                        <option value="FULL">Full</option>
                        <option value="HALF">Half</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Quantity</label>
                      <input type="number" min="1" value={item.quantity} onChange={e => handleOrderItemChange(index, 'quantity', parseInt(e.target.value))} />
                    </div>
                    <div className="form-group checkbox-group">
                      <label>
                        <input
                          type="checkbox"
                          checked={item.useOffer || false}
                          onChange={e => handleOrderItemChange(index, 'useOffer', e.target.checked)}
                        />
                        Use Offer
                      </label>
                    </div>
                    {orderItems.length > 1 && (
                      <button type="button" className="small danger" onClick={() => handleRemoveOrderItem(index)}>Remove</button>
                    )}
                  </div>
                ))}
                <button type="button" onClick={handleAddOrderItem} className="secondary">+ Add Item</button>
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowPlaceOrderModal(false)}>Cancel</button>
                <button type="submit">Place Order</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
