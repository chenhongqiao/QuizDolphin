<template>
  <div>
    <div v-if="$store.state.user.role==='admin'">
      <AdminHomeView />
    </div>
    <div v-else>
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
};
</script>
