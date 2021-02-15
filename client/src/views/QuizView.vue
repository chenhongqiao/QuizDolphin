<template>
  <div>
    <div v-if="$store.state.role==='admin'">
      <v-banner
        v-if="view==='manage'"
      >
        <v-icon> mdi-shield-account </v-icon>
        You are viewing as admin, you can preview from user perspective by clicking this button.
        <template #actions>
          <v-btn
            text
            @click="view='view';$router.replace(`/quiz/${quizId}/view`)"
          >
            Preview
          </v-btn>
        </template>
      </v-banner>
      <v-banner
        v-else-if="view==='view'"
      >
        <v-icon> mdi-account </v-icon>
        You are previewing as user, you can switch to admin view by clicking this button.
        <template #actions>
          <v-btn
            text
            @click="view='manage';$router.replace(`/quiz/${quizId}/manage`);"
          >
            Admin View
          </v-btn>
        </template>
      </v-banner>
    </div>
    <router-view />
  </div>
</template>

<script>

export default {
  name: 'QuizView',
  data: () => ({
    quizId: '',
    view: '',
  }),
  mounted() {
    this.quizId = this.$route.params.id;
    if (this.$route.path.startsWith(`/quiz/${this.quizId}/manage`)) {
      this.view = 'manage';
    } else if (this.$route.path.startsWith(`/quiz/${this.quizId}/view`)) {
      this.view = 'view';
    } else if (this.$route.path.startsWith(`/quiz/${this.quizId}`)) {
      if (this.$store.state.role === 'admin') {
        this.$router.replace(`/quiz/${this.quizId}/manage`);
        this.view = 'manage';
      } else {
        this.$router.replace(`/quiz/${this.quizId}/view`);
        this.view = 'view';
      }
    }
  },
  methods: {
  },
};
</script>
