<template>
  <v-app>
    <v-navigation-drawer
      v-model="drawer"
      app
    >
      <v-list
        dense
        nav
      >
        <v-list-item to="/home">
          <v-list-item-icon>
            <v-icon> mdi-home </v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title> Home </v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item to="/history">
          <v-list-item-icon>
            <v-icon> mdi-history </v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title> History </v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item to="/progress">
          <v-list-item-icon>
            <v-icon> mdi-progress-check </v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title> Progress </v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item to="/help">
          <v-list-item-icon>
            <v-icon> mdi-frequently-asked-questions </v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title> Q&A </v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item
          v-if="$store.state.user.role==='admin'"
          to="/user"
        >
          <v-list-item-icon>
            <v-icon> mdi-account-multiple </v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title> Users </v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
    <v-app-bar
      app
      dense
    >
      <v-app-bar-nav-icon @click="drawer = !drawer" />

      <v-toolbar-title
        style="cursor: pointer"
        @click="goHome()"
      >
        Quiz Dolphin
      </v-toolbar-title>
      <v-breadcrumbs
        class="d-none d-sm-flex"
        :items="$store.state.navigation.navigation"
        divider="-"
      />
      <v-spacer />
      <v-menu
        v-if="$store.getters['user/status']"
        offset-y
        min-width="200px"
      >
        <template #activator="{ on }">
          <v-btn
            icon
            v-on="on"
          >
            <v-avatar
              :color="$store.state.user.role==='admin'?'blue-grey':'blue'"
              size="36"
            >
              <span class="white--text title">{{ getInitial }}</span>
            </v-avatar>
          </v-btn>
        </template>
        <v-card>
          <v-list-item-content class="justify-center">
            <div class="mx-auto text-center">
              <div class="text-h6">
                {{ $store.state.user.name }}
              </div>
              <div class="caption mt-2">
                {{ $store.state.user.email }}
              </div>
              <div
                v-if="$store.state.user.role==='admin'"
                class="caption mt-1"
              >
                {{ $store.state.user.role }}
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
      <router-view />
    </v-main>
    <v-footer>
      <v-col
        class="text-center"
        cols="12"
      >
        {{ new Date().getFullYear() }} — <strong>Quiz Dolphin</strong>
      </v-col>
      <v-col
        class="text-center text--secondary"
        cols="12"
      >
        Made by Hongqiao Chen as a FBLA 2021 Project
      </v-col>
    </v-footer>
  </v-app>
</template>

<script>
import UserService from './services/UserService';

export default {
  name: 'App',
  data: () => ({
    drawer: false,
  }),
  computed: {
    getInitial() {
      // Get user initial from name
      const initial = this.$store.state.user.name.split(' ').map((name) => name[0]).join('');
      return initial;
    },
  },
  async mounted() {
    // Check login on reach site
    const userInformation = (await UserService.getSessionInfo());
    if (userInformation) {
      this.$store.commit('user/login', userInformation);
    } else {
      this.$router.replace({ name: 'Login' });
    }
  },
  methods: {
    async logout() {
      // Clear up on logout
      this.$store.commit('user/logout');
      this.$store.commit('quizView/clearState');
      await UserService.deleteSession();
      this.$router.push({ name: 'Login' });
    },
    goHome() {
      if (this.$route.fullPath !== '/home') {
        this.$router.push('/home');
      }
    },
  },
};
</script>
