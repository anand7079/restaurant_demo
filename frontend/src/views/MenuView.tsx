import { useState, useEffect } from 'react'
import { getCurrentMenu, addToWorkingMenu, removeFromWorkingMenu, applyOffer, resetOffers, resetWorkingMenu } from '../api'
import type { CurrentMenuItemResponse, WorkingMenuItemRequest, OfferRequest } from '../api'

export function MenuView() {
  const [menu, setMenu] = useState<CurrentMenuItemResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [offerItem, setOfferItem] = useState<CurrentMenuItemResponse | null>(null)

  const [newItem, setNewItem] = useState<WorkingMenuItemRequest>({
    category: 'VEG',
    subcategory: '',
    name: '',
    priceFull: 0,
    priceHalf: 0
  })

  const [offerData, setOfferData] = useState<OfferRequest>({
    itemId: 0,
    offerPriceFull: null,
    offerPriceHalf: null,
    offerLabel: ''
  })

  useEffect(() => {
    loadMenu()
  }, [])

  const loadMenu = async () => {
    try {
      setLoading(true)
      const data = await getCurrentMenu()
      setMenu(data)
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load menu')
    } finally {
      setLoading(false)
    }
  }

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await addToWorkingMenu(newItem)
      setShowAddModal(false)
      setNewItem({ category: 'VEG', subcategory: '', name: '', priceFull: 0, priceHalf: 0 })
      loadMenu()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to add item')
    }
  }

  const handleRemoveItem = async (id: number) => {
    if (!window.confirm('Remove this item from working menu?')) return
    try {
      await removeFromWorkingMenu(id)
      loadMenu()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to remove item')
    }
  }

  const handleApplyOffer = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!offerItem) return
    try {
      await applyOffer({ ...offerData, itemId: offerItem.id })
      setOfferItem(null)
      loadMenu()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to apply offer')
    }
  }

  const handleResetOffers = async () => {
    if (!window.confirm('Reset all offers?')) return
    try {
      await resetOffers()
      loadMenu()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to reset offers')
    }
  }

  const handleResetWorking = async () => {
    if (!window.confirm('Reset working menu? This will discard all overrides and offers.')) return
    try {
      await resetWorkingMenu()
      loadMenu()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to reset working menu')
    }
  }

  const formatPrice = (price: number | null) => price !== null ? `₹${price.toFixed(2)}` : '—'

  if (loading) return <div className="loading">Loading menu...</div>

  return (
    <div className="menu-view">
      <div className="header">
        <h1>Current Menu</h1>
        <div className="actions">
          <button onClick={() => setShowAddModal(true)}>Add to Working Menu</button>
          <button onClick={handleResetOffers} className="secondary">Reset Offers</button>
          <button onClick={handleResetWorking} className="danger">Reset Working Menu</button>
        </div>
      </div>

      {error && <div className="error">{error}</div>}

      <table className="menu-table">
        <thead>
          <tr>
            <th>Category</th>
            <th>Subcategory</th>
            <th>Name</th>
            <th>Full Price</th>
            <th>Half Price</th>
            <th>Offer Full</th>
            <th>Offer Half</th>
            <th>Offer Label</th>
            <th>Source</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {menu.map(item => (
            <tr key={item.id}>
              <td>{item.category}</td>
              <td>{item.subcategory || '—'}</td>
              <td>{item.name}</td>
              <td>{formatPrice(item.priceFull)}</td>
              <td>{formatPrice(item.priceHalf)}</td>
              <td>{item.offerPriceFull !== null ? formatPrice(item.offerPriceFull) : '—'}</td>
              <td>{item.offerPriceHalf !== null ? formatPrice(item.offerPriceHalf) : '—'}</td>
              <td>{item.offerLabel || '—'}</td>
              <td><span className={`source-badge ${item.source.toLowerCase()}`}>{item.source}</span></td>
              <td className="actions-cell">
                {item.source === 'WORKING' && (
                  <>
                    <button onClick={() => { setOfferItem(item); setOfferData({ itemId: item.id, offerPriceFull: item.offerPriceFull, offerPriceHalf: item.offerPriceHalf, offerLabel: item.offerLabel || '' }) }} className="small">Offer</button>
                    <button onClick={() => handleRemoveItem(item.id)} className="small danger">Remove</button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>Add to Working Menu</h2>
            <form onSubmit={handleAddItem}>
              <div className="form-group">
                <label>Category</label>
                <select value={newItem.category} onChange={e => setNewItem({...newItem, category: e.target.value as 'VEG' | 'NON_VEG'})}>
                  <option value="VEG">VEG</option>
                  <option value="NON_VEG">NON_VEG</option>
                </select>
              </div>
              <div className="form-group">
                <label>Subcategory</label>
                <input type="text" value={newItem.subcategory || ''} onChange={e => setNewItem({...newItem, subcategory: e.target.value})} placeholder="Optional" />
              </div>
              <div className="form-group">
                <label>Name</label>
                <input type="text" value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Full Price</label>
                <input type="number" step="0.01" value={newItem.priceFull} onChange={e => setNewItem({...newItem, priceFull: parseFloat(e.target.value)})} required />
              </div>
              <div className="form-group">
                <label>Half Price</label>
                <input type="number" step="0.01" value={newItem.priceHalf || 0} onChange={e => setNewItem({...newItem, priceHalf: parseFloat(e.target.value) || 0})} placeholder="Optional" />
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit">Add</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {offerItem && (
        <div className="modal-overlay" onClick={() => setOfferItem(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>Apply Offer: {offerItem.name}</h2>
            <form onSubmit={handleApplyOffer}>
              <div className="form-group">
                <label>Offer Full Price</label>
                <input type="number" step="0.01" value={offerData.offerPriceFull || ''} onChange={e => setOfferData({...offerData, offerPriceFull: e.target.value ? parseFloat(e.target.value) : null})} placeholder="Optional" />
              </div>
              <div className="form-group">
                <label>Offer Half Price</label>
                <input type="number" step="0.01" value={offerData.offerPriceHalf || ''} onChange={e => setOfferData({...offerData, offerPriceHalf: e.target.value ? parseFloat(e.target.value) : null})} placeholder="Optional" />
              </div>
              <div className="form-group">
                <label>Offer Label</label>
                <input type="text" value={offerData.offerLabel || ''} onChange={e => setOfferData({...offerData, offerLabel: e.target.value})} placeholder="e.g., 20% OFF" />
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setOfferItem(null)}>Cancel</button>
                <button type="submit">Apply</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}