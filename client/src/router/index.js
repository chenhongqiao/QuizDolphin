import Vue from 'vue';
import VueRouter from 'vue-router';

Vue.use(VueRouter);

const routes = [
  {
    path: '/quiz/:id',
    name: 'Quiz',
    component: () => import('../views/QuizDashView.vue'),
    children: [
      {
        path: '',
        component: () => import('../components/QuizInfoComponent.vue'),
      },
      {
        path: 'question',
        component: () => import('../components/QuizComponent.vue'),
      },
    ],
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/LoginView.vue'),
  },
  {
    path: '/dashboard',
    name: 'User Dashboard',
    component: () => import('../views/UserDashView.vue'),
  },
];

const router = new VueRouter({
  mode: 'history',
  base: '',
  routes,
});

export default router;
