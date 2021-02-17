<template>
  <div>
    <div v-if="loaded">
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
  </div>
</template>

<script>
import QuizService from '../../services/QuizService';

export default {
  name: 'UserHomeView',
  data: () => ({
    quizList: [],
    loaded: false,
    newQuiz: false,
    pendingDelete: false,
    deleteIndex: null,
  }),
  async mounted() {
    try {
      await this.loadQuizList();
      this.loaded = true;
    } catch (err) {
      if (err.response) {
        if (err.response.status === 401) {
          this.$store.commit('user/logout');
          this.$router.push({ name: 'Login' });
        } else {
          throw err;
        }
      } else {
        throw err;
      }
    }
  },
  methods: {
    toQuiz(quizId) {
      this.$router.push(`/quiz/${quizId}`);
    },
    async loadQuizList() {
      this.quizList = await QuizService.getQuizList();
    },
  },
};
</script>
