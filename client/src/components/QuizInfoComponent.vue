<template>
  <div v-if="notStarted">
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
      <v-btn
        :disabled="actionDisabled"
        @click="startQuiz"
      >
        start!
      </v-btn>
    </v-container>
  </div>
</template>

<script>
import { DateTime } from 'luxon';
import ResultComponent from './ResultComponent.vue';
import QuizService from '../QuizService';
import QuestionService from '../QuestionService';

export default {
  name: 'QuizInfoComponent',
  components: {
    ResultComponent,
  },
  data: () => ({
    quizHistory: [],
    notStarted: false,
    actionDisabled: false,
  }),
  async beforeMount() {
    this.quizId = this.$route.params.id;
    const previous = (await QuizService.getOngoing(this.quizId)).data;
    if (previous.question) {
      this.$router.push(`/quiz/${this.quizId}/question`);
    } else {
      this.notStarted = true;
      this.getHistory();
    }
  },
  methods: {
    async startQuiz() {
      this.actionDisabled = true;
      const previous = (await QuizService.getOngoing(this.quizId)).data;
      if (!previous.question) {
        const quizData = (await QuestionService.getQuestions(5, this.quizId)).data;
        const quizAttempts = [];
        quizData.forEach((question, index) => {
          if (question.type === 'single choice' || question.type === 'short response') {
            quizAttempts[index] = '';
          } else if (question.type === 'multiple choice' || question.type === 'matching' || question.type === 'fill in the blanks') {
            quizAttempts[index] = [];
          }
        });
        await this.postProgress(1, 1, quizAttempts);
      }
      this.$router.push(`/quiz/${this.quizId}/question`);
      this.actionDisabled = false;
    },
    async getHistory() {
      const rawResponse = (await QuizService.getQuizHistory(this.quizId)).data;
      if (rawResponse === 'Not Logged In!') {
        this.$store.commit('logout');
        this.$router.push('/login');
      } else if (rawResponse !== 'No History!') {
        this.quizHistory = rawResponse.reverse();
      }
    },
    toLocalTime(record) {
      return DateTime.fromISO(record.timeStamp).setZone('America/Los_Angeles').toLocaleString(DateTime.DATETIME_MED);
    },
    async postProgress(progressVersion, currentIndex, quizAttempts) {
      const rawResponse = (await QuizService.postProgress(
        { version: progressVersion, index: currentIndex, attempt: quizAttempts },
        this.quizId,
      )).data;
      if (rawResponse !== 'Success!') {
        console.log('Version Too Old!');
      }
    },
  },
};
</script>
