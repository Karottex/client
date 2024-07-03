<template>
  <div class="container">
    <NavBar />
    <div class="content">
      <h1>Friends</h1>
      <div v-if="loading" class="loading">Loading friends...</div>
      <div v-else-if="error" class="error">Error loading friends: {{ error.message }}</div>
      <div v-else>
        <div v-for="friend in friends" :key="friend.uid" class="friend-item">
          <img :src="friend.photoURL" alt="Friend's profile picture" class="friend-picture" />
          <span>{{ friend.displayName }}</span>
          <button @click="acceptFriend(friend.uid)" class="accept-button">✔️</button>
          <button @click="removeFriend(friend.uid)" class="remove-button">❌</button>
        </div>
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
      error: null
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
      // Akzeptieren eines Freundes (noch keine Aktion)
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

        // Aktualisieren Sie die friends-Liste nach dem Entfernen
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
}
.remove-button {
  color: red;
  width: 30px;
  height: 30px;
  margin-left: 10px;
}
</style>
