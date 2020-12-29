<template>
  <v-app>
    <v-app-bar app>
      <v-toolbar-title>FBLA Quiz System</v-toolbar-title>
    </v-app-bar>
    <v-main>
      <div v-if="!quizStarted">
        <v-container class="text-center">
          Welcome to a five-question quiz
        </v-container>
        <v-container
          class="text-center"
        >
          <v-btn @click="startQuiz">
            start!
          </v-btn>
        </v-container>
      </div>
      <div v-if="quizStarted && !quizGraded">
        <QuizComponent
          :quiz-data="quizData"
          :quiz-answers.sync="quizAnswers"
          @quizDone="gradeQuiz"
        />
      </div>
      <div v-if="quizGraded">
        <ResultComponent
          :quiz-result="quizResult"
          :total-points="quizTotalPoints"
        />
      </div>
    </v-main>
  </v-app>
</template>

<script>
import QuizComponent from './components/QuizComponent.vue';
import ResultComponent from './components/ResultComponent.vue';
import QuestionService from './QuestionService';
import ResultService from './ResultService';

export default {
  name: 'App',

  components: {
    QuizComponent,
    ResultComponent,
  },
  data: () => ({
    quizStarted: false,
    quizData: [],
    quizResult: {},
    quizAnswers: [],
    quizGraded: false,
    quizTotalPoints: 0,
  }),
  methods: {
    async startQuiz() {
      this.quizData = (await QuestionService.getQuestions(4)).data;
      this.quizTotalPoints = this.quizData
        .reduce((accumulator, current) => accumulator + current.points, 0);
      this.quizStarted = true;
    },
    async gradeQuiz() {
      const processedAnswers = this.quizAnswers.map((value, index) => ({
        uuid: this.quizData[index].uuid,
        answer: value,
      }));
      this.quizResult = (await ResultService.gradeQuiz(
        processedAnswers,
      )).data;
      this.quizGraded = true;
    },
  },
};
</script>
