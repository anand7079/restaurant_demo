import { BrowserRouter, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom'
import { MenuView } from './views/MenuView'
import { OrdersView } from './views/OrdersView'
import './style.css'

function NavBar() {
  const location = useLocation()
  return (
    <nav className="navbar">
      <div className="nav-brand">Restaurant Demo</div>
      <ul className="nav-links">
        <li>
          <Link to="/menu" className={location.pathname === '/menu' ? 'active' : ''}>Menu</Link>
        </li>
        <li>
          <Link to="/orders" className={location.pathname === '/orders' ? 'active' : ''}>Orders</Link>
        </li>
      </ul>
    </nav>
  )
}

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <NavBar />
        <main className="main-content">
          <Routes>
            <Route path="/menu" element={<MenuView />} />
            <Route path="/orders" element={<OrdersView />} />
            <Route path="/" element={<Navigate to="/menu" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App