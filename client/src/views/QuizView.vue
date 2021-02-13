<template>
  <div>
    <div v-if="$store.state.role==='admin'">
      <v-banner
        v-if="view==='admin'"
      >
        You are viewing as admin, you can preview from user perspective by clicking this button.
        <template #actions>
          <v-btn
            text
            @click="view='user'"
          >
            Preview
          </v-btn>
        </template>
      </v-banner>
      <v-banner
        v-else-if="view==='user'"
      >
        You are previewing as user, you can switch to admin view by clicking this button.
        <template #actions>
          <v-btn
            text
            @click="view='admin'"
          >
            Admin View
          </v-btn>
        </template>
      </v-banner>
    </div>
    <UserQuizComponent
      v-if="view==='user'"
      :quiz-id="quizId"
    />
    <AdminQuizComponent
      v-if="view==='admin'"
      :quiz-id="quizId"
    />
  </div>
</template>

<script>
import UserQuizComponent from '../components/user/UserQuizComponent.vue';
import AdminQuizComponent from '../components/admin/AdminQuizComponent.vue';

export default {
  name: 'QuizView',
  components: {
    UserQuizComponent,
    AdminQuizComponent,
  },
  data: () => ({
    quizId: '',
    view: '',
  }),
  mounted() {
    this.quizId = this.$route.params.id;
    this.view = this.$store.state.role;
  },
  methods: {
  },
};
</script>
