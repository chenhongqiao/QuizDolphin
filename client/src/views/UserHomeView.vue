<template>
  <div v-if="dashLoaded">
    <v-container>
      <div
        v-for="quiz in quizList"
        :key="'ql'+quiz.quizId"
        class="my-2"
      >
        <v-card>
          <v-card-title>
            {{ quiz.quizName }}
          </v-card-title>
          <v-card-text>
            <div>
              {{ Math.floor(quiz.duration/60) }} minutes
              {{ Math.floor(quiz.duration%60) }} seconds
            </div>
            <div>{{ quiz.questionCount }} questions </div>
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn
              text
              @click="toQuiz(quiz.quizId)"
            >
              Access Quiz
            </v-btn>
          </v-card-actions>
        </v-card>
      </div>
    </v-container>
  </div>
  <v-progress-linear
    v-else
    indeterminate
  />
</template>

<script>
import QuizService from '../services/QuizService';

export default {
  name: 'UserDashView',
  data: () => ({
    quizList: [],
    dashLoaded: false,
  }),
  computed: {
    getUserName() {
      return this.$store.state.name;
    },
  },
  async mounted() {
    try {
      this.quizList = (await QuizService.getQuizList());
      this.dashLoaded = true;
    } catch (err) {
      if (err.response.status === 401) {
        this.$store.commit('logout');
        this.$router.push({ name: 'Login' });
      } else {
        throw err;
      }
    }
  },
  methods: {
    toQuiz(quizId) {
      this.$router.push(`/quiz/${quizId}`);
    },
  },
};
</script>
