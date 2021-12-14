<template>
  <header>
    <h1>{{ title }}</h1>
    <Button
      v-show="isHomePage" 
      @btn-click="$emit('toggle-add-task')" 
      :text="showAddTask ? 'Close' : 'Add Task'" 
      :color="showAddTask ? 'red' : 'green'"
    />
  </header>
</template>

<script lang="ts">
  import { defineComponent } from 'vue';
  import Button from './Button.vue';

  export default defineComponent({
   name: 'Header',
    props: {
      title: {
        type: String,
        default: 'Hello World'
      },
      showAddTask: Boolean
    },
    components: {
      Button
    },
    computed: {
      isHomePage() {
        return this.$route.path === '/'
      }
    }
  });

</script>

<style scoped>
  header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }
</style>