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
      </v-list>
    </v-navigation-drawer>
    <v-app-bar
      app
      dense
    >
      <v-app-bar-nav-icon @click="drawer = !drawer" />

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
              :color="$store.state.role==='admin'?'blue-grey':'blue'"
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
    drawer: false,
  }),
  computed: {
    getInitial() {
      const initial = this.$store.state.name.split(' ').map((name) => name[0]).join('');
      return initial;
    },
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
