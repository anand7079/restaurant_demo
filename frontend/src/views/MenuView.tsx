import { useState, useEffect } from 'react'
import { getCurrentMenu, getMasterMenu, addToWorkingMenu, removeFromWorkingMenu, removeMasterFromCurrentMenu, applyOffer, applyOfferToMaster, removeOffer, resetOffers, resetWorkingMenu, createMasterMenuItem } from '../api'
import type { CurrentMenuItemResponse, WorkingMenuItemRequest, OfferRequest, MenuItemRequest } from '../api'

export function MenuView() {
  const [menu, setMenu] = useState<CurrentMenuItemResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showAddMasterModal, setShowAddMasterModal] = useState(false)
  const [offerItem, setOfferItem] = useState<CurrentMenuItemResponse | null>(null)
  const [showMasterOnly, setShowMasterOnly] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<'ALL' | 'VEG' | 'NON_VEG'>('ALL')
  const [selectedSubcategory, setSelectedSubcategory] = useState('ALL')
  const [searchTerm, setSearchTerm] = useState('')

  const [newItem, setNewItem] = useState<WorkingMenuItemRequest>({
    category: 'VEG',
    subcategory: '',
    name: '',
    priceFull: 0,
    priceHalf: 0
  })

  const [newMasterItem, setNewMasterItem] = useState<MenuItemRequest>({
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

  const loadMenu = async (masterOnly = showMasterOnly) => {
    try {
      setLoading(true)
      if (masterOnly) {
        const response = await getMasterMenu()
        const masterItems = response.content.map(item => ({
          ...item,
          offerPriceFull: null,
          offerPriceHalf: null,
          offerLabel: null,
          isOverride: false,
          source: 'MASTER' as const
        }))
        setMenu(masterItems)
      } else {
        const data = await getCurrentMenu()
        setMenu(data)
      }
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load menu')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleMenuView = () => {
    const masterOnly = !showMasterOnly
    setShowMasterOnly(masterOnly)
    loadMenu(masterOnly)
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

  const handleAddMasterItem = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createMasterMenuItem(newMasterItem)
      setShowAddMasterModal(false)
      setNewMasterItem({ category: 'VEG', subcategory: '', name: '', priceFull: 0, priceHalf: 0 })
      loadMenu()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to add master item')
    }
  }

  const handleRemoveItem = async (item: CurrentMenuItemResponse) => {
    if (!window.confirm('Remove this item from the current menu?')) return
    try {
      if (item.source === 'MASTER') {
        await removeMasterFromCurrentMenu(item.id)
      } else {
        await removeFromWorkingMenu(item.id)
      }
      loadMenu()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to remove item')
    }
  }

  const handleApplyOffer = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!offerItem) return
    try {
      const request = { ...offerData, itemId: offerItem.id }
      if (offerItem.source === 'MASTER') {
        await applyOfferToMaster(offerItem.id, request)
      } else {
        await applyOffer(request)
      }
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

  const handleRemoveOffer = async (itemId: number) => {
    try {
      await removeOffer(itemId)
      loadMenu()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to remove offer')
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

  const categories = Array.from(new Set(menu.map(item => item.category)))
  const subcategories = Array.from(new Set(menu
    .filter(item => selectedCategory === 'ALL' || item.category === selectedCategory)
    .map(item => item.subcategory)
    .filter((subcategory): subcategory is string => Boolean(subcategory))))
  const searchSuggestions = Array.from(new Set(menu.map(item => item.name)))
  const normalizedSearch = searchTerm.trim().toLowerCase()
  const filteredMenu = menu.filter(item =>
    (selectedCategory === 'ALL' || item.category === selectedCategory) &&
    (selectedSubcategory === 'ALL' || item.subcategory === selectedSubcategory) &&
    (!normalizedSearch || item.name.toLowerCase().includes(normalizedSearch) ||
      item.subcategory?.toLowerCase().includes(normalizedSearch) ||
      item.category.toLowerCase().includes(normalizedSearch))
  )

  if (loading) return <div className="loading">Loading menu...</div>

  return (
    <div className="menu-view">
      <div className="header">
        <h1>{showMasterOnly ? 'Master Menu' : 'Current Menu'}</h1>
        <div className="actions">
          <button onClick={handleToggleMenuView} className={showMasterOnly ? 'active' : ''}>
            {showMasterOnly ? 'Show Current Menu' : 'Show Master Menu Only'}
          </button>
          <button onClick={() => setShowAddMasterModal(true)}>Add to Master Menu</button>
          <button onClick={() => setShowAddModal(true)}>Add to Working Menu</button>
          <button onClick={handleResetOffers} className="secondary">Reset Offers</button>
          <button onClick={handleResetWorking} className="danger">Reset Working Menu</button>
        </div>
      </div>

      {error && <div className="error">{error}</div>}

      <div className="menu-filters">
        <label>
          Category
          <select value={selectedCategory} onChange={e => {
            setSelectedCategory(e.target.value as 'ALL' | 'VEG' | 'NON_VEG')
            setSelectedSubcategory('ALL')
          }}>
            <option value="ALL">All categories</option>
            {categories.map(category => <option key={category} value={category}>{category}</option>)}
          </select>
        </label>
        <label>
          Subcategory
          <select value={selectedSubcategory} onChange={e => setSelectedSubcategory(e.target.value)}>
            <option value="ALL">All subcategories</option>
            {subcategories.map(subcategory => <option key={subcategory} value={subcategory}>{subcategory}</option>)}
          </select>
        </label>
        <label>
          Search menu
          <input
            type="search"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search dish, category, or subcategory"
            list="current-menu-suggestions"
          />
          <datalist id="current-menu-suggestions">
            {searchSuggestions.map(name => <option key={name} value={name} />)}
          </datalist>
        </label>
      </div>

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
          {filteredMenu.map(item => (
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
                {!showMasterOnly && (
                  <>
                    <button onClick={() => { setOfferItem(item); setOfferData({ itemId: item.id, offerPriceFull: item.offerPriceFull, offerPriceHalf: item.offerPriceHalf, offerLabel: item.offerLabel || '' }) }} className="small">Offer</button>
                    {(item.offerPriceFull !== null || item.offerPriceHalf !== null || item.offerLabel) && (
                      <button onClick={() => handleRemoveOffer(item.id)} className="small secondary">Remove Offer</button>
                    )}
                    <button onClick={() => handleRemoveItem(item)} className="small danger">Remove</button>
                  </>
                )}
              </td>
            </tr>
          ))}
          {filteredMenu.length === 0 && (
            <tr><td colSpan={10}>No menu items match these filters.</td></tr>
          )}
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

      {showAddMasterModal && (
        <div className="modal-overlay" onClick={() => setShowAddMasterModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>Add to Master Menu</h2>
            <form onSubmit={handleAddMasterItem}>
              <div className="form-group">
                <label>Category</label>
                <select value={newMasterItem.category} onChange={e => setNewMasterItem({...newMasterItem, category: e.target.value as 'VEG' | 'NON_VEG'})}>
                  <option value="VEG">VEG</option>
                  <option value="NON_VEG">NON_VEG</option>
                </select>
              </div>
              <div className="form-group">
                <label>Subcategory</label>
                <input type="text" value={newMasterItem.subcategory || ''} onChange={e => setNewMasterItem({...newMasterItem, subcategory: e.target.value})} placeholder="Optional" />
              </div>
              <div className="form-group">
                <label>Name</label>
                <input type="text" value={newMasterItem.name} onChange={e => setNewMasterItem({...newMasterItem, name: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Full Price</label>
                <input type="number" step="0.01" value={newMasterItem.priceFull} onChange={e => setNewMasterItem({...newMasterItem, priceFull: parseFloat(e.target.value)})} required />
              </div>
              <div className="form-group">
                <label>Half Price</label>
                <input type="number" step="0.01" value={newMasterItem.priceHalf || 0} onChange={e => setNewMasterItem({...newMasterItem, priceHalf: parseFloat(e.target.value) || 0})} placeholder="Optional" />
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowAddMasterModal(false)}>Cancel</button>
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
