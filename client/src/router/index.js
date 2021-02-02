import Vue from 'vue';
import VueRouter from 'vue-router';
import store from '../store';

Vue.use(VueRouter);

const routes = [
  {
    path: '/quiz/:id',
    name: 'QuizInfo',
    component: () => import('../views/QuizInfoView.vue'),
    beforeEnter: (to, from, next) => {
      if (!store.state.loggedIn) {
        next({ path: '/login', query: { redirect: to.fullPath } });
      } else {
        store.commit('replaceNav', {
          index: 1,
          info: {
            text: 'Quiz Info',
            disabled: false,
            to: to.fullPath,
          },
        });
        next();
      }
    },
  },
  {
    path: '/attempt/:id',
    name: 'Attempt',
    component: () => import('../views/AttemptView.vue'),
    beforeEnter: (to, from, next) => {
      if (!store.state.loggedIn) {
        next({ path: '/login', query: { redirect: to.fullPath } });
      } else {
        store.commit('replaceNav', {
          index: 2,
          info: {
            text: 'Attempt',
            disabled: false,
            to: to.fullPath,
          },
        });
        next();
      }
    },
  },
  {
    path: '/result/:id',
    name: 'Result',
    component: () => import('../views/ResultView.vue'),
    beforeEnter: (to, from, next) => {
      if (!store.state.loggedIn) {
        next({ path: '/login', query: { redirect: to.fullPath } });
      } else {
        store.commit('replaceNav', {
          index: 2,
          info: {
            text: 'Result',
            disabled: false,
            to: to.fullPath,
          },
        });
        next();
      }
    },
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/LoginView.vue'),
  },
  {
    path: '/home',
    name: 'User Home',
    component: () => import('../views/UserHomeView.vue'),
    beforeEnter: (to, from, next) => {
      if (!store.state.loggedIn) {
        next({ path: '/login', query: { redirect: '/home' } });
      } else {
        store.commit('replaceNav', {
          index: 0,
          info: {
            text: 'Home',
            disabled: false,
            to: '/home',
          },
        });
        next();
      }
    },
  },
  {
    path: '/',
    beforeEnter: (to, from, next) => {
      if (store.state.loggedIn) {
        next({ name: 'User Home' });
      } else {
        next({ path: '/login' });
      }
    },
  },
];

const router = new VueRouter({
  mode: 'history',
  base: '',
  routes,
});

export default router;
