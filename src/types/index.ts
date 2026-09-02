
export interface Provider {
  id: string
  name: string
  phone: string
}

export interface Service {
  id: string
  name: string
  category: string
  description: string
  providerId: string
  price: number
  provider: Provider
  currency: string
  durationMinutes: number
  rating: number
  reviewCount: number
  available: boolean
}
