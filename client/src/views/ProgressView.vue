<template>
  <div>
    <v-container v-if="loaded">
      <v-card>
        <v-data-table
          :headers="tableHeaders"
          :items="ongoingAttempts"
          :search="search"
          show-group-by
          multi-sort
        >
          <template #top>
            <v-toolbar
              flat
            >
              <v-toolbar-title>Ongoing Progress</v-toolbar-title>
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
          <template #item.attemptId="{ item }">
            <router-link
              :to="{ name: 'Attempt', params: { id: item.attemptId }}"
              :title="`Attempt ID: ${item.attemptId}`"
            >
              Access
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
  name: 'ProgressView',
  data: () => ({
    ongoingAttempts: [],
    search: '',
    loaded: false,
    tableHeaders: [
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
        text: 'Action',
        value: 'attemptId',
        align: 'end',
        groupable: false,
        sortable: false,
      },
    ],
  }),
  async mounted() {
    this.$store.commit('navigation/replace', {
      index: 0,
      info: {
        text: 'Progress',
        disabled: false,
        to: '/progress',
      },
    });
    await this.loadProgress();
    this.loaded = true;
  },
  methods: {
    async loadProgress() {
      try {
        this.ongoingAttempts = await QuizService.getOngoingAttempt(null, this.$store.state.user.role === 'admin');
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
