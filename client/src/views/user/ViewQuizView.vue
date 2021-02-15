<template>
  <div>
    <div v-if="infoLoaded">
      <v-container>
        <v-row wrap>
          <v-col>
            <div
              class="text-h4"
              :style="'white-space: nowrap;'"
            >
              {{ quizName }}
            </div>
            <div>
              {{ questionCount }} questions
            </div>
            <div>
              {{ Math.floor(duration/60) }} minutes
              {{ Math.floor(duration%60) }} seconds
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
            class="text-center ma-2"
          >
            <v-btn
              :disabled="actionDisabled"
              @click="startNewQuiz()"
            >
              Start
            </v-btn>
          </div>
        </div>
      </v-container>
      <v-container>
        <v-tabs>
          <v-tab> Records </v-tab>
          <v-tab> Graphs </v-tab>
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
                      <a @click="toResult(record.attemptId)">
                        View
                      </a>
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
              :chart-data="historyChartData"
              :options="{maintainAspectRatio: false}"
              :style="'height=200px;'"
            />
          </v-tab-item>
        </v-tabs>
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
import LineChartComponent from '../../components/LineChartComponent.vue';

export default {
  name: 'UserQuizComponent',
  components: {
    LineChartComponent,
  },
  data: () => ({
    quizId: '',
    quizHistory: [],
    duration: 0,
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
    actionDisabled: false,
    attemptId: '',
    infoLoaded: false,
    quizName: '',
    questionCount: 0,
  }),
  async mounted() {
    this.quizId = this.$route.params.id;
    try {
      const ongoing = await QuizService.getOngoingAttempt(this.quizId);
      if (ongoing.length) {
        this.attemptId = ongoing[0].attemptId;
      }
      const quizInfo = await QuizService.getQuizInfo(this.quizId);
      this.quizName = quizInfo.quizName;
      this.questionCount = quizInfo.questionCount;
      this.duration = quizInfo.duration;
      const history = await QuizService.getAttemptHistory(this.quizId);
      history.forEach((value, index) => {
        this.historyChartData.labels.push(this.getOrdinal(index + 1));
        this.historyChartData.datasets[0].data.push((value.score / value.totalPoints) * 100);
      });
      this.quizHistory = history.reverse();
      if (!this.$store.state.navigation[0]) {
        this.$store.commit('replaceNav', {
          index: 0,
          info: {
            text: 'Home',
            disabled: false,
            to: '/home',
          },
        });
      }
      this.$store.commit('replaceNav', {
        index: 1,
        info: {
          text: this.quizName,
          disabled: false,
          to: `/quiz/${this.quizId}/view`,
        },
      });
      this.infoLoaded = true;
    } catch (err) {
      if (err.response) {
        if (err.response.status === 401) {
          this.$store.commit('logout');
          this.$router.push({ path: '/login', query: { redirect: this.$route.path } });
        } else if (err.response.status === 404) {
        // TODO: 404 Page
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
        this.attemptId = await QuizService.getQuizAttempt(this.quizId);
      } catch (err) {
        if (err.response) {
          if (err.response.status === 401) {
            this.$store.commit('logout');
            this.$router.push({ path: '/login', query: { redirect: `/quiz/${this.quizId}` } });
          } else if (err.response.status === 404) {
            // TODO: 404 Page
          } else {
            throw err;
          }
        } else {
          throw err;
        }
      }
      this.$router.push({ name: 'Attempt', params: { id: this.attemptId } });
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
      try {
        const history = (await QuizService.getQuizHistory(this.quizId)).data;
        history.forEach((value, index) => {
          this.historyChartData.labels.push(this.getOrdinal(index + 1));
          this.historyChartData.datasets[0].data.push((value.score / value.totalPoints) * 100);
        });
        this.quizHistory = history.reverse();
      } catch (err) {
        if (err.response) {
          if (err.response.status === 401) {
            this.$store.commit('logout');
            this.$router.push({ path: '/login', query: { redirect: `/quiz/${this.quizId}` } });
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