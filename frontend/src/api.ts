export type MenuCategory = 'VEG' | 'NON_VEG'
export type Portion = 'FULL' | 'HALF'
export type OrderStatus = 'IN_QUEUE' | 'ACCEPTED' | 'PREPARING' | 'PREPARED' | 'SERVED' | 'PENDING' | 'CONFIRMED' | 'READY' | 'DELIVERED' | 'CANCELLED'

export type MenuItemResponse = {
  id: number
  category: MenuCategory
  subcategory: string | null
  name: string
  priceFull: number
  priceHalf: number | null
  active: boolean
  createdAt: string | null
}

export type MenuItemRequest = {
  category: MenuCategory
  subcategory?: string | null
  name: string
  priceFull: number
  priceHalf?: number | null
  active?: boolean
}

export type WorkingMenuItemResponse = {
  id: number
  category: MenuCategory
  subcategory: string | null
  name: string
  priceFull: number
  priceHalf: number | null
  offerPriceFull: number | null
  offerPriceHalf: number | null
  offerLabel: string | null
  isOverride: boolean
  active: boolean
  createdAt: string | null
}

export type WorkingMenuItemRequest = {
  category: MenuCategory
  subcategory?: string | null
  name: string
  priceFull: number
  priceHalf?: number | null
}

export type OfferRequest = {
  itemId: number
  offerPriceFull?: number | null
  offerPriceHalf?: number | null
  offerLabel?: string | null
}

export type CurrentMenuItemResponse = {
  id: number
  category: MenuCategory
  subcategory: string | null
  name: string
  priceFull: number
  priceHalf: number | null
  offerPriceFull: number | null
  offerPriceHalf: number | null
  offerLabel: string | null
  isOverride: boolean
  active: boolean
  source: 'MASTER' | 'WORKING'
}

export type OrderItemResponse = {
  id: number
  menuItemId: number
  name: string
  category: MenuCategory
  portion: Portion
  quantity: number
  unitPrice: number
  totalPrice: number
  offerApplied: boolean
  offerLabel: string | null
}

export type OrderResponse = {
  id: number
  customerName: string | null
  customerPhone: string | null
  status: OrderStatus
  totalAmount: number
  createdAt: string | null
  updatedAt: string | null
  items: OrderItemResponse[]
}

export type OrderItemRequest = {
  menuItemId: number
  menuItemSource?: CurrentMenuItemResponse['source']
  portion: Portion
  quantity: number
  useOffer?: boolean
}

export type OrderRequest = {
  customerName?: string | null
  customerPhone?: string | null
  items: OrderItemRequest[]
}

export type StatusUpdateRequest = {
  status: OrderStatus
}

export type PageResponse<T> = {
  content: T[]
  number: number
  size: number
  totalElements: number
  totalPages: number
}

const apiBase = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1').replace(/\/$/, '')

export class ApiError extends Error {
  status: number
  constructor(message: string, status: number) { super(message); this.name = 'ApiError'; this.status = status }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response
  try {
    response = await fetch(`${apiBase}${path}`, {
      ...init,
      headers: { ...(init?.body ? { 'Content-Type': 'application/json' } : {}), ...init?.headers },
    })
  } catch {
    throw new ApiError(`Cannot reach the backend at ${apiBase}. Check that Spring Boot is running and CORS allows this frontend origin.`, 0)
  }
  if (!response.ok) {
    let message = `${response.status} ${response.statusText}`
    try {
      const body = await response.json() as { message?: string; details?: Record<string, string>; error?: string }
      message = body.message || body.error || message
      const fields = body.details ? Object.entries(body.details).map(([field, detail]) => `${field}: ${detail}`).join(' · ') : ''
      if (fields) message += ` — ${fields}`
    } catch { /* use the HTTP status when the response is not JSON */ }
    throw new ApiError(message, response.status)
  }
  if (response.status === 204) return undefined as T
  return response.json() as Promise<T>
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) => request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  put: <T>(path: string, body: unknown) => request<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
  patch: <T>(path: string, body?: unknown) => request<T>(path, {
    method: 'PATCH',
    ...(body !== undefined ? { body: JSON.stringify(body) } : {})
  }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
}

export async function getCurrentMenu(): Promise<CurrentMenuItemResponse[]> {
  return api.get<CurrentMenuItemResponse[]>('/menu/current')
}

export async function getMasterMenu(page = 0, size = 100): Promise<PageResponse<MenuItemResponse>> {
  return api.get<PageResponse<MenuItemResponse>>(`/menu/master?page=${page}&size=${size}`)
}

export async function createMasterMenuItem(body: MenuItemRequest): Promise<MenuItemResponse> {
  return api.post<MenuItemResponse>('/menu/master', body)
}

export async function updateMasterMenuItem(id: number, body: MenuItemRequest): Promise<MenuItemResponse> {
  return api.put<MenuItemResponse>(`/menu/master/${id}`, body)
}

export async function deleteMasterMenuItem(id: number): Promise<void> {
  return api.delete(`/menu/master/${id}`)
}

export async function addToWorkingMenu(body: WorkingMenuItemRequest): Promise<WorkingMenuItemResponse> {
  return api.post<WorkingMenuItemResponse>('/menu/current/working', body)
}

export async function removeFromWorkingMenu(id: number): Promise<void> {
  return api.delete(`/menu/current/working/${id}`)
}

export async function removeMasterFromCurrentMenu(masterItemId: number): Promise<void> {
  return api.delete(`/menu/current/working/master/${masterItemId}`)
}

export async function applyOffer(body: OfferRequest): Promise<WorkingMenuItemResponse> {
  return api.post<WorkingMenuItemResponse>('/menu/current/offers', body)
}

export async function applyOfferToMaster(masterItemId: number, body: OfferRequest): Promise<WorkingMenuItemResponse> {
  return api.post<WorkingMenuItemResponse>(`/menu/current/offers/master/${masterItemId}`, body)
}

export async function removeOffer(itemId: number): Promise<void> {
  return api.delete(`/menu/current/offers/${itemId}`)
}

export async function resetOffers(): Promise<void> {
  return api.delete('/menu/current/offers')
}

export async function resetWorkingMenu(): Promise<void> {
  return api.post<void>('/menu/current/reset', {})
}

export async function placeOrder(body: OrderRequest): Promise<OrderResponse> {
  return api.post<OrderResponse>('/orders', body)
}

export async function getOrders(page = 0, size = 20, status?: OrderStatus): Promise<PageResponse<OrderResponse>> {
  const params = new URLSearchParams({ page: String(page), size: String(size) })
  if (status) params.append('status', status)
  return api.get<PageResponse<OrderResponse>>(`/orders?${params.toString()}`)
}

export async function getOrder(id: number): Promise<OrderResponse> {
  return api.get<OrderResponse>(`/orders/${id}`)
}

export async function updateOrderStatus(id: number, status: OrderStatus): Promise<OrderResponse> {
  return api.patch<OrderResponse>(`/orders/${id}/status`, { status })
}
