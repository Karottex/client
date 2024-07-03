<template>
  <div class="container">
    <div class="row justify-content-center">
      <div class="col-md-8">
        <div class="card">
          <div v-if="user.loggedIn">
            <NavBar />

            <div class="card-body">
              <div class="profile-info">
                <input type="file" ref="fileInput" @change="handleFileChange" style="display: none;" />
                <img :src="photoURL" alt="Profile Picture" class="profile-picture" @click="triggerFileInput">

                <div class="flame-requests">
                  <h3>Flame Requests</h3>
                  <div class="pictures-list">
                    <div v-for="request in flameRequests" :key="request.uid" class="picture-item">
                      <div class="picture-container">
                        <button @click="goToFriendsPage" class="friends-button">Friends</button>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="label-container">
                  <label class="label">Name:</label>
                  <span v-if="!editingName">{{ tempName }}</span>
                  <input v-else type="text" v-model="tempName">
                  <button class="icon-button" @click="editingName = !editingName">
                    <img src="@/assets/Change.jpg" alt="Change Icon">
                  </button>
                  <button v-if="editingName" class="icon-button" @click="saveName">
                    <img src="@/assets/Save.jpg" alt="Save Icon">
                  </button>
                </div>

                <div class="label-container">
                  <label class="label">Email:</label>
                  <span v-if="!editingEmail">{{ tempEmail }}</span>
                  <input v-else type="text" v-model="tempEmail">
                  <button class="icon-button" @click="editingEmail = !editingEmail">
                    <img src="@/assets/Change.jpg" alt="Change Icon">
                  </button>
                  <button v-if="editingEmail" class="icon-button" @click="saveEmail">
                    <img src="@/assets/Save.jpg" alt="Save Icon">
                  </button>
                </div>
              </div>

              <div class="description">
                <label for="biography">Biography:</label>
                <textarea id="biography" v-model="biography"></textarea>
                <button @click="saveBiography">Save Biography</button>
              </div>

              <div class="additional-pictures">
                <input type="file" ref="picturesInput" @change="handlePicturesChange" multiple style="display: none;" />
                <button @click="triggerPicturesInput" :disabled="pictures.length >= 10">Upload Pictures</button>
                <div v-if="pictures.length >= 10" class="error-message">You can upload up to 10 pictures only.</div>
                <div class="pictures-list">
                  <div
                    v-for="picture in pictures"
                    :key="picture"
                    class="picture-item"
                  >
                    <div class="picture-container">
                      <img :src="picture" alt="User Picture" class="additional-picture">
                      <img
                        src="@/assets/Trash.jpg"
                        alt="Delete Icon"
                        class="delete-icon"
                        @click="deletePicture(picture)"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-else class="alert alert-danger" role="alert">
            Login credentials are incorrect! <router-link to="/">Back to Login</router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useStore } from 'vuex';
