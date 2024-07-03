<template>
  <div class="container" v-if="loading">
    <div>Loading...</div>
  </div>
  <div class="container" v-else>
    <div class="row justify-content-center">
      <div class="col-md-8">
        <div class="card">
          <div v-if="user.loggedIn">
            <NavBar />
            <div class="card-body">
              <div class="profile-info">
                <img :src="photoURL" alt="Profile Picture" class="profile-picture">
                <button @click="sendFlameRequest" class="flames-button">Flames</button>
                <div class="label-container">
                  <label class="label">Name:</label>
                  <span>{{ tempName }}</span>
                </div>
              </div>
              <div class="description">
                <textarea rows="10" id="biography" v-model="biography" disabled></textarea>
              </div>
              <div class="additional-pictures">
                <div class="pictures-list">
                  <div v-for="picture in pictures" :key="picture" class="picture-item">
                    <div class="picture-container">
                      <img :src="picture" alt="User Picture" class="additional-picture">
                    </div>
                  </div>
                </div>
              </div>
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
import { useStore } from 'vuex';
import { computed, ref, onMounted } from 'vue';
import { query, getDocs, collection, where, updateDoc, arrayUnion } from 'firebase/firestore';
import NavBar from './NavBar.vue';
import { firestore } from '../firebaseConfig';

export default {
  name: 'UserProfile',
  components: {
    NavBar
  },
  props: {
    userId: {
      type: String,
      required: true
    }
  },
  setup(props) {
    const store = useStore();
    const user = computed(() => store.getters.user);
    const biography = ref('');
    const tempName = ref('');
    const photoURL = ref('');
    const pictures = ref([]);
    const flameRequests = ref([]);
    const loading = ref(true);

    const loadUserData = async () => {
      try {
        const snapshot = await getDocs(
          query(collection(firestore, 'users'), where('uid', '==', props.userId))
        );

        snapshot.forEach((doc) => {
          const userData = doc.data();
          biography.value = userData.biography || '';
          tempName.value = userData.displayName || '';
          photoURL.value = userData.photoURL || '';
          pictures.value = userData.pictures || [];
          flameRequests.value = Array.isArray(userData.flameRequests) ? userData.flameRequests : [];
        });
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        loading.value = false;
      }
    };

    const sendFlameRequest = async () => {
      try {
        const senderPhotoURL = user.value.data.photoURL;

        const snapshot = await getDocs(
          query(collection(firestore, 'users'), where('uid', '==', props.userId))
        );

        snapshot.forEach(async (doc) => {
          await updateDoc(doc.ref, {
            flameRequests: arrayUnion({
              uid: user.value.data.uid,
              photoURL: senderPhotoURL
            })
          });
        });
      } catch (error) {
        console.error('Error sending flame request:', error);
      }
    };

    onMounted(loadUserData);

    return {
      user,
      biography,
      tempName,
      photoURL,
      pictures,
      flameRequests,
      sendFlameRequest,
      loading
    };
  }
};
</script>

<style scoped>
/* Custom styles for UserProfile */

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

.profile-info {
  margin-top: 20px;
}

.profile-picture {
  border-radius: 50%;
  margin-bottom: 20px;
  width: 100px;
  height: 100px;
}

.flames-button {
  background-color: #ff6666;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  margin-bottom: 20px;
}

.card-body {
  color: #333333;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.label-container {
  display: flex;
  justify-content: space-between;
  width: 100%;
}

.label {
  font-weight: bold;
  flex: 1;
}

.alert-danger {
  background-color: #ffcccc;
  color: #cc0000;
  border: 1px solid #cc0000;
}

.description textarea {
  width: 100%;
  margin-top: 10px;
}

.additional-pictures {
  margin-top: 20px;
  width: 100%;
  text-align: left;
}

.pictures-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.picture-item {
  width: 100px;
  height: 100px;
  overflow: hidden;
  border-radius: 8px;
  position: relative;
}

.picture-container {
  position: relative;
  width: 100%;
  height: 100%;
}

.additional-picture {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>
