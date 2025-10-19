<template>
  <div class="home">
    <h2>Welcome to Vue App with Authdog</h2>
    
    <div v-if="isLoading" class="loading">
      Loading...
    </div>
    
    <div v-else-if="isAuthenticated" class="authenticated">
      <h3>You are signed in!</h3>
      <p>Welcome back! You can now access your profile.</p>
      <router-link to="/profile" class="btn btn-primary">
        Go to Profile
      </router-link>
    </div>
    
    <div v-else class="not-authenticated">
      <h3>Please sign in</h3>
      <p>To access your profile and other features, please sign in.</p>
      <router-link to="/login" class="btn btn-primary">
        Sign In
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useSession } from '@authdog/vue'

const { session, isLoading } = useSession()

const isAuthenticated = computed(() => session.isAuthenticated)
</script>

<style scoped>
.home {
  max-width: 600px;
  margin: 0 auto;
  text-align: center;
}

.loading {
  font-size: 1.2rem;
  color: #666;
}

.authenticated,
.not-authenticated {
  padding: 2rem;
  border-radius: 8px;
  background-color: #f8f9fa;
  border: 1px solid #e9ecef;
}

.authenticated {
  background-color: #d4edda;
  border-color: #c3e6cb;
}

.btn {
  display: inline-block;
  padding: 0.75rem 1.5rem;
  margin-top: 1rem;
  text-decoration: none;
  border-radius: 4px;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-primary {
  background-color: #007bff;
  color: white;
}

.btn-primary:hover {
  background-color: #0056b3;
  color: white;
}
</style>
