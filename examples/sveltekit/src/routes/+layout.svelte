<script lang="ts">
  import { onMount } from "svelte";
  import { initAuthdog } from "@authdog/sveltekit/client";

  let { data, children } = $props();

  // Consume the ?token=… left by the login redirect, persist it, then reload.
  onMount(() => initAuthdog());
</script>

<nav>
  <a href="/">Home</a>
  <a href="/profile">Profile</a>
  {#if data.isAuthenticated}
    <a href="/logout">Sign out</a>
  {:else}
    <span>Not signed in</span>
  {/if}
</nav>

<main>
  {@render children()}
</main>
