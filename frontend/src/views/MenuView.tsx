import { useState, useEffect } from 'react'
import { getCurrentMenu, getMasterMenu, addToWorkingMenu, removeFromWorkingMenu, removeMasterFromCurrentMenu, applyOffer, applyOfferToMaster, removeOffer, resetOffers, resetWorkingMenu, createMasterMenuItem, updateMasterMenuItem, deleteMasterMenuItem, placeOrder } from '../api'
import type { CurrentMenuItemResponse, WorkingMenuItemRequest, OfferRequest, MenuItemRequest, MenuItemResponse, OrderItemRequest, OrderRequest, Portion } from '../api'

export function MenuView() {
  const [menu, setMenu] = useState<CurrentMenuItemResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showMasterManager, setShowMasterManager] = useState(false)
  const [masterManagerMode, setMasterManagerMode] = useState<'choose' | 'add' | 'remove' | 'edit'>('choose')
  const [masterItems, setMasterItems] = useState<MenuItemResponse[]>([])
  const [selectedMasterItemId, setSelectedMasterItemId] = useState<number | null>(null)
  const [offerItem, setOfferItem] = useState<CurrentMenuItemResponse | null>(null)
  const [showMasterOnly, setShowMasterOnly] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<'ALL' | 'VEG' | 'NON_VEG'>('ALL')
  const [selectedSubcategory, setSelectedSubcategory] = useState('ALL')
  const [searchTerm, setSearchTerm] = useState('')
  const [cart, setCart] = useState<OrderItemRequest[]>([])
  const [showCart, setShowCart] = useState(false)
  const [cartAddItem, setCartAddItem] = useState<CurrentMenuItemResponse | null>(null)
  const [cartAddPortion, setCartAddPortion] = useState<Portion>('FULL')
  const [cartCustomerName, setCartCustomerName] = useState('')
  const [cartCustomerPhone, setCartCustomerPhone] = useState('')

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
  const [editingMasterItem, setEditingMasterItem] = useState<MenuItemRequest>({
    category: 'VEG',
    subcategory: '',
    name: '',
    priceFull: 0,
    priceHalf: 0,
    active: true
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

  const openMasterManager = async () => {
    try {
      setError(null)
      const response = await getMasterMenu(0, 1000)
      setMasterItems(response.content)
      setMasterManagerMode('choose')
      setSelectedMasterItemId(null)
      setShowMasterManager(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load master menu')
    }
  }

  const openAddWorkingMenuModal = async () => {
    try {
      setError(null)
      const response = await getMasterMenu(0, 1000)
      setMasterItems(response.content)
      setShowAddModal(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load subcategories')
    }
  }

  const refreshMasterItems = async () => {
    const response = await getMasterMenu(0, 1000)
    setMasterItems(response.content)
  }

  const selectMasterManagerMode = (mode: 'add' | 'remove' | 'edit') => {
    setMasterManagerMode(mode)
    setSelectedMasterItemId(null)
    setSearchTerm('')
    setSelectedCategory('ALL')
    setSelectedSubcategory('ALL')
    if (mode === 'add') {
      setNewMasterItem({ category: 'VEG', subcategory: '', name: '', priceFull: 0, priceHalf: 0 })
    }
  }

  const handleUpdateMasterItem = async (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedMasterItemId === null) return
    try {
      await updateMasterMenuItem(selectedMasterItemId, editingMasterItem)
      await refreshMasterItems()
      await loadMenu()
      window.alert(`Updated ${editingMasterItem.name} in the master menu.`)
      setMasterManagerMode('choose')
      setSelectedMasterItemId(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update master menu item')
    }
  }

  const handleDeleteMasterItem = async () => {
    if (selectedMasterItemId === null) return
    const item = masterItems.find(candidate => candidate.id === selectedMasterItemId)
    if (!item || !window.confirm(`Remove ${item.name} from the master menu?`)) return
    try {
      await deleteMasterMenuItem(selectedMasterItemId)
      await refreshMasterItems()
      await loadMenu()
      window.alert(`Removed ${item.name} from the master menu.`)
      setSelectedMasterItemId(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to remove master menu item')
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
      const addedItemName = newMasterItem.name
      await refreshMasterItems()
      setNewMasterItem({ category: 'VEG', subcategory: '', name: '', priceFull: 0, priceHalf: 0 })
      await loadMenu()
      window.alert(`Added ${addedItemName} to the master menu.`)
      setMasterManagerMode('choose')
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

  const handleAddToCart = (item: CurrentMenuItemResponse, portion: Portion) => {
    const offerPrice = portion === 'FULL' ? item.offerPriceFull : item.offerPriceHalf
    setCart(currentCart => {
      const existing = currentCart.find(cartItem => cartItem.menuItemId === item.id && cartItem.menuItemSource === item.source && cartItem.portion === portion)
      if (existing) {
        return currentCart.map(cartItem => cartItem.menuItemId === item.id && cartItem.menuItemSource === item.source && cartItem.portion === portion
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem)
      }
      return [...currentCart, { menuItemId: item.id, menuItemSource: item.source, portion, quantity: 1, useOffer: offerPrice !== null }]
    })
    setCartAddItem(null)
  }

  const handlePlaceCartOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    if (cart.length === 0) return
    try {
      const request: OrderRequest = {
        customerName: cartCustomerName || null,
        customerPhone: cartCustomerPhone || null,
        items: cart.map(line => {
          const menuItem = menu.find(item => item.id === line.menuItemId && item.source === line.menuItemSource)
          const offerPrice = line.portion === 'FULL' ? menuItem?.offerPriceFull : menuItem?.offerPriceHalf
          return { ...line, useOffer: offerPrice !== null && offerPrice !== undefined }
        })
      }
      const order = await placeOrder(request)
      setCart([])
      setCartCustomerName('')
      setCartCustomerPhone('')
      setShowCart(false)
      window.alert(`Order #${order.id} placed successfully. It is now available in Orders.`)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to place order')
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
  const cartItemCount = cart.reduce((count, item) => count + item.quantity, 0)
  const masterCategories = Array.from(new Set(masterItems.map(item => item.category)))
  const masterSubcategoryOptions = Array.from(new Set([
    ...masterItems.map(item => item.subcategory).filter((subcategory): subcategory is string => Boolean(subcategory)),
    editingMasterItem.subcategory || '',
    newMasterItem.subcategory || '',
    'special'
  ].filter(Boolean)))
  const masterSubcategories = Array.from(new Set([...masterSubcategoryOptions, ...masterItems
    .filter(item => selectedCategory === 'ALL' || item.category === selectedCategory)
    .map(item => item.subcategory)
    .filter((subcategory): subcategory is string => Boolean(subcategory))]))
  const filteredMasterItems = masterItems.filter(item =>
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
          {!showMasterOnly && <button onClick={() => setShowCart(true)}>Cart ({cartItemCount})</button>}
          <button onClick={openMasterManager}>Edit Master Menu</button>
          <button onClick={openAddWorkingMenuModal}>Add to Working Menu</button>
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
            <tr key={`${item.source}-${item.id}`}>
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
                    <button onClick={() => { setCartAddItem(item); setCartAddPortion('FULL') }} className="small">Add to Cart</button>
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
                <select value={newItem.subcategory || ''} onChange={e => setNewItem({...newItem, subcategory: e.target.value})}>
                  <option value="">No subcategory</option>
                  {masterSubcategoryOptions.map(subcategory => <option key={subcategory} value={subcategory}>{subcategory}</option>)}
                </select>
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

      {showMasterManager && (
        <div className="modal-overlay" onClick={() => setShowMasterManager(false)}>
          <div className="modal large" onClick={e => e.stopPropagation()}>
            <h2>Edit Master Menu</h2>
            {error && <div className="error">{error}</div>}
            {masterManagerMode === 'choose' ? (
              <div className="actions">
                <button onClick={() => selectMasterManagerMode('add')}>Add</button>
                <button onClick={() => selectMasterManagerMode('remove')}>Remove</button>
                <button onClick={() => selectMasterManagerMode('edit')}>Edit</button>
                <button className="secondary" onClick={() => setShowMasterManager(false)}>Close</button>
              </div>
            ) : (
              <>
                <button className="secondary" onClick={() => setMasterManagerMode('choose')}>Back to options</button>
                {masterManagerMode !== 'add' && (
                  <>
                    <div className="menu-filters">
                      <label>
                        Category
                        <select value={selectedCategory} onChange={e => {
                          setSelectedCategory(e.target.value as 'ALL' | 'VEG' | 'NON_VEG')
                          setSelectedSubcategory('ALL')
                        }}>
                          <option value="ALL">All categories</option>
                          {masterCategories.map(category => <option key={category} value={category}>{category}</option>)}
                        </select>
                      </label>
                      <label>
                        Subcategory
                        <select value={selectedSubcategory} onChange={e => setSelectedSubcategory(e.target.value)}>
                          <option value="ALL">All subcategories</option>
                          {masterSubcategories.map(subcategory => <option key={subcategory} value={subcategory}>{subcategory}</option>)}
                        </select>
                      </label>
                      <label>
                        Search master menu
                        <input type="search" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search dish, category, or subcategory" list="master-menu-suggestions" />
                        <datalist id="master-menu-suggestions">
                          {masterItems.map(item => <option key={item.id} value={item.name} />)}
                        </datalist>
                      </label>
                    </div>
                    <div className="form-group">
                      <label>Select master menu item</label>
                      <select value={selectedMasterItemId ?? ''} onChange={e => {
                        const id = e.target.value ? Number(e.target.value) : null
                        setSelectedMasterItemId(id)
                        const item = masterItems.find(candidate => candidate.id === id)
                        if (item) setEditingMasterItem({
                          category: item.category,
                          subcategory: item.subcategory || '',
                          name: item.name,
                          priceFull: item.priceFull,
                          priceHalf: item.priceHalf,
                          active: item.active
                        })
                      }}>
                        <option value="">Choose an item</option>
                        {filteredMasterItems.map(item => <option key={item.id} value={item.id}>{item.category} · {item.subcategory || 'No subcategory'} · {item.name}</option>)}
                      </select>
                    </div>
                    {masterManagerMode === 'remove' && (
                      <div className="modal-actions">
                        <button type="button" className="danger" onClick={handleDeleteMasterItem} disabled={selectedMasterItemId === null}>Remove selected item</button>
                      </div>
                    )}
                  </>
                )}
                {masterManagerMode === 'add' && (
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
                      <select value={newMasterItem.subcategory || ''} onChange={e => setNewMasterItem({...newMasterItem, subcategory: e.target.value})}>
                        <option value="">No subcategory</option>
                        {masterSubcategoryOptions.map(subcategory => <option key={subcategory} value={subcategory}>{subcategory}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Name</label>
                      <input type="text" value={newMasterItem.name} onChange={e => setNewMasterItem({...newMasterItem, name: e.target.value})} required />
                    </div>
                    <div className="form-group">
                      <label>Full Price</label>
                      <input type="number" step="0.01" min="0" value={newMasterItem.priceFull} onChange={e => setNewMasterItem({...newMasterItem, priceFull: parseFloat(e.target.value) || 0})} required />
                    </div>
                    <div className="form-group">
                      <label>Half Price</label>
                      <input type="number" step="0.01" min="0" value={newMasterItem.priceHalf ?? ''} onChange={e => setNewMasterItem({...newMasterItem, priceHalf: e.target.value ? parseFloat(e.target.value) : null})} placeholder="Optional" />
                    </div>
                    <div className="modal-actions">
                      <button type="submit">Add to master menu</button>
                    </div>
                  </form>
                )}
                {masterManagerMode === 'edit' && selectedMasterItemId !== null && (
                  <form onSubmit={handleUpdateMasterItem}>
                    <div className="form-group">
                      <label>Category</label>
                      <select value={editingMasterItem.category} onChange={e => setEditingMasterItem({...editingMasterItem, category: e.target.value as 'VEG' | 'NON_VEG'})}>
                        <option value="VEG">VEG</option>
                        <option value="NON_VEG">NON_VEG</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Subcategory</label>
                      <select value={editingMasterItem.subcategory || ''} onChange={e => setEditingMasterItem({...editingMasterItem, subcategory: e.target.value})}>
                        <option value="">No subcategory</option>
                        {masterSubcategoryOptions.map(subcategory => <option key={subcategory} value={subcategory}>{subcategory}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Name</label>
                      <input type="text" value={editingMasterItem.name} onChange={e => setEditingMasterItem({...editingMasterItem, name: e.target.value})} required />
                    </div>
                    <div className="form-group">
                      <label>Full Price</label>
                      <input type="number" step="0.01" min="0" value={editingMasterItem.priceFull} onChange={e => setEditingMasterItem({...editingMasterItem, priceFull: parseFloat(e.target.value) || 0})} required />
                    </div>
                    <div className="form-group">
                      <label>Half Price</label>
                      <input type="number" step="0.01" min="0" value={editingMasterItem.priceHalf ?? ''} onChange={e => setEditingMasterItem({...editingMasterItem, priceHalf: e.target.value ? parseFloat(e.target.value) : null})} placeholder="Optional" />
                    </div>
                    <div className="modal-actions">
                      <button type="submit">Save changes</button>
                    </div>
                  </form>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {showCart && (
        <div className="modal-overlay" onClick={() => setShowCart(false)}>
          <div className="modal large" onClick={e => e.stopPropagation()}>
            <h2>Cart ({cartItemCount} items)</h2>
            {error && <div className="error">{error}</div>}
            {cart.length === 0 ? (
              <p>Your cart is empty.</p>
            ) : (
              <form onSubmit={handlePlaceCartOrder}>
                <div className="order-items-form">
                  {cart.map((cartItem, index) => {
                    const menuItem = menu.find(item => item.id === cartItem.menuItemId && item.source === cartItem.menuItemSource)
                    if (!menuItem) return null
                    const offerPrice = cartItem.portion === 'FULL' ? menuItem.offerPriceFull : menuItem.offerPriceHalf
                    const regularPrice = cartItem.portion === 'FULL' ? menuItem.priceFull : menuItem.priceHalf
                    const linePrice = (offerPrice !== null ? offerPrice : regularPrice || 0) * cartItem.quantity
                    return (
                      <div className="order-item-form" key={`${cartItem.menuItemSource}-${cartItem.menuItemId}`}>
                        <div className="form-group">
                          <label>Item</label>
                          <strong>{menuItem.name}</strong>
                          <div>{formatPrice(linePrice)}</div>
                        </div>
                        <div className="form-group">
                          <label>Portion</label>
                          <select value={cartItem.portion} onChange={e => {
                            const portion = e.target.value as Portion
                            const nextOfferPrice = portion === 'FULL' ? menuItem.offerPriceFull : menuItem.offerPriceHalf
                            setCart(currentCart => currentCart.map((line, lineIndex) => lineIndex === index ? { ...line, portion, useOffer: nextOfferPrice !== null } : line))
                          }}>
                            <option value="FULL">Full</option>
                            <option value="HALF" disabled={menuItem.priceHalf === null}>Half</option>
                          </select>
                        </div>
                        <div className="form-group">
                          <label>Quantity</label>
                          <input type="number" min="1" value={cartItem.quantity} onChange={e => setCart(currentCart => currentCart.map((line, lineIndex) => lineIndex === index ? { ...line, quantity: Math.max(1, parseInt(e.target.value) || 1) } : line))} />
                        </div>
                        <div className="form-group">
                          <label>Offer</label>
                          {offerPrice !== null ? <span className="offer-tag">{menuItem.offerLabel || 'Offer applied'}</span> : <span>—</span>}
                        </div>
                        <button type="button" className="small danger" onClick={() => setCart(currentCart => currentCart.filter((_, lineIndex) => lineIndex !== index))}>Remove</button>
                      </div>
                    )
                  })}
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Customer Name</label>
                    <input type="text" value={cartCustomerName} onChange={e => setCartCustomerName(e.target.value)} placeholder="Optional" />
                  </div>
                  <div className="form-group">
                    <label>Customer Phone</label>
                    <input type="text" value={cartCustomerPhone} onChange={e => setCartCustomerPhone(e.target.value)} placeholder="Optional" />
                  </div>
                </div>
                <div className="modal-actions">
                  <button type="button" className="secondary" onClick={() => setShowCart(false)}>Continue shopping</button>
                  <button type="submit" disabled={cart.length === 0}>Place Order</button>
                </div>
              </form>
            )}
            {cart.length === 0 && <div className="modal-actions"><button className="secondary" onClick={() => setShowCart(false)}>Continue shopping</button></div>}
          </div>
        </div>
      )}

      {cartAddItem && (
        <div className="modal-overlay" onClick={() => setCartAddItem(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>Add {cartAddItem.name} to Cart</h2>
            <div className="form-group">
              <label>Portion</label>
              <select value={cartAddPortion} onChange={e => setCartAddPortion(e.target.value as Portion)}>
                <option value="FULL">Full</option>
                <option value="HALF" disabled={cartAddItem.priceHalf === null}>Half</option>
              </select>
            </div>
            <p>
              Price: {formatPrice((cartAddPortion === 'FULL'
                ? cartAddItem.offerPriceFull ?? cartAddItem.priceFull
                : cartAddItem.offerPriceHalf ?? cartAddItem.priceHalf) || 0)}
              {(cartAddPortion === 'FULL' ? cartAddItem.offerPriceFull : cartAddItem.offerPriceHalf) !== null &&
                <span className="offer-tag">{cartAddItem.offerLabel || 'Offer applied'}</span>}
            </p>
            <div className="modal-actions">
              <button type="button" className="secondary" onClick={() => setCartAddItem(null)}>Cancel</button>
              <button type="button" onClick={() => handleAddToCart(cartAddItem, cartAddPortion)}>Add to Cart</button>
            </div>
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
