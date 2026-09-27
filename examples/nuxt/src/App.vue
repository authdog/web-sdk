<script setup lang="ts">
import { useSession, useSignIn, useSignOut, useUser } from "@authdog/nuxt";

const { session } = useSession();
const { user, load } = useUser();
const { signIn } = useSignIn();
const { signOut } = useSignOut();
</script>

<template>
  <main>
    <h1>Authdog × Nuxt</h1>
    <p>Signed in: {{ session.isAuthenticated ? "yes" : "no" }}</p>
    <button v-if="!session.isAuthenticated" type="button" @click="signIn()">
      Sign in
    </button>
    <template v-else>
      <button type="button" @click="load()">Load profile</button>
      <button type="button" @click="signOut('/')">Sign out</button>
      <pre>{{ user }}</pre>
    </template>
  </main>
</template>
