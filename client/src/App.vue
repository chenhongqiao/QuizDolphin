<template>
  <v-app>
    <v-app-bar
      app
      dense
    >
      <v-toolbar-title>Quiz System</v-toolbar-title>
      <v-spacer />
      <v-menu
        v-if="loggedIn"
        offset-y
      >
        <template #activator="{ on }">
          <v-btn
            icon
            v-on="on"
          >
            <v-avatar
              color="primary"
              size="36"
            >
              <v-icon dark>
                mdi-account-circle
              </v-icon>
            </v-avatar>
          </v-btn>
        </template>
        <v-card>
          <v-list-item-content class="justify-center">
            <v-btn
              rounded
              text
              depressed
              @click="logout()"
            >
              Logout
            </v-btn>
          </v-list-item-content>
        </v-card>
      </v-menu>
    </v-app-bar>
    <v-main>
      <v-alert
        v-model="hasError"
        dismissible
        type="error"
      >
        <div>{{ errorMessage }}</div>
        <div v-if="errorMessage.response">
          {{ errorMessage.response.data }}
        </div>
      </v-alert>
      <div v-if="!loggedIn">
        <LoginComponent
          :logged-in.sync="loggedIn"
          @authDone="getHistory()"
        />
      </div>
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
import LoginComponent from './components/LoginComponent.vue';
import ResultComponent from './components/ResultComponent.vue';
import QuestionService from './QuestionService';
import ResultService from './ResultService';
import QuizService from './QuizService';
import UserService from './UserService';

export default {
  name: 'App',

  components: {
    QuizComponent,
    ResultComponent,
    LoginComponent,
  },
  data: () => ({
    quizStarted: false,
    quizData: [],
    quizResult: {},
    quizAnswers: [],
    quizGraded: false,
    quizHistory: null,
    loggedIn: false,
    currentIndex: 1,
    progressVersion: 1,
    hasError: false,
    errorMessage: '',
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
    const userStatus = (await UserService.getUserStatus()).data;
    if (userStatus === 'Logged In!') {
      this.loggedIn = true;
      this.getHistory();
    }
  },
  errorCaptured(err) {
    this.errorMessage = err;
    this.hasError = true;
  },
  methods: {
    async startQuiz() {
      if (this.quizData === 'Not Logged In!') {
        this.loggedIn = false;
      } else {
        const previous = (await QuizService.getOngoing()).data;
        if (!previous.question) {
          this.quizData = (await QuestionService.getQuestions(5)).data;
          this.quizData.forEach((question, index) => {
            if (question.type === 'single choice' || question.type === 'short response') {
              this.quizAnswers[index] = '';
            } else if (question.type === 'multiple choice' || question.type === 'matching' || question.type === 'fill in the blanks') {
              this.quizAnswers[index] = [];
            }
          });
          this.postProgress();
        } else {
          this.quizData = previous.question;
          const rawResponse = (await QuizService.getProgress()).data;
          this.quizAnswers = rawResponse.attempt;
          if (!this.quizAnswers) {
            this.quizData.forEach((question, index) => {
              if (question.type === 'single choice' || question.type === 'short response') {
                this.quizAnswers[index] = '';
              } else if (question.type === 'multiple choice' || question.type === 'matching' || question.type === 'fill in the blanks') {
                this.quizAnswers[index] = [];
              }
            });
            this.postProgress();
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
      )).data;
      if (this.quizResult === 'Not Logged In!') {
        this.loggedIn = false;
      } else {
        this.quizGraded = true;
      }
    },
    async getHistory() {
      const rawResponse = (await QuizService.getQuizHistory()).data;
      if (rawResponse === 'Not Logged In!') {
        this.loggedIn = false;
      } else if (rawResponse !== 'No History!') {
        this.quizHistory = rawResponse.reverse();
      }
    },
    async logout() {
      const rawResponse = (await UserService.logout()).data;
      if (rawResponse === 'Success!' || rawResponse === 'Not Logged In!') {
        this.quizHistory = null;
        this.loggedIn = false;
      }
    },
    async postProgress() {
      const rawResponse = (await QuizService.postProgress(
        { version: this.progressVersion, index: this.currentIndex, attempt: this.quizAnswers },
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
