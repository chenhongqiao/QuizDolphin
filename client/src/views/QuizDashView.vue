<template>
  <div>
    <div v-if="!quizStarted">
      <v-container>
        <h3 class="text-center">
          New Attempt
        </h3>
      </v-container>
      <v-container
        class="text-center"
      >
        <v-btn
          :disabled="actionDisabled"
          @click="startNewQuiz"
        >
          start!
        </v-btn>
      </v-container>
      <v-container>
        <v-tabs>
          <v-tab> Records </v-tab>
          <v-tab> Graphs </v-tab>
          <v-tab-item>
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
          </v-tab-item>

          <v-tab-item>
            <v-container>
              <h3 class="text-center">
                Performance History
              </h3>
              <LineChartComponent
                :chart-data="historyChartData"
                :options="{maintainAspectRatio: false}"
                :style="'height=200px;'"
              />
            </v-container>
          </v-tab-item>
        </v-tabs>
      </v-container>
    </div>
    <div v-if="quizStarted && quizLoaded && !quizGraded">
      <QuizComponent
        :quiz-data="quizQuestions"
        :quiz-answers.sync="quizAnswers"
        :current-index.sync="currentIndex"
        @quizDone="submitQuiz()"
      />
      <v-container>
        <v-row>
          <v-spacer />
          <span>
            Time Left:
            {{ hoursLeft }} hours {{ minutesLeft }} minutes {{ secondsLeft }} seconds
          </span>
        </v-row>
      </v-container>
      <v-dialog
        v-model="needReload"
        max-width="500px"
        persistent
      >
        <v-card>
          <v-container>
            A newer version of your quiz progress detected on cloud.
            Please click this button to reload.
          </v-container>
          <v-divider />
          <v-card-actions>
            <v-spacer />
            <v-btn
              text
              @click="reloadPage()"
            >
              Reload
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
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
import QuizService from '../QuizService';
import LineChartComponent from '../components/LineChartComponent.vue';

export default {
  name: 'QuizDashView',
  components: {
    QuizComponent,
    ResultComponent,
    LineChartComponent,
  },
  data: () => ({
    quizStarted: true,
    quizQuestions: [],
    quizResult: {},
    quizAnswers: [],
    quizGraded: false,
    quizHistory: null,
    currentIndex: 1,
    progressVersion: 1,
    quizId: 1,
    quizLoaded: false,
    actionDisabled: false,
    historyChartData: {
      labels: [],
      datasets: [
        {
          label: 'Quiz Score (percentage)',
          backgroundColor: '#1565c0',
          data: [],
        },
      ],
    },
    pendingSave: false,
    quizOngoing: false,
    endTime: 0,
    timeLeft: 0,
    needReload: false,
  }),
  computed: {
    hoursLeft() {
      return Math.floor(this.timeLeft / 3600);
    },
    minutesLeft() {
      return Math.floor((this.timeLeft % 3600) / 60);
    },
    secondsLeft() {
      return this.timeLeft % 60;
    },
  },
  watch: {
    quizAnswers: {
      deep: true,
      handler() {
        if (!this.pendingSave) {
          this.pendingSave = true;
          setTimeout(() => {
            if (this.quizOngoing) {
              this.progressVersion += 1;
              this.pendingSave = false;
              this.postProgress();
            }
          }, 500);
        }
      },
    },
    currentIndex: {
      handler() {
        if (!this.pendingSave) {
          this.pendingSave = true;
          setTimeout(() => {
            if (this.quizOngoing) {
              this.progressVersion += 1;
              this.pendingSave = false;
              this.postProgress();
            }
          }, 500);
        }
      },
    },
    timeLeft: {
      handler() {
        if (this.quizOngoing && this.timeLeft <= 1) {
          this.submitQuiz();
        }
      },
    },
  },
  async beforeMount() {
    this.quizId = parseInt(this.$route.params.id, 10);
    const previous = (await QuizService.getOngoing(this.quizId)).data;
    if (previous.question) {
      this.quizQuestions = previous.question;
      this.endTime = previous.endTime;
      const rawResponse = (await QuizService.getProgress(this.quizId)).data;
      this.quizAnswers = rawResponse.attempt;
      if (!this.quizAnswers) {
        this.quizAnswers = [];
        this.quizQuestions.forEach((question, index) => {
          if (question.type === 'single choice' || question.type === 'short response') {
            this.quizAnswers[index] = '';
          } else if (question.type === 'multiple choice' || question.type === 'matching' || question.type === 'fill in the blanks') {
            this.quizAnswers[index] = [];
          }
        });
      }
      this.currentIndex = rawResponse.index;
      this.progressVersion = rawResponse.version;
      this.quizOngoing = true;
      this.quizLoaded = true;
      setInterval(() => { this.countDown(); }, 1000);
    } else {
      this.quizStarted = false;
      this.getHistory();
    }
  },
  methods: {
    async startNewQuiz() {
      this.actionDisabled = true;
      const quizData = (await QuizService.getQuizQuestions(this.quizId)).data;
      this.quizQuestions = quizData.question;
      this.endTime = quizData.endTime;
      this.quizQuestions.forEach((question, index) => {
        if (question.type === 'single choice' || question.type === 'short response') {
          this.quizAnswers[index] = '';
        } else if (question.type === 'multiple choice' || question.type === 'matching' || question.type === 'fill in the blanks') {
          this.quizAnswers[index] = [];
        }
      });
      this.quizOngoing = true;
      this.quizStarted = true;
      this.quizLoaded = true;
      setInterval(() => { this.countDown(); }, 1000);
    },
    async submitQuiz() {
      this.progressVersion += 1;
      await this.postProgress();
      if (!this.needReload) {
        this.quizOngoing = false;
        this.quizResult = (await QuizService.submitQuiz(
          this.quizId,
        )).data;
        if (this.quizResult === 'Not Logged In!') {
          this.$store.state.loggedIn = false;
          this.$router.push('/login');
        } else {
          this.quizGraded = true;
        }
      }
    },
    getOrdinal(number) {
      if (number % 10 === 1 && number % 100 !== 11) {
        return `${number}st`;
      }
      if (number % 10 === 2 && number % 100 !== 12) {
        return `${number}nd`;
      }
      if (number % 10 === 3 && number % 100 !== 13) {
        return `${number}rd`;
      }
      return `${number}th`;
    },
    async getHistory() {
      const rawResponse = (await QuizService.getQuizHistory(this.quizId)).data;
      if (rawResponse === 'Not Logged In!') {
        this.$store.state.loggedIn = false;
        this.$router.push('/login');
      } else if (rawResponse !== 'No History!') {
        rawResponse.forEach((value, index) => {
          this.historyChartData.labels.push(this.getOrdinal(index + 1));
          this.historyChartData.datasets[0].data.push((value.score / value.totalPoints) * 100);
        });
        this.quizHistory = rawResponse.reverse();
      }
    },
    async postProgress() {
      const rawResponse = (await QuizService.postProgress(
        { version: this.progressVersion, index: this.currentIndex, attempt: this.quizAnswers },
        this.quizId,
      )).data;
      if (rawResponse === 'Refuse to overwrite!') {
        this.needReload = true;
      }
    },
    toLocalTime(record) {
      return DateTime.fromISO(record.timeStamp).setZone('America/Los_Angeles').toLocaleString(DateTime.DATETIME_MED);
    },
    countDown() {
      this.timeLeft = this.endTime - Math.floor(Date.now() / 1000) - 2;
    },
    reloadPage() {
      window.location.reload();
    },
  },
};
</script>
