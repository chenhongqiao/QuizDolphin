<template>
  <div>
    <v-container v-if="historyLoaded">
      <v-card>
        <v-data-table
          :headers="tableHeaders"
          :items="quizHistory"
          :search="search"
          show-group-by
          multi-sort
        >
          <!-- eslint-disable-next-line vue/valid-v-slot -->
          <template #item.timeStamp="{ item }">
            {{ (new Date(item.timeStamp)).toLocaleString() }}
          </template>
          <!-- eslint-disable-next-line vue/valid-v-slot -->
          <template #item.attemptId="{ item }">
            <a @click="toResult(item.attemptId)">
              View
            </a>
          </template>
          <!-- eslint-disable-next-line vue/valid-v-slot -->
          <template #item.quizName="{ item }">
            <a @click="toQuiz(item.quizId)">
              {{ item.quizName }}
            </a>
          </template>
        </v-data-table>
      </v-card>
    </v-container>
    <v-progress-linear
      v-else
      indeterminate
    />
  </div>
</template>

<script>
import QuizService from '../services/QuizService';

export default {
  name: 'HomeView',
  data: () => ({
    quizHistory: [],
    search: '',
    historyLoaded: false,
    tableHeaders: [
      {
        text: 'Quiz Name',
        value: 'quizName',
      },
      {
        text: 'Time Stamp',
        value: 'timeStamp',
        groupable: false,
      },
      {
        text: 'Score',
        value: 'score',
        sortable: false,
        groupable: false,
      },
      {
        text: 'Percent',
        groupable: false,
        value: 'percent',
      },
      {
        text: 'Action',
        value: 'attemptId',
        align: 'end',
        groupable: false,
        sortable: false,
      },
    ],
  }),
  async mounted() {
    await this.loadHistory();
  },
  methods: {
    async loadHistory() {
      try {
        this.quizHistory = (await QuizService.getAttemptHistory()).reverse();
        for (let index = 0; index < this.quizHistory.length; index += 1) {
          this.quizHistory[index].percent = ((this.quizHistory[index].score
          / this.quizHistory[index].totalPoints) * 100).toFixed(2);
          this.quizHistory[index].score = `${this.quizHistory[index].score.toFixed(2)}/${this.quizHistory[index].totalPoints.toFixed(2)}`;
        }
        this.historyLoaded = true;
      } catch (err) {
        if (err.response) {
          if (err.response.status === 401) {
            this.$store.commit('user/logout');
            this.$router.push({ path: '/login', query: { redirect: '/history' } });
          } else {
            throw err;
          }
        } else {
          throw err;
        }
      }
    },
    toResult(attemptId) {
      this.$router.push({ name: 'Result', params: { id: attemptId } });
    },
    toQuiz(quizId) {
      this.$router.push({ name: 'QuizInfo', params: { id: quizId } });
    },
  },
};
</script>
