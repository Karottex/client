import { createApp } from 'vue';
import App from './App.vue';
import 'firebase/auth';
import 'firebase/firestore';
import './firebaseConfig'; // Import your Firebase configuration from firebaseConfig.js
import store from './store'; // Import your Vuex store
import router from './router'; // Import your router instance
import './styles/global.css';


const app = createApp(App);
app.use(router);
app.use(store);

// Mount the app to the DOM
app.mount('#app');