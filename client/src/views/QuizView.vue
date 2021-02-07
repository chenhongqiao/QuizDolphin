<template>
  <div>
    <div v-if="$store.state.role==='admin'">
      <v-alert
        v-if="view==='admin'"
        type="info"
      >
        <v-row>
          <v-col class="grow">
            You are viewing as admin, you can preview from user perspective by clicking this button.
          </v-col>
          <v-col class="shrink">
            <v-btn @click="view='user'">
              Preview
            </v-btn>
          </v-col>
        </v-row>
      </v-alert>
      <v-alert
        v-else-if="view==='user'"
        type="info"
      >
        <v-row>
          <v-col class="grow">
            You are previewing as user, you can switch to admin view by clicking this button.
          </v-col>
          <v-col class="shrink">
            <v-btn @click="view='admin'">
              Admin View
            </v-btn>
          </v-col>
        </v-row>
      </v-alert>
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
import UserQuizComponent from '../components/UserQuizComponent.vue';
import AdminQuizComponent from '../components/AdminQuizComponent.vue';

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
