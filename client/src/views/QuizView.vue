<template>
  <div v-if="loaded">
    <div v-if="$store.state.user.role==='admin'">
      <v-banner
        v-if="$store.state.quizView.role==='admin'"
      >
        <v-icon> mdi-shield-account </v-icon>
        Managing quiz as admin, click this button to toggle preview.
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
        Previewing, click this button to go back to admin dashboard.
        <template #actions>
          <v-btn
            text
            @click="$store.commit('quizView/changeRole',{id:quizId, role:'admin'});"
          >
            Dashboard
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
    // If view record is from another quiz, clear it
    if (this.$store.state.quizView.id !== this.quizId) {
      this.$store.commit('quizView/clearState');
    }
    // If no view record, set it to user's role
    if (this.$store.state.user.role === 'user' || !this.$store.state.quizView.role) {
      this.$store.commit('quizView/changeRole', { id: this.quizId, role: this.$store.state.user.role });
    }
    this.loaded = true;
  },
};
</script>
