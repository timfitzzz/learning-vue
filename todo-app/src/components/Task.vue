<template>
  <div @dblclick.prevent="$emit('toggle-reminder', task!.id)" :class="[task && task.reminder ? 'reminder' : '', 'task']" class="task">
    <h3 @mousedown="preventDefault">
      {{task && task.text}}
      <font-awesome-times-icon @click="onDelete(task!.id)" class="fas" icon="times"/>
    </h3>
    <p @mousedown="preventDefault">{{ task && task.day }}</p>
  </div>
</template>

<script lang="ts">
  import { TaskObject } from "@/types";
  import { defineComponent, PropType } from "vue";

  export default defineComponent({
    name: 'Task',
    props: {
      task: {
        type: Object as PropType<TaskObject>
      }
    },
    methods: {
      onDelete(id: string) {
        this.$emit('delete-task', id);
      },
      preventDefault(event: MouseEvent) {
        if (event.detail === 2) {
          event.preventDefault();
        }
      }
    }
  });

</script>

<style>
  .fas {
    color: red;
  }
  
  .task {
    background: #f4f4f4;
    margin: 5px;
    padding: 10px 20px;
    cursor: pointer;
  }

  .task.reminder {
    border-left: 5px solid green;
  }

  .task h3 {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
</style>