<template>
  <div class="permissions">
    <h2>Permissions (authz)</h2>

    <p class="warning">
      ⚠️ This screen is <strong>presentational only</strong>. The permission
      list drives what the UI shows — it is <em>not</em> a security boundary.
      Every protected action must still be enforced server-side.
    </p>

    <button @click="load" :disabled="isLoading" class="btn btn-primary">
      {{ isLoading ? 'Loading...' : 'Fetch my permissions' }}
    </button>

    <div v-if="error" class="error">
      <p>Error: {{ error.message }}</p>
    </div>

    <ul v-else-if="permissions.length" class="perm-list">
      <li v-for="permission in permissions" :key="permission">
        {{ permission }}
      </li>
    </ul>

    <p v-else-if="loaded" class="empty">No permissions returned.</p>

    <div v-if="loaded" class="checks">
      <p>
        Can edit billing?
        <strong>{{ hasPermission('billing:edit') ? 'yes' : 'no' }}</strong>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuthz } from '@authdog/vue'

// `useAuthz` calls your own `/api/permissions` endpoint (override with
// `permissionsUrl`) using the current session token as a bearer credential.
const { permissions, isLoading, error, fetchPermissions, hasPermission } =
  useAuthz()

const loaded = ref(false)

const load = async () => {
  await fetchPermissions()
  loaded.value = true
}
</script>

<style scoped>
.permissions {
  max-width: 600px;
  margin: 0 auto;
}

.warning {
  padding: 1rem;
  background-color: #fff3cd;
  border: 1px solid #ffeeba;
  border-radius: 4px;
  color: #856404;
}

.btn {
  display: inline-block;
  padding: 0.5rem 1rem;
  margin-top: 1rem;
  border-radius: 4px;
  font-weight: 500;
  border: none;
  cursor: pointer;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background-color: #007bff;
  color: white;
}

.perm-list {
  margin-top: 1rem;
  text-align: left;
  display: inline-block;
}

.error {
  margin-top: 1rem;
  padding: 1rem;
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  border-radius: 4px;
  color: #721c24;
}

.empty {
  margin-top: 1rem;
  color: #666;
}

.checks {
  margin-top: 1.5rem;
  color: #333;
}
</style>
