<template>
  <div>
    <div v-if="infoLoaded&&!notFound">
      <v-container>
        <v-row wrap>
          <v-col>
            <div
              class="text-h4"
              :style="'white-space: nowrap;'"
            >
              {{ quizName }}
            </div>
            <div class="text--secondary">
              {{ questionCount }} questions
            </div>
            <div class="text--secondary">
              {{ Math.floor(duration/60) }} minutes
              {{ Math.floor(duration%60) }} seconds
            </div>
            <div class="text--secondary">
              {{ maxAttempts }} attempts allowed
            </div>
          </v-col>
        </v-row>
      </v-container>
      <v-container>
        <div v-if="attemptId">
          <div class="text-h6 text-center ma-2">
            Ongoing Attempt
          </div>
          <div
            class="text-center ma-2"
          >
            <v-btn
              :disabled="actionDisabled"
              @click="continueAttempt()"
            >
              Continue
            </v-btn>
          </div>
        </div>
        <div v-else>
          <div class="text-h6 text-center ma-2">
            New Attempt
          </div>
          <div
            v-if="(quizStatus&&quizHistory.length<maxAttempts)||$store.state.user.role==='admin'"
            class="text-center ma-2"
          >
            <v-btn
              :disabled="actionDisabled"
              @click="startNewQuiz()"
            >
              Start
            </v-btn>
          </div>
          <div
            v-if="!quizStatus&&$store.state.user.role!=='admin'"
            class="text-center"
          >
            This quiz is currently not accepting submissions.
          </div>
          <div
            v-if="!quizStatus&&$store.state.user.role==='admin'"
            class="text-center"
          >
            This quiz is not accepting submissions, but you can preview it as an admin.
          </div>
          <div
            v-if="quizHistory.length>=maxAttempts&&$store.state.user.role!=='admin'"
            class="text-center"
          >
            Attempts limit reached, no more new attempts allowed.
          </div>
          <div
            v-if="quizHistory.length>=maxAttempts&&$store.state.user.role==='admin'"
            class="text-center"
          >
            There's an attempts limit of {{ maxAttempts }},
            but you can preview this quiz unlimited times as an admin.
          </div>
        </div>
      </v-container>
      <v-container>
        <v-tabs v-model="$store.state.quizView.userTab">
          <v-tab> Records </v-tab>
          <v-tab> Statistics </v-tab>
          <v-tab-item>
            <div v-if="quizHistory">
              <div class="text-h6 text-center ma-2">
                Previous Attempts
              </div>
              <v-simple-table>
                <thead>
                  <tr>
                    <th class="text-left">
                      Time Stamp
                    </th>
                    <th class="text-left">
                      Score
                    </th>
                    <th class="text-right">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="(record, index) in quizHistory"
                    :key="'r'+index+record"
                  >
                    <td>{{ toLocalTime(record) }} </td>
                    <td class="text-left">
                      {{ record.score.toFixed(2) }}/{{ record.totalPoints.toFixed(2) }}
                    </td>
                    <td class="text-right">
                      <router-link :to="{ name: 'Result', params: { id: record.attemptId } }">
                        View
                      </router-link>
                    </td>
                  </tr>
                </tbody>
              </v-simple-table>
            </div>
          </v-tab-item>
          <v-tab-item>
            <div class="text-h6 text-center ma-2">
              Performance History
            </div>
            <LineChartComponent
              :chart-data="lineChartData"
              :options="{maintainAspectRatio: false}"
              :style="'height=200px;'"
            />
          </v-tab-item>
        </v-tabs>
      </v-container>
    </div>
    <v-progress-linear
      v-else-if="!notFound"
      indeterminate
    />
    <v-alert
      v-if="notFound"
      type="error"
    >
      <v-row align="center">
        <v-col class="grow">
          Can not find this quiz in the database,
          this might because of either incorrect url or the quiz has been deleted.
        </v-col>
        <v-col class="shrink">
          <v-btn @click="$router.push('/home')">
            Homepage
          </v-btn>
        </v-col>
      </v-row>
    </v-alert>
    <v-snackbar
      v-model="actionFailed"
    >
      {{ actionMessage }}
    </v-snackbar>
  </div>
</template>

<script>
import QuizService from '../../services/QuizService';
import LineChartComponent from '../../components/LineChartComponent.vue';

