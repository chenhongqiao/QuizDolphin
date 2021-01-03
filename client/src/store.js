/* eslint-disable no-param-reassign */
import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

const store = new Vuex.Store({
  state: {
    loggedIn: false,
    email: '',
    name: '',
    type: '',
  },

  mutations: {
  // eslint-disable-next-line no-shadow
    login(state, info) {
      state.loggedIn = true;
      state.email = info.email;
      state.name = info.name;
      state.type = info.type;
    },

    // eslint-disable-next-line no-shadow
    logout(state) {
      state.loggedIn = false;
      state.email = '';
      state.name = '';
      state.type = '';
    },

  },
});

export default store;
