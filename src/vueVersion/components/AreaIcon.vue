<script setup lang="ts">
defineProps({
  icon: {
    type: [String, null],
  },
  color: {
    type: String,
    default: "#999",
  },
})
</script>
<template>
  <div
    class="area-icon"
    v-if="icon"
    :style="{ color: 'var(--black2)', '--area-color': color }"
  >
    <ha-icon :icon="icon"></ha-icon>
  </div>
</template>
<style lang="scss">
.area-icon {
  background-color: var(--area-color);
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100px;
  height: 100px;
  ha-icon {
    opacity: 0.7;
    --mdc-icon-size: 40px;
    width: var(--mdc-icon-size);
  }
}
</style>
