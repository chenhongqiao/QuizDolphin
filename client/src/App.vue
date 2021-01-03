<template>
  <v-app>
    <v-app-bar
      app
      dense
    >
      <v-toolbar-title
        style="cursor: pointer"
        @click="goDashboard()"
      >
        Quiz System
      </v-toolbar-title>
      <v-spacer />
      <v-menu
        v-if="getLoginStatus()"
        offset-y
        min-width="200px"
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
              <span class="white--text title">{{ getInitial() }}</span>
            </v-avatar>
          </v-btn>
        </template>
        <v-card>
          <v-list-item-content class="justify-center">
            <div class="mx-auto text-center">
              <h3>{{ getName() }}</h3>
              <div class="caption mt-1">
                {{ getEmail() }}
              </div>
              <v-divider class="my-3" />
              <v-btn
                rounded
                text
                depressed
                @click="logout()"
              >
                Logout
              </v-btn>
            </div>
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
    const userInformation = (await UserService.getUserInformation()).data;
    if (userInformation !== 'Not Logged In!') {
      this.$store.commit('login', userInformation);
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
        this.$store.commit('logout');
        if (this.$route.path !== '/login') {
          this.$router.push('/login');
        }
      }
    },
    refresh() {
      window.location.reload();
    },
    goDashboard() {
      if (this.$route.path !== '/') {
        this.$router.push('/');
      }
    },
    getLoginStatus() {
      return this.$store.state.loggedIn;
    },
    toQuizPage() {
      if (this.$route.path !== '/quiz') {
        this.$router.push('/quiz');
      }
    },
    getInitial() {
      const initial = this.$store.state.name.split(' ').map((name) => name[0]).join('');
      return initial;
    },
    getName() {
      return this.$store.state.name;
    },
    getEmail() {
      return this.$store.state.email;
    },
  },
};
</script>
