<template>
  <div class="profile">
    <h2>User Profile</h2>
    
    <div v-if="isLoading" class="loading">
      Loading user data...
    </div>
    
    <div v-else-if="error" class="error">
      <p>Error loading user data: {{ error.message }}</p>
      <button @click="refetchUser" class="btn btn-secondary">
        Try Again
      </button>
    </div>
    
    <div v-else-if="user" class="user-info">
      <div class="user-card">
        <h3>{{ user.displayName || user.userName }}</h3>
        <p><strong>Email:</strong> {{ user.emails?.[0]?.value || 'N/A' }}</p>
        <p><strong>User ID:</strong> {{ user.id }}</p>
        <p><strong>Provider:</strong> {{ user.provider }}</p>
        <p><strong>Last Login:</strong> {{ formatDate(user.lastLogin) }}</p>
        
        <div v-if="user.photos?.[0]" class="user-photo">
          <img :src="user.photos[0].value" :alt="user.displayName" />
        </div>
      </div>
    </div>
    
    <div v-else class="no-user">
      <p>No user data available</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useUser } from '@authdog/vue'

const { user, isLoading, error, fetchUser } = useUser()

// You would typically get this from environment variables
const PUBLIC_KEY = 'pk_your_public_key_here'

onMounted(async () => {
  await fetchUser(PUBLIC_KEY)
})

const refetchUser = async () => {
  await fetchUser(PUBLIC_KEY)
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString()
}
</script>

<style scoped>
.profile {
  max-width: 600px;
  margin: 0 auto;
}

.loading,
.error {
  text-align: center;
  padding: 2rem;
}

.error {
  color: #dc3545;
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  border-radius: 4px;
}

.user-info {
  margin-top: 2rem;
}

.user-card {
  background-color: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 2rem;
}

.user-card h3 {
  margin-top: 0;
  color: #333;
}

.user-card p {
  margin: 0.5rem 0;
  color: #666;
}

.user-photo {
  margin-top: 1rem;
}

.user-photo img {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
}

.btn {
  display: inline-block;
  padding: 0.5rem 1rem;
  margin-top: 1rem;
  text-decoration: none;
  border-radius: 4px;
  font-weight: 500;
  transition: all 0.2s;
  border: none;
  cursor: pointer;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background-color: #545b62;
}
</style>
