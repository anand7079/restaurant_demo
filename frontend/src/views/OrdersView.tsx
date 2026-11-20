import { useState, useEffect } from 'react'
import { getOrders, updateOrderStatus } from '../api'
import type { OrderResponse, OrderStatus } from '../api'

export function OrdersView() {
  const [orders, setOrders] = useState<OrderResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(0)
  const [size] = useState(20)
  const [totalPages, setTotalPages] = useState(1)
  const [statusFilter, setStatusFilter] = useState<OrderStatus | ''>('')
  const [selectedStatuses, setSelectedStatuses] = useState<Record<number, OrderStatus>>({})
  useEffect(() => {
    loadOrders()
  }, [page, statusFilter])

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

    </div>
  )
}
