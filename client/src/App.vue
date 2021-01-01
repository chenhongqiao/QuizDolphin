<template>
  <v-app>
    <v-app-bar app>
      <v-toolbar-title>Quiz System</v-toolbar-title>
    </v-app-bar>
    <v-main>
      <div v-if="!quizStarted">
        <div v-if="quizHistory!==null">
          <v-container>
            <h3 class="text-center">
              Previous Attempts
            </h3>
          </v-container>
          <v-container>
            <v-expansion-panels>
              <v-expansion-panel
                v-for="(record, index) in quizHistory"
                :key="'r'+index+record"
              >
                <v-expansion-panel-header>
                  <div>
                    <b>{{ toLocalTime(record) }} </b>
                    {{ record.score.toFixed(2) }} out of {{ record.totalPoints }}
                  </div>
                </v-expansion-panel-header>
                <v-expansion-panel-content>
                  <ResultComponent
                    :quiz-result="record"
                    :view-only="true"
                  />
                </v-expansion-panel-content>
              </v-expansion-panel>
            </v-expansion-panels>
          </v-container>
        </div>
        <v-container>
          <h3 class="text-center">
            New Attempt
          </h3>
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
          :view-only="false"
        />
      </div>
    </v-main>
    <v-footer>
      <v-col
        class="text-center"
        cols="12"
      >
        {{ new Date().getFullYear() }} — <strong>Quiz System</strong>
      </v-col>
    </v-footer>
  </v-app>
</template>

<script>
import { DateTime } from 'luxon';
import QuizComponent from './components/QuizComponent.vue';
import ResultComponent from './components/ResultComponent.vue';
import QuestionService from './QuestionService';
import ResultService from './ResultService';
import QuizService from './QuizService';

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
    quizHistory: null,
  }),
  async beforeMount() {
    const rawResponse = (await QuizService.getQuizHistory()).data;
    if (rawResponse !== 'No History!') {
      this.quizHistory = rawResponse.reverse();
      console.log(this.quizHistory);
      console.log(this.quizHistory[0].timeStamp.toString());
    }
  },
  methods: {
    async startQuiz() {
      this.quizData = (await QuestionService.getQuestions(5)).data;
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
    toLocalTime(record) {
      return DateTime.fromISO(record.timeStamp).setZone('America/Los_Angeles').toLocaleString(DateTime.DATETIME_MED);
    },
  },
};
</script>
