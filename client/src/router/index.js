import Vue from 'vue';
import VueRouter from 'vue-router';

Vue.use(VueRouter);

const routes = [
  {
    path: '/quiz/:id',
    name: 'QuizInfo',
    component: () => import('../views/QuizView.vue'),
  },
  {
    path: '/attempt/:id',
    name: 'Attempt',
    component: () => import('../views/AttemptView.vue'),
  },
  {
    path: '/result/:id',
    name: 'Result',
    component: () => import('../views/ResultView.vue'),
  },
  {
    name: 'Login',
    path: '/login',
    component: () => import('../views/LoginView.vue'),
  },
  {
    path: '/home',
    name: 'Home',
    component: () => import('../views/HomeView.vue'),
  },
  {
    path: '/history',
    name: 'History',
    component: () => import('../views/HistoryView.vue'),
  },
  {
    path: '/user',
    name: 'UserList',
    component: () => import('../views/UserListView.vue'),
  },
  {
    path: '/',
    redirect: '/home',
  },
  {
    path: '*',
    component: () => import('../views/status/404NotFound.vue'),
  },
];

const router = new VueRouter({
  mode: 'history',
  base: '',
  routes,
});

export default router;
