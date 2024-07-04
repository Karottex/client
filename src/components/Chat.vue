<template>
  <div class="chat-container">
    <div v-if="loading" class="loading">Loading chat...</div>
    <div v-else-if="error" class="error">Error loading chat: {{ error.message }}</div>
    <div v-else>
      <div class="messages">
        <div v-if="chatData.messages && chatData.messages.length > 0">
          <div v-for="message in chatData.messages" :key="message.timestamp" class="message">
            <strong>{{ message.sender }}:</strong> {{ message.text }}
          </div>
        </div>
        <div v-else class="placeholder">No messages yet.</div>
      </div>
      <div class="new-message">
        <input v-model="newMessage" @keyup.enter="sendMessage" placeholder="Type a message..." />
        <button @click="sendMessage">Send</button>
      </div>
    </div>
  </div>
</template>

<script>
import { doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { firestore } from '@/firebaseConfig';

export default {
  name: 'Chat',
  props: {
    chatId: String,
  },
  data() {
    return {
      chatData: null,
      newMessage: '',
      error: null,
      loading: true,
    };
  },
  methods: {
    async loadChat() {
      try {
        const chatDoc = await getDoc(doc(firestore, 'chats', this.chatId));
        if (chatDoc.exists()) {
          this.chatData = chatDoc.data();
        } else {
          throw new Error('Chat does not exist');
        }
      } catch (err) {
        this.error = err;
        console.error('Error loading chat:', err);
      } finally {
        this.loading = false;
      }
    },
    async sendMessage() {
      if (this.newMessage.trim() === '') return;
      try {
        const user = this.$store.getters.user.data;
        if (!user) throw new Error('User not logged in');

        const message = {
          sender: user.uid,
          text: this.newMessage,
          timestamp: new Date().toISOString(),
        };

        await updateDoc(doc(firestore, 'chats', this.chatId), {
          messages: arrayUnion(message),
        });

        this.chatData.messages.push(message);
        this.newMessage = '';
      } catch (err) {
        this.error = err;
        console.error('Error sending message:', err);
      }
    },
  },
  mounted() {
    this.loadChat();
  },
};
</script>

<style scoped>
.chat-container {
  padding: 20px;
  background-color: #f9f9f9;
}
.messages {
  margin-bottom: 20px;
  max-height: 300px;
  overflow-y: auto;
}
.message {
  padding: 10px;
  margin-bottom: 10px;
  background-color: #fff;
  border-radius: 5px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}
.new-message {
  display: flex;
  gap: 10px;
}
.new-message input {
  flex: 1;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
}
.new-message button {
  padding: 10px 20px;
  background-color: #007bff;
  color: #fff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}
.loading, .error, .placeholder {
  text-align: center;
  color: #888;
  margin-top: 20px;
}
</style>
