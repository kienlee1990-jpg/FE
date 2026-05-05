<script setup>
  import { computed } from 'vue'
  import { useRoute } from 'vue-router'
  import BaseLayout from './components/BaseLayout.vue'

  const route = useRoute()
  const isLoginRoute = computed(() => route.path === '/login')
</script>

<template>
  <router-view v-if="isLoginRoute" />
  <BaseLayout v-else>
    <router-view />
  </BaseLayout>
</template>
