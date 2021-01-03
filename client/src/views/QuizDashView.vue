<template>
  <div>
    <router-view />
  </div>
</template>

<script>

export default {
  name: 'QuizDashView',
  beforeMount() {
    this.quizId = this.$route.params.id;
  },
};
</script>
