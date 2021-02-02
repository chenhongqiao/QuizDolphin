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
      <v-breadcrumbs
        :items="$store.state.navigation"
        divider="-"
      />
      <v-spacer />
      <v-menu
        v-if="$store.state.loggedIn"
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
              <span class="white--text title">{{ getInitial }}</span>
            </v-avatar>
          </v-btn>
        </template>
        <v-card>
          <v-list-item-content class="justify-center">
            <div class="mx-auto text-center">
              <h3>{{ $store.state.name }}</h3>
              <div class="caption mt-1">
                {{ $store.state.email }}
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
        outlined
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
import UserService from './services/UserService';

export default {
  name: 'App',

  data: () => ({
    hasError: false,
    errorMessage: '',
  }),
  computed: {
    getInitial() {
      const initial = this.$store.state.name.split(' ').map((name) => name[0]).join('');
      return initial;
    },
  },
  errorCaptured(err) {
    if (err.response) {
      this.errorMessage = `${err.response.status} Error: ${err.response.data.message}`;
    } else {
      this.errorMessage = err;
    }
    this.hasError = true;
  },
  methods: {
    async logout() {
      try {
        await UserService.deleteSession();
        this.$store.commit('logout');
        if (this.$route.path !== '/login') {
          this.$router.push({ name: 'Login' });
        }
      } catch (err) {
        if (this.$route.path !== '/login') {
          this.$router.push({ name: 'Login' });
        }
      }
    },
    goDashboard() {
      if (this.$route.path !== '/home') {
        this.$router.push('/home');
      }
    },
  },
};
</script>
