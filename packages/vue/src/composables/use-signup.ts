import { ref, computed, inject } from 'vue'
import { AUTHDOG_CONTEXT_KEY, type AuthdogContext } from '../client/provider'

export const useSignUp = () => {
  const context = inject<AuthdogContext>(AUTHDOG_CONTEXT_KEY)
  const isLoading = ref(false)
  const error = ref<Error | null>(null)

  if (!context) {
    throw new Error('useSignUp must be used within AuthdogProvider')
  }

  const signUp = async (publicKey: string, redirectUrl?: string) => {
    isLoading.value = true
    error.value = null

    try {
      const publicKeyObj = JSON.parse(
        Buffer.from(publicKey.replace('pk_', ''), 'base64').toString('utf-8')
      )
      
      const authUrl = new URL(`${publicKeyObj.identityHost}/oidc/${publicKeyObj.environmentId}/authorize`)
      authUrl.searchParams.set('client_id', publicKey)
      authUrl.searchParams.set('response_type', 'code')
      authUrl.searchParams.set('scope', 'openid profile email')
      authUrl.searchParams.set('redirect_uri', redirectUrl || window.location.origin)
      authUrl.searchParams.set('prompt', 'signup')
      
      window.location.href = authUrl.toString()
    } catch (err) {
      error.value = err as Error
    } finally {
      isLoading.value = false
    }
  }

  return {
    signUp,
    isLoading: computed(() => isLoading.value),
    error: computed(() => error.value),
  }
}
