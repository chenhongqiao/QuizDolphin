<template>
  <v-app>
    <v-app-bar
      app
      dense
    >
      <v-toolbar-title>Quiz System</v-toolbar-title>
      <v-container>
        <v-btn
          text
          @click="toQuizPage()"
        >
          Quiz
        </v-btn>
      </v-container>
      <v-spacer />
      <v-menu
        v-if="getLoginStatus()"
        offset-y
      >
        <template #activator="{ on }">
          <v-btn
            icon
            v-on="on"
          >
            <v-avatar
              color="primary"
              size="36"
            >
              <v-icon dark>
                mdi-account-circle
              </v-icon>
            </v-avatar>
          </v-btn>
        </template>
        <v-card>
          <v-list-item-content class="justify-center">
            <v-btn
              rounded
              text
              depressed
              @click="logout()"
            >
              Logout
            </v-btn>
          </v-list-item-content>
        </v-card>
      </v-menu>
    </v-app-bar>
    <v-main>
      <v-alert
        v-model="hasError"
        dismissible
        type="error"
      >
        <div>{{ errorMessage }}</div>
        <div v-if="errorMessage.response">
          {{ errorMessage.response.data }}
        </div>
      </v-alert>
      <router-view />
    </v-main>
    <v-footer>
      <v-col
        class="text-center"
        cols="12"
      >
        {{ new Date().getFullYear() }} — <strong>Quiz System</strong>
      </v-col>
    </v-footer>
  </v-app>
</template>

<script>
import UserService from './UserService';

export default {
  name: 'App',

  data: () => ({
    hasError: false,
    errorMessage: '',
  }),
  async beforeMount() {
    const userStatus = (await UserService.getUserStatus()).data;
    if (userStatus === 'Logged In!') {
      sessionStorage.loggedIn = true;
    } else if (this.$route.path !== '/login') {
      this.$router.push('/login');
    }
  },
  errorCaptured(err) {
    this.errorMessage = err;
    this.hasError = true;
  },
  methods: {
    async logout() {
      const rawResponse = (await UserService.logout()).data;
      if (rawResponse === 'Success!' || rawResponse === 'Not Logged In!') {
        this.quizHistory = null;
        sessionStorage.loggedIn = false;
        if (this.$route.path !== '/login') {
          this.$router.push('/login');
        }
      }
    },
    refresh() {
      window.location.reload();
    },
    getLoginStatus() {
      return sessionStorage.loggedIn;
    },
    toQuizPage() {
      if (this.$route.path !== '/quiz') {
        this.$router.push('/quiz');
      }
    },
  },
};
</script>
