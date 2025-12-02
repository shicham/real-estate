<script setup lang="ts">
import type { DateRange } from 'reka-ui'
import type { Ref } from 'vue'
import { CalendarDate, DateFormatter, getLocalTimeZone } from '@internationalized/date'
import { useStatsStore } from '@/stores/stats'
import { Calendar as CalendarIcon } from 'lucide-vue-next'
import { cn } from '@/lib/utils'

const statsStore = useStatsStore()

const start = statsStore.startDate.split('-')
const end = statsStore.endDate.split('-')

const value = ref({
  start: new CalendarDate(+start[0], +start[1] - 1, +start[2]),
  end: new CalendarDate(+end[0], +end[1] - 1, +end[2]),
}) as Ref<DateRange>

const df = new DateFormatter('en-US', {
  dateStyle: 'medium',
})
</script>

<template>
  <div :class="cn('grid gap-2', $attrs.class ?? '')">
    <Popover>
      <PopoverTrigger as-child>
        <Button
          id="date"
          variant="outline"
          :class="cn(
            'justify-start text-left font-normal',
            !value && 'text-muted-foreground',
          )"
        >
          <CalendarIcon class="mr-2 h-4 w-4" />

          <template v-if="value.start">
            <template v-if="value.end">
              {{ df.format(value.start.toDate(getLocalTimeZone())) }} - {{ df.format(value.end.toDate(getLocalTimeZone())) }}
            </template>

            <template v-else>
              {{ df.format(value.start.toDate(getLocalTimeZone())) }}
            </template>
          </template>
          <template v-else>
            Pick a date
          </template>
        </Button>
      </PopoverTrigger>
      <PopoverContent class="w-auto p-0" align="end">
        <RangeCalendar
          v-model="value"
          weekday-format="short"
          :number-of-months="2"
          initial-focus
          :placeholder="value.start"
          @update:start-value="(startDate: any) => value.start = startDate"
        />
      </PopoverContent>
    </Popover>
  </div>
</template>
