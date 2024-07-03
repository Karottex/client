import { createStore } from 'vuex';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updateProfile } from 'firebase/auth';
import { auth, firestore } from './firebaseConfig';
import { addDoc, collection, getDocs } from 'firebase/firestore';

const defaultProfile = "https://t3.ftcdn.net/jpg/00/64/67/52/360_F_64675209_7ve2XQANuzuHjMZXP3aIYIpsDKEbF5dD.jpg";

const store = createStore({
  state: {
    user: {
      loggedIn: false,
      data: null
    },
    randomUser: null
  },
  getters: {
    user(state) {
      return state.user;
    },
    randomUser(state) {
      return state.randomUser;
    }
  },
  mutations: {
    SET_LOGGED_IN(state, value) {
      state.user.loggedIn = value;
    },
    SET_USER(state, data) {
      console.log('Setting user data:', data); // Debugging
      state.user.data = data;
    },
    SET_RANDOM_USER(state, data) {
      state.randomUser = data;
    }
  },
  actions: {
    async register(context, { email, password, name }) {
      try {
        const response = await createUserWithEmailAndPassword(auth, email, password);
        const usersCollectionRef = collection(firestore, "users");

        if (response) {
          await updateProfile(response.user, {
            displayName: name,
            photoURL: defaultProfile
          });
          const docData = {
            uid: response.user.uid,
            email: email,
            displayName: name,
            photoURL: defaultProfile,
            emailVerified: false,
            biography: "Description"
          };
          await addDoc(usersCollectionRef, docData);
          context.commit('SET_USER', {
            ...response.user,
            displayName: name,
            photoURL: defaultProfile
          });
        }
      } catch (error) {
        console.error(error);
        throw new Error('Registration data already exists!');
      }
    },
    async logIn(context, { email, password }) {
      try {
        const response = await signInWithEmailAndPassword(auth, email, password);
        if (response) {
          context.commit('SET_USER', {
            ...response.user,
            photoURL: response.user.photoURL || defaultProfile
          });
        }
      } catch (error) {
        console.error(error);
        throw new Error('Login credentials are incorrect');
      }
    },
    async logOut(context) {
      await signOut(auth);
      context.commit('SET_USER', null);
    },
    fetchUser(context, user) {
      context.commit("SET_LOGGED_IN", user !== null);
      if (user) {
        context.commit("SET_USER", {
          displayName: user.displayName,
          email: user.email,
          uid: user.uid,
          emailVerified: user.emailVerified,
          photoURL: user.photoURL || defaultProfile
        });
      } else {
        context.commit("SET_USER", null);
      }
    },
    async fetchRandomUser(context) {
      try {
        const usersCollectionRef = collection(firestore, 'users');
        const snapshot = await getDocs(usersCollectionRef);
        const users = [];
        snapshot.forEach(doc => {
          users.push(doc.data());
        });
        if (users.length > 0) {
          const randomUser = users[Math.floor(Math.random() * users.length)];
          context.commit('SET_RANDOM_USER', randomUser);
        }
      } catch (error) {
        console.error('Error fetching random user:', error);
      }
    }
  }
});

export default store;
