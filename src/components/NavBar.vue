<template>
  <nav class="navbar">
    <router-link to="/dashboard" class="navbar-brand">Flames&Burns</router-link>
    <ul class="navbar-nav">
      <li class="nav-item">
        <router-link to="/settings" class="nav-link">Settings</router-link>
      </li>
      <li class="nav-item">
        <router-link to="/dashboard" class="nav-link">Dashboard</router-link>
      </li>
      <li class="nav-item">
        <router-link to="/profile" class="nav-link">
          <img :src="user.photoURL" alt="Profile Picture" class="profile-picture" />
        </router-link>
      </li>
    </ul>
  </nav>
</template>

<script>
import { useStore } from 'vuex';
import { computed } from 'vue';

export default {
  name: 'NavBar',
  setup() {
    const store = useStore();
    const user = computed(() => store.getters.user.data);

    return { user };
  }
};
</script>

<style scoped>
/* Custom styles for NavBar component */

.navbar {
  background-color: #ff4d4f; /* Lovely red */
  color: #ffffff;
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: 10px 10px 0 0; /* Rounded bottom edges */
}

.navbar-nav {
  list-style-type: none;
  margin: 0;
  padding: 0;
  display: flex;
}

.nav-item {
  margin-right: 20px;
}

.nav-link {
  text-decoration: none;
  color: inherit;
  cursor: pointer;
  transition: color 0.3s;
}

.navbar-brand {
  color: #ffffff;
}

.nav-link:hover {
  color: #ffffff; /* White on hover */
}

.navbar-brand:hover {
  color: #ffffff; /* White on hover */
}

.profile-picture {
  border-radius: 50%;
  width: 30px;
  height: 30px;
}
</style>
