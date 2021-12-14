<template>
  <div v-if="showAddTask">
    <AddTask @add-task="addTask"/>
  </div>
  <Tasks @toggle-reminder="toggleReminder" @delete-task="deleteTask" :tasks="tasks"/>
</template>

<script lang="ts">
 import { TaskObject } from '@/types';
  import { defineComponent } from 'vue';
  import AddTask from '../components/AddTask.vue';
  import Tasks from '../components/Tasks.vue';

  export default defineComponent({
    name: 'Home',
    components: {
      AddTask,
      Tasks
    },
    props: {
      showAddTask: Boolean
    },
    data() {
      return {
        tasks: [] as TaskObject[]
      }
    },
    methods: {
      async addTask(task: TaskObject) {
        const res = await fetch('api/tasks', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(task)
        });
        const data = await res.json();

        this.tasks = [ ...this.tasks, data ];
      },
      async deleteTask(id: string) {
        let taskToDelete = this.tasks.filter(task => task.id === id)[0];
        if (taskToDelete && confirm('Really delete task ' + taskToDelete.text)) {
          const res = await fetch('api/tasks/' + id, {
            method: 'DELETE',
          }) 

          res.status === 200 ? 
            (this.tasks = this.tasks.filter((task) => task.id !== id))
              : alert('Error deleting task');
        }
      },
      async toggleReminder(id: string) {
        const taskToToggle = await this.fetchTask(id);
        const updTask = { ...taskToToggle, reminder: !taskToToggle.reminder }

        const res = await fetch('api/tasks/' + id, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(updTask)
        });
        const data = await res.json();

        this.tasks = this.tasks.map((task) => task.id === id ? { ...task, reminder: data.reminder } : task )
      },
      async fetchTasks() {
        const res = await fetch('api/tasks')
        const data = await res.json();
        return data;
      },
      async fetchTask(id: string) {
        const res = await fetch('api/tasks/' + id)
        const data = await res.json();
        return data;
      }
    },
    async created() {
      this.tasks = await this.fetchTasks()
    }
  })


</script>