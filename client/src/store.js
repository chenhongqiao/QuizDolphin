/* eslint-disable no-param-reassign */
import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

const store = new Vuex.Store({
  state: {
    loggedIn: false,
    email: '',
    name: '',
    role: '',
    navigation: [],
    expandedResult: [],
  },

  mutations: {
  // eslint-disable-next-line no-shadow
    login(state, info) {
      state.loggedIn = true;
      state.email = info.email;
      state.name = info.name;
      state.role = info.role;
    },

    // eslint-disable-next-line no-shadow
    logout(state) {
      state.loggedIn = false;
      state.email = '';
      state.name = '';
      state.role = '';
    },

    replaceNav(state, nav) {
      while (state.navigation.length > nav.index) {
        state.navigation.pop();
      }
      state.navigation.push(nav.info);
    },
  },
});

export default store;
