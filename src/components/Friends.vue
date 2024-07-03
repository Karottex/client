<template>
  <div class="container">
    <NavBar />
    <div class="selection">
      <button @click="selectedSection = 'requests'" :class="{ active: selectedSection === 'requests' }">Friend Requests</button>
      <button @click="selectedSection = 'chats'" :class="{ active: selectedSection === 'chats' }">Chats</button>
    </div>
    <div class="content">
      <div v-if="selectedSection === 'requests'">
        <h1>Friend Requests</h1>
        <div v-if="loading" class="loading">Loading friend requests...</div>
        <div v-else-if="error" class="error">Error loading friend requests: {{ error.message }}</div>
        <div v-else>
          <div v-for="friend in friends" :key="friend.uid" class="friend-item">
            <img :src="friend.photoURL" alt="Friend's profile picture" class="friend-picture" />
            <span>{{ friend.displayName }}</span>
            <button @click="acceptFriend(friend.uid)" class="accept-button">✔️</button>
            <button @click="removeFriend(friend.uid)" class="remove-button">❌</button>
          </div>
        </div>
      </div>
      <div v-else-if="selectedSection === 'chats'">
        <h1>Chats</h1>
        <!-- Chats content goes here -->
        <div class="placeholder">No chats available yet.</div>
      </div>
    </div>
  </div>
</template>


<script>
import NavBar from '@/components/NavBar.vue';
import { collection, getDocs, query, where, updateDoc, arrayRemove } from 'firebase/firestore';
import { firestore } from '@/firebaseConfig';

export default {
  name: 'Friends',
  components: {
    NavBar
  },
  data() {
    return {
      friends: [],
      loading: true,
      error: null,
      selectedSection: 'requests' // Added to manage the selected section
    };
  },
  methods: {
    async loadFriends() {
      try {
        const user = this.$store.getters.user.data;
        if (!user) throw new Error('User not logged in');

        const userQuery = query(collection(firestore, 'users'), where('uid', '==', user.uid));
        const userSnapshot = await getDocs(userQuery);
        const userData = userSnapshot.docs[0].data();
        const flameRequests = userData.flameRequests || [];

        if (flameRequests.length === 0) {
          this.friends = [];
        } else {
          const flameRequestUIDs = flameRequests.map(req => req.uid);
          const q = query(collection(firestore, 'users'), where('uid', 'in', flameRequestUIDs));
          const snapshot = await getDocs(q);
          const friendsList = [];
          snapshot.forEach(doc => {
            friendsList.push(doc.data());
          });
          this.friends = friendsList;
        }
      } catch (err) {
        this.error = err;
      } finally {
        this.loading = false;
      }
    },
    async acceptFriend(uid) {
      console.log(`Accepted friend with UID: ${uid}`);
    },
    async removeFriend(uid) {
      try {
        const user = this.$store.getters.user.data;
        if (!user) throw new Error('User not logged in');

        const userQuery = query(collection(firestore, 'users'), where('uid', '==', user.uid));
        const userSnapshot = await getDocs(userQuery);
        const userDoc = userSnapshot.docs[0];
        const userData = userDoc.data();

        const flameRequestToRemove = userData.flameRequests.find(req => req.uid === uid);
        if (flameRequestToRemove) {
          await updateDoc(userDoc.ref, {
            flameRequests: arrayRemove(flameRequestToRemove)
          });
        }

        this.loadFriends();
      } catch (err) {
        this.error = err;
        console.error('Error removing friend:', err);
      }
    }
  },
  mounted() {
    this.loadFriends();
  }
};
</script>

<style scoped>
.container {
  background-color: #ffffff;
  padding: 20px;
}
.selection {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}
.selection button {
  background: none;
  border: none;
  padding: 10px 20px;
  cursor: pointer;
  font-weight: bold;
  color: gray;
}
.selection button.active {
  color: #007bff;
  border-bottom: 2px solid #007bff;
}
.content {
  margin-top: 20px;
}
.loading, .error {
  color: #cc0000;
  font-weight: bold;
}
.friend-item {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}
.friend-picture {
  border-radius: 50%;
  margin-right: 10px;
  width: 50px;
  height: 50px;
}
.accept-button {
  color: green;
  width: 30px;
  height: 30px;
  margin-left: 50px;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 20px;
}
.remove-button {
  color: red;
  width: 30px;
  height: 30px;
  margin-left: 10px;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 20px;
}
.placeholder {
  color: #888;
  text-align: center;
  font-size: 16px;
  margin-top: 20px;
}
</style>