import { computed, ref, onMounted } from 'vue';
import { query, getDocs, collection, where, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import NavBar from './NavBar.vue';
import { firestore, storage } from '../firebaseConfig';
import { useRouter } from 'vue-router';

export default {
  name: 'ProfileComponent',
  components: {
    NavBar
  },
  setup() {
    const store = useStore();
    const router = useRouter();
    const user = computed(() => store.getters.user);
    const biography = ref('');
    const tempName = ref('');
    const tempEmail = ref('');
    const editingName = ref(false);
    const editingEmail = ref(false);
    const fileInput = ref(null);
    const picturesInput = ref(null);
    const photoURL = ref(user.value.data ? user.value.data.photoURL : '');
    const pictures = ref([]);
    const flameRequests = ref([]);

    const loadUserData = async () => {
      try {
        if (user.value.data) {
          const snapshot = await getDocs(
            query(collection(firestore, 'users'), where('uid', '==', user.value.data.uid))
          );

          snapshot.forEach((doc) => {
            const userData = doc.data();
            biography.value = userData.biography || '';
            tempName.value = userData.displayName || '';
            tempEmail.value = userData.email || '';
            photoURL.value = userData.photoURL || '';
            pictures.value = userData.pictures || [];
            flameRequests.value = userData.flameRequests || [];
          });
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    };

    const saveBiography = async () => {
      try {
        if (user.value.data) {
          const snapshot = await getDocs(
            query(collection(firestore, 'users'), where('uid', '==', user.value.data.uid))
          );
          snapshot.forEach((doc) => {
            updateDoc(doc.ref, {
              biography: biography.value
            });
          });
        }
      } catch (error) {
        console.error('Error saving biography:', error);
      }
    };

    const saveName = async () => {
      try {
        if (user.value.data) {
          const snapshot = await getDocs(
            query(collection(firestore, 'users'), where('uid', '==', user.value.data.uid))
          );
          snapshot.forEach((doc) => {
            updateDoc(doc.ref, {
              displayName: tempName.value
            });
          });
          editingName.value = false; // Disable name editing after saving
        }
      } catch (error) {
        console.error('Error saving name:', error);
      }
    };

    const saveEmail = async () => {
      try {
        if (user.value.data) {
          const snapshot = await getDocs(
            query(collection(firestore, 'users'), where('uid', '==', user.value.data.uid))
          );
          snapshot.forEach((doc) => {
            updateDoc(doc.ref, {
              email: tempEmail.value
            });
          });
        }
      } catch (error) {
        console.error('Error saving email:', error);
      }
    };

    const handleFileChange = async (event) => {
      const file = event.target.files[0];
      if (file && user.value.data) {
        const storageReference = storageRef(storage, `profilePictures/${user.value.data.uid}`);
        try {
          const snapshot = await uploadBytes(storageReference, file);
          const downloadURL = await getDownloadURL(snapshot.ref);

          const snapshotUsers = await getDocs(
            query(collection(firestore, 'users'), where('uid', '==', user.value.data.uid))
          );
          snapshotUsers.forEach((doc) => {
            updateDoc(doc.ref, {
              photoURL: downloadURL
            });
          });
          
          store.commit('SET_USER', {
            ...user.value.data,
            photoURL: downloadURL
          });
          
          photoURL.value = downloadURL; // Update the local photoURL value
        } catch (error) {
          console.error('Error uploading file:', error);
        }
      }
    };

    const handlePicturesChange = async (event) => {
      const files = event.target.files;
      if (files && user.value.data) {
        const newPictures = [];
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const storageReference = storageRef(storage, `userPictures/${user.value.data.uid}/${file.name}`);
          try {
            const snapshot = await uploadBytes(storageReference, file);
            const downloadURL = await getDownloadURL(snapshot.ref);

            newPictures.push(downloadURL);
          } catch (error) {
            console.error('Error uploading file:', error);
          }
        }

        if (pictures.value.length + newPictures.length <= 10) {
          const snapshotUsers = await getDocs(
            query(collection(firestore, 'users'), where('uid', '==', user.value.data.uid))
          );
          snapshotUsers.forEach((doc) => {
            updateDoc(doc.ref, {
              pictures: arrayUnion(...newPictures)
            });
          });

          pictures.value.push(...newPictures); // Update the local pictures array
        } else {
          console.error('Cannot upload more than 10 pictures');
        }
      }
    };

    const deletePicture = async (picture) => {
      if (user.value.data) {
        const pictureRef = storageRef(storage, picture);
        try {
          await deleteObject(pictureRef);
          
          const snapshotUsers = await getDocs(
            query(collection(firestore, 'users'), where('uid', '==', user.value.data.uid))
          );
          snapshotUsers.forEach((doc) => {
            updateDoc(doc.ref, {
              pictures: arrayRemove(picture)
            });
          });

          pictures.value = pictures.value.filter(p => p !== picture); // Update the local pictures array
        } catch (error) {
          console.error('Error deleting picture:', error);
        }
      }
    };

    const triggerFileInput = () => {
      fileInput.value.click();
    };

    const triggerPicturesInput = () => {
      if (pictures.value.length < 10) {
        picturesInput.value.click();
      }
    };

    const goToFriendsPage = () => {
      router.push('/friends');
    };

    onMounted(loadUserData);

    return {
      user,
      biography,
      tempName,
      tempEmail,
      editingName,
      editingEmail,
      fileInput,
      picturesInput,
      handleFileChange,
      handlePicturesChange,
      triggerFileInput,
      triggerPicturesInput,
      saveBiography,
      saveName,
      saveEmail,
      photoURL,
      pictures,
      flameRequests,
      deletePicture,
      goToFriendsPage
    };
  }
};
</script>
<style scoped>
/* Custom styles for ProfileComponent */
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
  cursor: pointer;
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

.description {
  margin-top: auto;
  margin-bottom: 20px;
}

.icon-button {
  display: inline-block;
  color: white;
  border: none;
  cursor: pointer;
  width: 15px;
  height: 15px;
  display: flex;
  align-items: center;
}

.icon-button img {
  width: 15px;
  margin-bottom: 15px;
}

.icon-button:hover {
  color: red;
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

.delete-icon {
  position: absolute;
  top: 5px;
  right: 5px;
  width: 20px;
  height: 20px;
  cursor: pointer;
}

.error-message {
  color: red;
  font-size: 12px;
}

.flame-requests {
  margin-top: 20px;
}
.friends-button{
  align: center;
}
</style>
