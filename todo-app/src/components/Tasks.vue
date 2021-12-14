<template>
  <div>
    <div :key="task.id" v-for="task in tasks">
      <Task @toggle-reminder="$emit('toggle-reminder', task.id)" @delete-task="$emit('delete-task', task.id)" :task="task" />
    </div>
  </div>
</template>

<script lang="ts">
  import type { TaskObject } from '../types';
  import { defineComponent, PropType } from 'vue'
  import Task from './Task.vue'

  export default defineComponent({
    name: 'Tasks',
    components: {
      Task
    },
    emits: ['delete-task', 'toggle-reminder'],
    props: {
      tasks: {
        type: Array as PropType<TaskObject[]>,
        default: []
      }
    }
  })
</script>

<style></style>