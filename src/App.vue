<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AppHeader from './components/AppHeader.vue'
import AppFooter from './components/AppFooter.vue'

const route = useRoute()
// 直播房间页使用极简布局（无全站头尾）
const bare = computed(() => route.meta.bare === true)
</script>

<template>
  <div class="gg-page-body" :class="{ 'is-bare': bare }">
    <AppHeader v-if="!bare" />
    <main>
      <router-view v-slot="{ Component }">
        <transition name="gg-page" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
    <AppFooter v-if="!bare" />
  </div>
</template>

<style scoped>
.is-bare {
  padding-top: 0;
}
</style>
