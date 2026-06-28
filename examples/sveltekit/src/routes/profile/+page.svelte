<script lang="ts">
  let { data } = $props();
</script>

<h1>Profile</h1>

{#if data.user}
  <pre>{JSON.stringify(data.user, null, 2)}</pre>
{:else}
  <p>No active session. <a href="/">Go home</a>.</p>
{/if}
