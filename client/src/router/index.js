import Vue from 'vue';
import VueRouter from 'vue-router';
import store from '../store/index';

Vue.use(VueRouter);

const routes = [
  {
    path: '/quiz/:id',
    name: 'QuizInfo',
    component: () => import('../views/QuizView.vue'),
    beforeEnter: (to, from, next) => {
      if (!store.getters['user/status']) {
        next({ path: '/login', query: { redirect: to.fullPath } });
      } else {
        next();
      }
    },
  },
  {
    path: '/attempt/:id',
    name: 'Attempt',
    component: () => import('../views/AttemptView.vue'),
    beforeEnter: (to, from, next) => {
      if (!store.getters['user/status']) {
        next({ path: '/login', query: { redirect: to.fullPath } });
      } else {
        next();
      }
    },
  },
  {
    path: '/result/:id',
    name: 'Result',
    component: () => import('../views/ResultView.vue'),
    beforeEnter: (to, from, next) => {
      if (!store.getters['user/status']) {
        next({ path: '/login', query: { redirect: to.fullPath } });
      } else {
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
    component: () => import('../views/HomeView.vue'),
    beforeEnter: (to, from, next) => {
      if (!store.getters['user/status']) {
        next({ path: '/login', query: { redirect: '/home' } });
      } else {
        store.commit('navigation/replace', {
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
    path: '/history',
    name: 'History',
    component: () => import('../views/HistoryView.vue'),
    beforeEnter: (to, from, next) => {
      if (!store.getters['user/status']) {
        next({ path: '/login', query: { redirect: '/history' } });
      } else {
        store.commit('navigation/replace', {
          index: 0,
          info: {
            text: 'History',
            disabled: false,
            to: '/history',
          },
        });
        next();
      }
    },
  },
  {
    path: '/user',
    name: 'UserList',
    component: () => import('../views/UserListView.vue'),
    beforeEnter: (to, from, next) => {
      if (!store.getters['user/status'] || store.state.user.role !== 'admin') {
        next({ path: '/login', query: { redirect: '/user' } });
      } else {
        store.commit('navigation/replace', {
          index: 0,
          info: {
            text: 'Users',
            disabled: false,
            to: '/user',
          },
        });
        next();
      }
    },
  },
  {
    path: '/',
    beforeEnter: (to, from, next) => {
      if (store.getters['user/status']) {
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
