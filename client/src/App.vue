<template>
  <v-app>
    <v-app-bar app>
      <v-toolbar-title>FBLA Quiz System</v-toolbar-title>
    </v-app-bar>
    <v-main>
      <v-container v-if="!quizStarted">
        <v-row>
          <v-col>
            <v-card-actions class="justify-center">
              <v-btn @click="startQuiz">
                Start Quiz!
              </v-btn>
            </v-card-actions>
          </v-col>
        </v-row>
      </v-container>
      <v-container v-if="quizStarted && !quizGraded">
        <QuizComponent
          :quiz-data="quizData"
          :quiz-answers.sync="quizAnswers"
          @quizDone="gradeQuiz"
        />
      </v-container>
      <v-container v-if="quizGraded">
        <v-row>
          <v-col>
            <h3 class="text-center">
              You got {{ quizScore }} out of {{ quizTotalPoints }}
            </h3>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import QuizComponent from './components/QuizComponent.vue';
import QuestionService from './QuestionService';

export default {
  name: 'App',

  components: {
    QuizComponent,
  },
  data: () => ({
    quizStarted: false,
    quizData: [],
    quizScore: 0,
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
      const rawResponse = await QuestionService.gradeQuestions(
        processedAnswers,
      );
      this.quizScore = rawResponse.data.score;
      this.quizGraded = true;
    },
  },
};
</script>
