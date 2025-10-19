import { ref, computed, inject } from 'vue'
import { AUTHDOG_CONTEXT_KEY, type AuthdogContext } from '../client/provider'
import { fetchUserData, validatePublicKey } from '../client/session'

export const useUser = () => {
  const context = inject<AuthdogContext>(AUTHDOG_CONTEXT_KEY)
  const user = ref<any>(null)
  const isLoading = ref(false)
  const error = ref<Error | null>(null)

  if (!context) {
    throw new Error('useUser must be used within AuthdogProvider')
  }

  const fetchUser = async (publicKey: string) => {
    if (!context.token) {
      return null
    }

    isLoading.value = true
    error.value = null

    try {
      validatePublicKey(publicKey)
      const userData = await fetchUserData(publicKey, context.token)
      user.value = userData?.user || null
      return userData?.user || null
    } catch (err) {
      error.value = err as Error
      return null
    } finally {
      isLoading.value = false
    }
  }

  const isAuthenticated = computed(() => !!context.token && !!user.value)

  return {
    user: computed(() => user.value),
    isLoading: computed(() => isLoading.value),
    error: computed(() => error.value),
    isAuthenticated,
    fetchUser,
  }
}
