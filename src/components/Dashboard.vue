<template>
  <div class="container">
    <div class="row justify-content-center">
      <div class="col-md-8">
        <div class="card">
          <div v-if="user.loggedIn">
            <NavBar />
            <div class="my-4">
              <button @click.prevent="signOut" class="btn btn-primary">Log Out</button>
            </div>
            <div v-if="randomUser && randomUser.pictures && randomUser.pictures.length">
              <div class="image-container">
                <button @click="prevImage" class="nav-button-left" :disabled="currentImageIndex === 0">
                  <img src="@/assets/Pfeillinks.jpg" alt="Left Arrow">
                </button>
                <div class="image-wrapper">
                  <div class="profile-overlay">
                    <img :src="randomUser.photoURL" alt="Profile Picture" class="small-profile-picture">
                    <h3>{{ randomUser.displayName }}</h3>
                  </div>
                  <img :src="randomUser.pictures[currentImageIndex]" alt="User Picture" class="main-image">
                  <button @click="viewProfile" class="view-profile-button">View Profile</button>
                </div>
                <button @click="nextImage" class="nav-button-right" :disabled="currentImageIndex === randomUser.pictures.length - 1">
                  <img src="@/assets/Pfeilrechts.jpg" alt="Right Arrow">
                </button>
              </div>
            </div>
            <div v-else>
              <p>No pictures uploaded by this user.</p>
            </div>
          </div>
          <div v-else class="alert alert-danger" role="alert">
            Login credentials are incorrect!
            <router-link to="/">Back to Login</router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useStore } from "vuex";
import { useRouter } from "vue-router";
import { computed, ref, onMounted } from "vue";
import { auth } from '../firebaseConfig';
import NavBar from './NavBar.vue';

export default {
  name: "DashboardComponent",
  components: {
    NavBar
  },
  setup() {
    const store = useStore();
    const router = useRouter();

    const user = computed(() => store.getters.user);
    const randomUser = computed(() => store.getters.randomUser);
    const currentImageIndex = ref(0);

    const signOut = async () => {
      await store.dispatch('logOut');
      router.push('/');
    };

    const prevImage = () => {
      if (currentImageIndex.value > 0) {
        currentImageIndex.value -= 1;
      }
    };

    const nextImage = () => {
      if (currentImageIndex.value < randomUser.value.pictures.length - 1) {
        currentImageIndex.value += 1;
      }
    };

    const viewProfile = () => {
      router.push({ name: 'UserProfile', params: { userId: randomUser.value.uid } });
    };

    onMounted(async () => {
      auth.onAuthStateChanged(async user => {
        if (user) {
          await store.dispatch("fetchUser", user);
          await store.dispatch('fetchRandomUser');
        } else {
          router.push('/');
        }
      });
    });

    return { user, randomUser, currentImageIndex, signOut, prevImage, nextImage, viewProfile };
  }
};
</script>

<style scoped>
/* Custom styles for DashboardComponent */

.container {
  background-color: #ffffff;
  padding: 20px;
}

.card {
  background-color: #ffffff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.alert-danger {
  background-color: #ffcccc;
  color: #cc0000;
  border: 1px solid #cc0000;
}

.btn-primary {
  background-color: #007bff;
  border-color: #007bff;
}

.my-4 {
  margin-top: 1.5rem !important;
  margin-bottom: 1.5rem !important;
}

.profile-picture {
  border-radius: 50%;
  margin-top: 20px;
  width: 100px;
  height: 100px;
}

.image-container {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  margin-top: 20px;
}

.image-wrapper {
  position: relative;
  display: flex;
  justify-content: center;
}

.profile-overlay {
  position: absolute;
  top: 10px;
  left: 10px;
  display: flex;
  align-items: center;
  z-index: 1;
  color: white;
  text-shadow: 0 0 5px black;
}

.small-profile-picture {
  border-radius: 50%;
  width: 50px;
  height: 50px;
  margin-right: 10px;
}

.main-image {
  max-width: 100%;
  max-height: 400px;
  border-radius: 8px;
}

.nav-button-left,
.nav-button-right {
  background: none;
  border: none;
  cursor: pointer;
  width: 50px;
  height: 50px;
}

.nav-button-left img,
.nav-button-right img {
  width: 100%;
  height: 100%;
}

.nav-button-left:disabled,
.nav-button-right:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.view-profile-button {
  position: absolute;
  bottom: 10px;
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(0, 0, 0, 0.6);
  color: white;
  border: none;
  border-radius: 4px;
  padding: 5px 10px;
  cursor: pointer;
}

.view-profile-button:hover {
  background-color: rgba(0, 0, 0, 0.8);
}
</style>
