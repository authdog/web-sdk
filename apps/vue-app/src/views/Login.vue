<template>
  <div class="login">
    <h2>Sign In</h2>
    
    <div v-if="isLoading" class="loading">
      Redirecting to sign in...
    </div>
    
    <div v-else class="login-content">
      <p>Click the button below to sign in with Authdog:</p>
      
      <button 
        @click="handleSignIn" 
        :disabled="isLoading"
        class="btn btn-primary"
      >
        {{ isLoading ? 'Redirecting...' : 'Sign In with Authdog' }}
      </button>
      
      <div v-if="error" class="error">
        <p>Error: {{ error.message }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { } from 'vue'
import { useSignIn } from '@authdog/vue'

const { signIn, isLoading, error } = useSignIn()

// You would typically get this from environment variables
const PUBLIC_KEY = 'pk_your_public_key_here'

const handleSignIn = async () => {
  await signIn(PUBLIC_KEY, window.location.origin)
}
</script>

<style scoped>
.login {
  max-width: 400px;
  margin: 0 auto;
  text-align: center;
}

.loading {
  font-size: 1.2rem;
  color: #666;
}

.login-content {
  padding: 2rem;
  background-color: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
}

.btn {
  display: inline-block;
  padding: 0.75rem 1.5rem;
  margin-top: 1rem;
  text-decoration: none;
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
</style>
