<template>
  <div>
    <v-container>
      <v-card>
        <v-data-table
          :headers="tableHeaders"
          :items="quizHistory"
          :search="search"
          show-group-by
          multi-sort
        >
          <!-- eslint-disable-next-line vue/valid-v-slot !-->
          <template #item.timeStamp="{ item }">
            {{ (new Date(item.timeStamp)).toLocaleString() }}
          </template>
          <!-- eslint-disable-next-line vue/valid-v-slot !-->
          <template #item.attemptId="{ item }">
            <a @click="toResult(item.attemptId)">
              View
            </a>
          </template>
        </v-data-table>
      </v-card>
    </v-container>
  </div>
</template>

<script>
import AxiosError from 'axios';
import QuizService from '../services/QuizService';

export default {
  name: 'HomeView',
  data: () => ({
    quizHistory: [],
    search: '',
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
      } catch (err) {
        if (err instanceof AxiosError && err.response) {
          if (err.response.status === 401) {
            this.$store.commit('logout');
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
  },
};
</script>
