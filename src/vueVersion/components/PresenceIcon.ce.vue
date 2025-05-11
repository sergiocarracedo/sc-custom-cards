<script setup lang="ts">
import { computed, inject, type Ref } from "vue"
import type { HomeAssistant } from "custom-card-helpers"

const props = defineProps({
  entityId: {
    type: String,
    required: true,
  },
})

const hass: Ref<HomeAssistant | undefined> = inject("hass")

const state = computed(() => {
  return hass.value?.states?.[props.entityId]
})
</script>
<template>
  <div class="presence">
    {{ state }}
  </div>
</template>
<style scoped lang="scss">
.temphum {
  display: flex;
  gap: 10px;
  font-size: 28px;
  font-weight: 300;
  line-height: 1em;
  align-items: baseline;
  justify-content: flex-end;

  &__humidity {
    font-size: 0.55em;
    opacity: 0.7;
  }
}
</style>
