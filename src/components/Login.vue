<template>
  <div class="container">
    <div class="row justify-content-center">
      <div class="col-md-8">
        <div class="card">
          <div class="card-header">Login</div>
          <div class="card-body">
            <!-- Display error message if any -->
            <div v-if="error" class="alert alert-danger">{{ error }}</div>
            <form @submit.prevent="Login">
              <!-- Email input field -->
              <div class="form-group row">
                <label for="email" class="col-md-4 col-form-label text-md-right">Email</label>
                <div class="col-md-6">
                  <input
                    id="email"
                    type="email"
                    class="form-control"
                    required
                    autofocus
                    v-model="email"
                  />
                </div>
              </div>

              <!-- Password input field -->
              <div class="form-group row">
                <label for="password" class="col-md-4 col-form-label text-md-right">Password</label>
                <div class="col-md-6">
                  <input
                    id="password"
                    type="password"
                    class="form-control"
                    required
                    v-model="password"
                  />
                </div>
              </div>

              <!-- Login button -->
              <div class="form-group row mb-0">
                <div class="col-md-8 offset-md-4">
                  <button type="submit" class="btn btn-primary">Login</button>
                </div>
              </div>
            </form>
            <!-- Link to register page -->
            <router-link to="/register">Register</router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'

export default {
  name: "LoginComponent",
  setup() {
    // Define reactive state variables
    const email = ref('')
    const password = ref('')
    const error = ref(null)

    const store = useStore()
    const router = useRouter()

    // Login function to handle user login
    const Login = async () => {
      try {
        await store.dispatch('logIn', {
          email: email.value,
          password: password.value
        })
        router.push('/dashboard')
      } catch (err) {
        error.value = err.message
      }
    }

    return { Login, email, password, error }
  }
}
</script>

<style scoped>
/* Custom styles for LoginComponent */

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

.card-header {
  font-size: 1.5rem;
  font-weight: bold;
}

.card-body {
  color: #333333; /* Dark text color */
}

.form-group {
  margin-bottom: 15px; /* Space between form groups */
}

.btn-primary {
  background-color: #007bff; /* Bootstrap primary button color */
  border-color: #007bff;
}

.alert-danger {
  background-color: #ffcccc; /* Light red background */
  color: #cc0000; /* Red text color */
  border: 1px solid #cc0000; /* Red border */
}

.router-link {
  display: block;
  margin-top: 15px;
  text-align: center;
}
</style>
