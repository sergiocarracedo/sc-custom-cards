<script setup lang="ts">
import { computed, onBeforeMount, provide } from "vue"
import type { AreaCardConfig } from "./types"
import type { HomeAssistant } from "custom-card-helpers"
import type { Area } from "../types"

import TempHum from "../components/TempHum.vue"
import AreaIcon from "../components/AreaIcon.vue"
import { areaColors } from "../area-colors.ts"

const props = defineProps({
  hass: {
    type: Object as () => HomeAssistant & { areas: Record<string, Area> },
    required: true,
  },
  config: { type: Object as () => AreaCardConfig, required: true },
})

const area = computed(() => {
  return props.hass?.areas?.[props.config.area]
})

onBeforeMount(() => {
  setTimeout(() => {
    console.log("test", props.hass)
    console.log(area.value)
  }, 500)
})

provide(
  "hass",
  computed(() => props.hass),
)

const areaColor = computed(
  () =>
    (area.value && area.value.area_id && areaColors[area.value.area_id]) ||
    props.config.color ||
    "#999",
)

const onClick = () => {
  console.log("onClick", props.hass)
}
</script>

<template>
  <ha-card @click="onClick" class="area-card">
    <div class="card-content area">
      <template v-if="area">
        <header class="area__header">
          <h1 class="area__name">{{ area.name }}</h1>
          <TempHum
            :temperature-entity-id="area.temperature_entity_id ?? undefined"
            :humidity-entity-id="area.humidity_entity_id ?? undefined"
          ></TempHum>
          <
        </header>

        <AreaIcon
          class="area__icon"
          :icon="area.icon"
          :color="areaColor"
        ></AreaIcon>

        <div class="sensors">
          tezxt
          {{ config }}
        </div>
      </template>
      <template v-else>Invalid area</template>
    </div>
  </ha-card>
</template>

<style lang="scss">
.area {
  --area-color: v-bind(areaColor);
  min-height: 150px;
  position: relative;
  overflow: hidden;
  border-radius: var(--ha-card-border-radius, 12px);

  &__header {
    display: flex;
    gap: 10px;
    justify-content: space-between;
    align-items: baseline;
    margin-bottom: 16px;
  }
  &__name {
    font-size: 16px;
    margin: 0;
    font-weight: 500;
  }

  .area__icon {
    position: absolute;
    left: -10px;
    bottom: -10px;
  }
}
</style>
