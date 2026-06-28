<script lang="ts">
  let { data } = $props();
</script>

<h1>Authdog + SvelteKit</h1>

{#if data.isAuthenticated}
  <p>You have an active session. Visit your <a href="/profile">profile</a>.</p>
{:else}
  <p>You are not signed in.</p>
{/if}
