<template>
  <div id="app">
    <nav class="navbar">
      <div class="nav-brand">
        <h1>Vue App with Authdog</h1>
      </div>
      <div class="nav-links">
        <router-link to="/">Home</router-link>
        <router-link to="/profile" v-if="isAuthenticated">Profile</router-link>
        <router-link to="/permissions" v-if="isAuthenticated">Permissions</router-link>
        <router-link to="/login" v-if="!isAuthenticated">Login</router-link>
        <router-link to="/signup" v-if="!isAuthenticated">Sign Up</router-link>
        <button @click="handleSignOut" v-if="isAuthenticated" class="sign-out-btn">
          Sign Out
        </button>
      </div>
    </nav>
    
    <main class="main-content">
      <AuthdogProvider>
        <router-view />
      </AuthdogProvider>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useSession, useSignOut } from '@authdog/vue'
import { AuthdogProvider } from '@authdog/vue/client'

const { session } = useSession()
const { signOut } = useSignOut()

const isAuthenticated = computed(() => session.value.isAuthenticated)

const handleSignOut = async () => {
  await signOut()
}
</script>

<style scoped>
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background-color: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
}

.nav-brand h1 {
  margin: 0;
  color: #333;
}

.nav-links {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.nav-links a {
  text-decoration: none;
  color: #007bff;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.nav-links a:hover {
  background-color: #e9ecef;
}

.sign-out-btn {
  background-color: #dc3545;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.sign-out-btn:hover {
  background-color: #c82333;
}

.main-content {
  padding: 2rem;
}
</style>
