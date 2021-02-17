/* eslint-disable no-param-reassign */
import Vue from 'vue';
import Vuex from 'vuex';
import user from './modules/user';
import navigation from './modules/navigation';
import quizView from './modules/quizView';

Vue.use(Vuex);

const store = new Vuex.Store({
  modules: {
    navigation,
    user,
    quizView,
  },
});

export default store;
