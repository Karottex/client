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
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import NavBar from '@/components/NavBar.vue';
import { collection, getDocs, query, where } from 'firebase/firestore';
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
        const flameRequests = userData.flameRequests.map(req => req.uid) || [];

        console.log('FlameRequests UIDs:', flameRequests);

        if (flameRequests.length === 0) {
          this.friends = [];
        } else {
          const q = query(collection(firestore, 'users'), where('uid', 'in', flameRequests));
          const snapshot = await getDocs(q);
          const friendsList = [];
          snapshot.forEach(doc => {
            friendsList.push(doc.data());
          });
          console.log('Friends List:', friendsList);
          this.friends = friendsList;
        }
      } catch (err) {
        this.error = err;
      } finally {
        this.loading = false;
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
</style>
