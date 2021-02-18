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
          <template #top>
            <v-toolbar
              flat
            >
              <v-toolbar-title>Attempt History</v-toolbar-title>
            </v-toolbar>
            <v-toolbar flat>
              <v-text-field
                v-model="search"
                class="mx-4"
                :label="'Search'"
                append-icon="mdi-magnify"
              />
            </v-toolbar>
          </template>
          <!-- eslint-disable-next-line vue/valid-v-slot -->
          <template #item.timeStamp="{ item }">
            {{ (new Date(item.timeStamp)).toLocaleString() }}
          </template>
          <!-- eslint-disable-next-line vue/valid-v-slot -->
          <template #item.attemptId="{ item }">
            <router-link
              :to="{ name: 'Result', params: { id: item.attemptId }}"
              :title="`Attempt ID: ${item.attemptId}`"
            >
              View
            </router-link>
          </template>
          <!-- eslint-disable-next-line vue/valid-v-slot -->
          <template #item.quizName="{ item }">
            <router-link :to="{ name: 'QuizInfo', params: { id: item.quizId } }">
              {{ item.quizName }}
            </router-link>
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
        text: 'Time Stamp',
        value: 'timeStamp',
        filterable: false,
        groupable: false,
      },
      {
        text: 'Quiz Name',
        value: 'quizName',
      },
      {
        text: 'Name',
        value: 'userName',
      },
      {
        text: 'Email',
        value: 'email',
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
      {
        text: 'localTime',
        value: 'localTime',
        align: ' d-none',
      },
    ],
  }),
  async mounted() {
    this.$store.commit('navigation/replace', {
      index: 0,
      info: {
        text: 'History',
        disabled: false,
        to: '/history',
      },
    });
    await this.loadHistory();
  },
  methods: {
    async loadHistory() {
      try {
        this.quizHistory = (await QuizService.getAttemptHistory(null, this.$store.state.user.role === 'admin')).reverse();
        for (let index = 0; index < this.quizHistory.length; index += 1) {
          this.quizHistory[index].percent = ((this.quizHistory[index].score
          / this.quizHistory[index].totalPoints) * 100).toFixed(2);
          this.quizHistory[index].score = `${this.quizHistory[index].score.toFixed(2)}/${this.quizHistory[index].totalPoints.toFixed(2)}`;
          this.quizHistory[index].localTime = (new Date(this.quizHistory[index].timeStamp))
            .toLocaleString();
        }
        this.historyLoaded = true;
      } catch (err) {
        if (err.response) {
          if (err.response.status === 401) {
            this.$store.commit('user/logout');
            this.$router.replace({ name: 'Login', query: { redirect: this.$route.fullPath } });
          } else {
            throw err;
          }
        } else {
          throw err;
        }
      }
    },
  },
};
</script>
