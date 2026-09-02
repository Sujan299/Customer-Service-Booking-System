import type { ServiceFilters } from '../../types'
import { apiCall, client } from '../client'

export const servicesApi = {
  getServices: (filters?: ServiceFilters) => apiCall(() => client.getServices(filters)),
  getServiceById: (id: string) => apiCall(() => client.getServiceById(id)),
  getAvailability: (serviceId: string, date: string) =>
    apiCall(() => client.getAvailability(serviceId, date)),
}
