<template>
  <div>
    <div v-if="$store.state.user.role==='admin'">
      <AdminHomeView />
    </div>
    <div v-else-if="$store.state.user.role==='user'">
      <UserHomeView />
    </div>
  </div>
</template>

<script>
import AdminHomeView from './admin/AdminHomeView.vue';
import UserHomeView from './user/UserHomeView.vue';

export default {
  components: {
    AdminHomeView,
    UserHomeView,
  },
  mounted() {
    this.$store.commit('navigation/replace', {
      index: 0,
      info: {
        text: 'Home',
        disabled: false,
        to: '/home',
      },
    });
  },
};
</script>
