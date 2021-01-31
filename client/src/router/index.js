import Vue from 'vue';
import VueRouter from 'vue-router';

Vue.use(VueRouter);

const routes = [
  {
    path: '/quiz/:id',
    name: 'QuizInfo',
    component: () => import('../views/QuizInfoView.vue'),
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
    path: '/login',
    name: 'Login',
    component: () => import('../views/LoginView.vue'),
  },
  {
    path: '/home',
    name: 'User Home',
    component: () => import('../views/UserHomeView.vue'),
  },
  {
    path: '/',
    name: 'Root',
    redirect: '/home',
  },
];

const router = new VueRouter({
  mode: 'history',
  base: '',
  routes,
});

export default router;
