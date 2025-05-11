<script setup lang="ts">
import { computed, inject, type Ref } from "vue"
import type { HomeAssistant } from "custom-card-helpers"

const props = defineProps({
  temperatureEntityId: {
    type: String,
    default: undefined,
  },
  humidityEntityId: {
    type: String,
    default: undefined,
  },
})

const hass: Ref<HomeAssistant | undefined> = inject("hass")

const tempState = computed(
  () => hass.value?.states?.[props.temperatureEntityId],
)

const temperature = computed(() => {
  return tempState.value?.state !== undefined
    ? Math.round(parseFloat(tempState.value?.state))
    : "-"
})

const humState = computed(() => {
  return hass.value?.states?.[props.humidityEntityId]
})

const humidity = computed(() => {
  return humState.value?.state !== undefined
    ? Math.round(parseFloat(humState.value?.state))
    : "-"
})
</script>
<template>
  <div class="temphum">
    <div v-if="temperature !== undefined" class="temphum__temperature">
      {{ temperature }}{{ tempState?.attributes?.unit_of_measurement }}
    </div>
    <div v-if="humidity !== undefined" class="temphum__humidity">
      {{ humidity }}{{ humState?.attributes?.unit_of_measurement }}
    </div>
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
