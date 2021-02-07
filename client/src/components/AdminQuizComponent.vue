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
    </div>
    <v-progress-linear
      v-else
      indeterminate
    />
  </div>
</template>

<script>
import QuizService from '../services/QuizService';

export default {
  props: {
    quizId: { type: String, default: '' },
  },
  data: () => ({
    quizName: '',
    questionCount: 0,
    infoLoaded: false,
    duration: 0,
  }),
  async mounted() {
    try {
      await this.loadQuizInfo();
      this.infoLoaded = true;
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
          to: `/quiz/${this.quizId}`,
        },
      });
    } catch (err) {
      if (err.response) {
        if (err.response.status === 401 || err.response.status === 403) {
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
  },
  methods: {
    async loadQuizInfo() {
      const quizInfo = await QuizService.getQuizInfo(this.quizId);
      this.quizName = quizInfo.quizName;
      this.questionCount = quizInfo.questionCount;
      this.duration = quizInfo.duration;
      this.infoLoaded = true;
    },
  },
};
</script>
