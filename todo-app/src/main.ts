import  { createApp } from 'vue'
import App from './App.vue'
import router from './router';

// fontawesome stuff
import { library } from '@fortawesome/fontawesome-svg-core';
import { faTimes } from '@fortawesome/free-solid-svg-icons/faTimes'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
library.add(faTimes);

let app = createApp(App);
app.use(router);
app.component('font-awesome-times-icon', FontAwesomeIcon);
app.mount('#app');
