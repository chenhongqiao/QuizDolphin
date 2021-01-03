<template>
  <div>
    <div v-if="!quizStarted">
      <div v-if="quizHistory">
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
        :current-index.sync="currentIndex"
        @quizDone="gradeQuiz"
      />
    </div>
    <div v-if="quizGraded">
      <ResultComponent
        :quiz-result="quizResult"
        :view-only="false"
      />
    </div>
  </div>
</template>

<script>
import { DateTime } from 'luxon';
import QuizComponent from '../components/QuizComponent.vue';
import ResultComponent from '../components/ResultComponent.vue';
import QuestionService from '../QuestionService';
import ResultService from '../ResultService';
import QuizService from '../QuizService';

export default {
  name: 'QuizDashView',
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
    currentIndex: 1,
    progressVersion: 1,
    quizId: 1,
  }),
  watch: {
    quizAnswers: {
      handler() {
        this.progressVersion += 1;
        this.postProgress();
      },
    },
    currentIndex: {
      handler() {
        this.progressVersion += 1;
        this.postProgress();
      },
    },
  },
  async beforeMount() {
    console.log(this.$route.params.id);
    this.quizId = this.$route.params.id;
    this.getHistory();
  },
  methods: {
    async startQuiz() {
      if (this.quizData === 'Not Logged In!') {
        sessionStorage.loggedIn = false;
        this.$router.push('/login');
      } else {
        const previous = (await QuizService.getOngoing(this.quizId)).data;
        if (!previous.question) {
          this.quizData = (await QuestionService.getQuestions(5, this.quizId)).data;
          this.quizData.forEach((question, index) => {
            if (question.type === 'single choice' || question.type === 'short response') {
              this.quizAnswers[index] = '';
            } else if (question.type === 'multiple choice' || question.type === 'matching' || question.type === 'fill in the blanks') {
              this.quizAnswers[index] = [];
            }
          });
          this.postProgress(this.quizId);
        } else {
          this.quizData = previous.question;
          const rawResponse = (await QuizService.getProgress(this.quizId)).data;
          this.quizAnswers = rawResponse.attempt;
          if (!this.quizAnswers) {
            this.quizData.forEach((question, index) => {
              if (question.type === 'single choice' || question.type === 'short response') {
                this.quizAnswers[index] = '';
              } else if (question.type === 'multiple choice' || question.type === 'matching' || question.type === 'fill in the blanks') {
                this.quizAnswers[index] = [];
              }
            });
            this.postProgress(this.quizId);
          }
          this.currentIndex = rawResponse.index;
          this.progressVersion = rawResponse.version;
        }
        this.quizStarted = true;
      }
    },
    async gradeQuiz() {
      const processedAnswers = this.quizAnswers.map((value, index) => ({
        uuid: this.quizData[index].uuid,
        answer: value,
      }));
      this.quizResult = (await ResultService.gradeQuiz(
        processedAnswers,
        this.quizId,
      )).data;
      if (this.quizResult === 'Not Logged In!') {
        sessionStorage.loggedIn = false;
        this.$router.push('/login');
      } else {
        this.quizGraded = true;
      }
    },
    async getHistory() {
      const rawResponse = (await QuizService.getQuizHistory(this.quizId)).data;
      if (rawResponse === 'Not Logged In!') {
        sessionStorage.loggedIn = false;
        this.$router.push('/login');
      } else if (rawResponse !== 'No History!') {
        this.quizHistory = rawResponse.reverse();
      }
    },
    async postProgress() {
      const rawResponse = (await QuizService.postProgress(
        { version: this.progressVersion, index: this.currentIndex, attempt: this.quizAnswers },
        this.quizId,
      )).data;
      if (rawResponse !== 'Success!') {
        console.log('Version Too Old!');
      }
    },
    toLocalTime(record) {
      return DateTime.fromISO(record.timeStamp).setZone('America/Los_Angeles').toLocaleString(DateTime.DATETIME_MED);
    },
  },
};
</script>
