import Vue from 'vue';
import VueRouter from 'vue-router';

Vue.use(VueRouter);

const routes = [
  {
    path: '/quiz',
    name: 'Quiz',
    component: () => import('../views/QuizDashComponent.vue'),
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/LoginComponent.vue'),
  },
];

const router = new VueRouter({
  mode: 'history',
  base: '',
  routes,
});

export default router;
