import { ref, computed, inject } from 'vue'
import { AUTHDOG_CONTEXT_KEY, type AuthdogContext } from '../client/provider'

export const useOrganization = () => {
  const context = inject<AuthdogContext>(AUTHDOG_CONTEXT_KEY)
  const organization = ref<any>(null)
  const isLoading = ref(false)
  const error = ref<Error | null>(null)

  if (!context) {
    throw new Error('useOrganization must be used within AuthdogProvider')
  }

  const fetchOrganization = async (organizationId: string) => {
    if (!context.token) {
      return null
    }

    isLoading.value = true
    error.value = null

    try {
      // This would be implemented based on your organization API
      // For now, returning a placeholder
      const response = await fetch(`/api/organizations/${organizationId}`, {
        headers: {
          'Authorization': `Bearer ${context.token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch organization')
      }

      organization.value = await response.json()
      return organization.value
    } catch (err) {
      error.value = err as Error
      return null
    } finally {
      isLoading.value = false
    }
  }

  return {
    organization: computed(() => organization.value),
    isLoading: computed(() => isLoading.value),
    error: computed(() => error.value),
    fetchOrganization,
  }
}
