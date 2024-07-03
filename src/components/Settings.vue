<template>
  <div class="container">
    <div class="row justify-content-center">
      <div class="col-md-8">
        <div class="card">
          <!-- Conditional rendering based on user login status -->
          <div v-if="user.loggedIn">
            <!-- Navigation bar component -->
            <Nav-Bar />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useStore } from "vuex";
import { computed, onMounted } from "vue";
import { auth } from '../firebaseConfig';
import NavBar from './NavBar.vue';

export default {
  name: "SettingsComponent",

  components: {
    NavBar
  },

  setup() {
    const store = useStore();

    // Compute user information from the store
    const user = computed(() => store.getters.user);

    // Use onMounted hook to ensure store is available
    onMounted(() => {
      auth.onAuthStateChanged(user => {
        store.dispatch("fetchUser", user);
      });
    });

    return { user };
  }
};
</script>

<style scoped>
/* Custom styles for SettingsComponent */

.container {
  background-color: #ffffff; /* White background */
  padding: 20px;
}

.card {
  background-color: #ffffff; /* White background */
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
</style>
