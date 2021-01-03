<template>
  <div>
    <v-container>
      <h2>Welcome back, {{ getUserName }}</h2>
    </v-container>
    <v-container>
      <h3>Quiz List</h3>
    </v-container>
    <v-col>
      <v-container
        v-for="quiz in quizList"
        :key="'ql'+quiz"
      >
        <v-card>
          <v-card-title>
            {{ quiz.quizName }}
          </v-card-title>
          <v-card-actions>
            <v-spacer />
            <v-btn @click="toQuiz(quiz.quizId)">
              Access Quiz
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-container>
    </v-col>
  </div>
</template>

<script>
import QuizService from '../QuizService';

export default {
  name: 'UserDashView',
  data: () => ({
    quizList: [],
  }),
  computed: {
    getUserName() {
      return this.$store.state.name;
    },
  },
  async beforeMount() {
    this.quizList = (await QuizService.getQuizList()).data;
  },
  methods: {
    toQuiz(quizId) {
      this.$router.push(`/quiz/${quizId}`);
    },
  },
};
</script>
