<template>
  <div>
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
              View Quiz
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
