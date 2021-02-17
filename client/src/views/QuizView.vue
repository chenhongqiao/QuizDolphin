<template>
  <div v-if="loaded">
    <div v-if="$store.state.user.role==='admin'">
      <v-banner
        v-if="$store.state.quizView.role==='admin'"
      >
        <v-icon> mdi-shield-account </v-icon>
        You are viewing as admin, you can preview from user perspective by clicking this button.
        <template #actions>
          <v-btn
            text
            @click="$store.commit('quizView/changeRole',{id:quizId, role:'user'});"
          >
            Preview
          </v-btn>
        </template>
      </v-banner>
      <v-banner
        v-else-if="$store.state.quizView.role==='user'"
      >
        <v-icon> mdi-account </v-icon>
        You are previewing as user, you can switch to admin view by clicking this button.
        <template #actions>
          <v-btn
            text
            @click="$store.commit('quizView/changeRole',{id:quizId, role:'admin'});"
          >
            Admin View
          </v-btn>
        </template>
      </v-banner>
    </div>
    <div v-if="$store.state.quizView.role==='admin'">
      <ManageQuizView :quiz-id="quizId" />
    </div>
    <div v-else-if="$store.state.quizView.role==='user'">
      <ViewQuizView :quiz-id="quizId" />
    </div>
  </div>
</template>

<script>
import ManageQuizView from './admin/ManageQuizView.vue';
import ViewQuizView from './user/ViewQuizView.vue';

export default {
  name: 'QuizView',
  components: {
    ManageQuizView,
    ViewQuizView,
  },
  data: () => ({
    quizId: '',
    loaded: false,
  }),
  mounted() {
    this.quizId = this.$route.params.id;
    if (this.$store.state.quizView.id !== this.quizId) {
      this.$store.commit('quizView/clearState');
    }
    if (!this.$store.state.quizView.role) {
      this.$store.commit('quizView/changeRole', { id: this.quizId, role: this.$store.state.user.role });
    }
    this.loaded = true;
  },
};
</script>
