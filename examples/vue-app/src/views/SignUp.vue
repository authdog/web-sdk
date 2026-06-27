<template>
  <div class="signup">
    <h2>Create an account</h2>

    <div class="signup-content">
      <p>Click the button below to create a new account with Authdog:</p>

      <button
        @click="handleSignUp"
        :disabled="isLoading"
        class="btn btn-primary"
      >
        {{ isLoading ? 'Redirecting...' : 'Sign Up with Authdog' }}
      </button>

      <div v-if="error" class="error">
        <p>Error: {{ error.message }}</p>
      </div>

      <p class="hint">
        Already have an account?
        <router-link to="/login">Sign in instead</router-link>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useSignUp } from '@authdog/vue'

const { signUp, isLoading, error } = useSignUp()

// You would typically read this from environment variables.
const PUBLIC_KEY = 'pk_your_public_key_here'

// `signUp` opens the hosted flow with `prompt=signup` so the user lands on the
// account-creation screen rather than the sign-in screen.
const handleSignUp = async () => {
  await signUp(PUBLIC_KEY, window.location.origin)
}
</script>

<style scoped>
.signup {
  max-width: 400px;
  margin: 0 auto;
  text-align: center;
}

.signup-content {
  padding: 2rem;
  background-color: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
}

.btn {
  display: inline-block;
  padding: 0.75rem 1.5rem;
  margin-top: 1rem;
  border-radius: 4px;
  font-weight: 500;
  transition: all 0.2s;
  border: none;
  cursor: pointer;
  font-size: 1rem;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background-color: #007bff;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #0056b3;
}

.error {
  margin-top: 1rem;
  padding: 1rem;
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  border-radius: 4px;
  color: #721c24;
}

.hint {
  margin-top: 1.5rem;
  font-size: 0.9rem;
  color: #666;
}
</style>