export default {
  name: 'UserQuizComponent',
  components: {
    LineChartComponent,
  },
  props: {
    quizId: { type: String, default: null },
  },
  data: () => ({
    quizHistory: [],
    duration: 0,
    lineChartData: {
      labels: [],
      datasets: [
        {
          label: 'Quiz Score (percentage)',
          backgroundColor: '#1565c0',
          data: [],
        },
      ],
    },
    actionDisabled: false,
    attemptId: '',
    infoLoaded: false,
    quizName: '',
    notFound: false,
    questionCount: 0,
    quizStatus: false,
    maxAttempts: 0,
    actionFailed: false,
    actionMessage: '',
  }),
  async mounted() {
    try {
      // Check if user has ongoing attempt, get id if has
      const ongoing = await QuizService.getOngoingAttempt(this.quizId);
      if (ongoing.length) {
        this.attemptId = ongoing[0].attemptId;
      }
      // Load quiz info
      const quizInfo = await QuizService.getQuizInfo(this.quizId);
      this.quizName = quizInfo.quizName;
      this.questionCount = quizInfo.questionCount;
      this.duration = quizInfo.duration;
      this.quizStatus = quizInfo.enable;
      this.maxAttempts = quizInfo.maxAttempts;
      // Load history and construct data for line chart
      const history = await QuizService.getAttemptHistory(this.quizId);
      history.forEach((value, index) => {
        this.lineChartData.labels.push(this.getOrdinal(index + 1));
        this.lineChartData.datasets[0].data.push((value.score / value.totalPoints) * 100);
      });
      // Display from new to old
      this.quizHistory = history.reverse();
      if (!this.$store.state.navigation.navigation[0]) {
        this.$store.commit('navigation/replace', {
          index: 0,
          info: {
            text: 'Home',
            disabled: false,
            to: '/home',
          },
        });
      }
      this.$store.commit('navigation/replace', {
        index: 1,
        info: {
          text: this.quizName,
          disabled: false,
          to: `/quiz/${this.quizId}`,
        },
      });
      this.infoLoaded = true;
    } catch (err) {
      if (err.response) {
        if (err.response.status === 401) {
          this.$store.commit('user/logout');
          this.$router.replace({ name: 'Login', query: { redirect: this.$route.fullPath } });
        } else if (err.response.status === 404) {
          this.notFound = true;
        } else {
          throw err;
        }
      } else {
        throw err;
      }
    }
  },
  methods: {
    continueAttempt() {
      this.$router.push({ name: 'Attempt', params: { id: this.attemptId } });
    },
    toResult(attemptId) {
      this.$router.push({ name: 'Result', params: { id: attemptId } });
    },
    async startNewQuiz() {
      this.actionDisabled = true;
      try {
        // Request an attempt id from the server and navigate to attempt page
        const newAttemptId = await QuizService.getQuizAttempt(this.quizId);
        this.$router.push({ name: 'Attempt', params: { id: newAttemptId } });
      } catch (err) {
        if (err.response) {
          if (err.response.status === 401) {
            this.$store.commit('user/logout');
            this.$router.replace({ name: 'Login', query: { redirect: this.$route.fullPath } });
          } else if (err.response.status === 404) {
            this.notFound = true;
          } else if (err.response.status === 409) {
            const ongoing = await QuizService.getOngoingAttempt(this.quizId);
            if (ongoing.length) {
              this.attemptId = ongoing[0].attemptId;
            }
          } else if (err.response.status === 400) {
            this.actionMessage = err.response.data;
            this.actionFailed = true;
          } else {
            throw err;
          }
        } else {
          throw err;
        }
      }
    },
    getOrdinal(number) {
      // Get ordinal from number
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
      try {
        // Load quiz history
        const history = (await QuizService.getQuizHistory(this.quizId)).data;
        history.forEach((value, index) => {
          this.lineChartData.labels.push(this.getOrdinal(index + 1));
          this.lineChartData.datasets[0].data.push((value.score / value.totalPoints) * 100);
        });
        this.quizHistory = history.reverse();
      } catch (err) {
        if (err.response) {
          if (err.response.status === 401) {
            this.$store.commit('user/logout');
            this.$router.replace({ name: 'Login', query: { redirect: this.$route.fullPath } });
          }
        } else {
          throw err;
        }
      }
    },
    toLocalTime(record) {
      return (new Date(record.timeStamp)).toLocaleString();
    },
  },
};
</script>
