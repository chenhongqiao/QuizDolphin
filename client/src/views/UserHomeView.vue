<template>
  <div>
    <div v-if="dashLoaded">
      <v-container>
        <div
          v-for="quiz in quizList"
          :key="'ql'+quiz.quizId"
          class="my-2"
        >
          <v-card>
            <v-card-title>
              {{ quiz.quizName }}
            </v-card-title>
            <v-card-text>
              <div>
                {{ Math.floor(quiz.duration/60) }} minutes
                {{ Math.floor(quiz.duration%60) }} seconds
              </div>
              <div>{{ quiz.questionCount }} questions </div>
            </v-card-text>
            <v-card-actions>
              <v-spacer />
              <v-btn
                text
                @click="toQuiz(quiz.quizId)"
              >
                Access Quiz
              </v-btn>
            </v-card-actions>
          </v-card>
        </div>
        <div
          v-if="$store.state.role==='admin'"
          class="text-right"
        >
          <v-btn @click="newQuiz=true">
            New Quiz
          </v-btn>
        </div>
      </v-container>
    </div>
    <v-progress-linear
      v-else
      indeterminate
    />
    <div v-if="newQuiz">
      <EditQuizInfoComponent
        @cancel="newQuiz=false;"
        @update="newQuiz=false;loadQuizList();"
      />
    </div>
  </div>
</template>

<script>
import AxiosError from 'axios';
import QuizService from '../services/QuizService';
import EditQuizInfoComponent from '../components/EditQuizInfoComponent.vue';

export default {
  name: 'UserDashView',
  components: {
    EditQuizInfoComponent,
  },
  data: () => ({
    quizList: [],
    dashLoaded: false,
    newQuiz: false,
  }),
  computed: {
    getUserName() {
      return this.$store.state.name;
    },
  },
  async mounted() {
    try {
      await this.loadQuizList();
      this.dashLoaded = true;
    } catch (err) {
      if (err instanceof AxiosError) {
        if (err.response.status === 401) {
          this.$store.commit('logout');
          this.$router.push({ name: 'Login' });
        } else {
          throw err;
        }
      } else {
        throw err;
      }
    }
  },
  methods: {
    toQuiz(quizId) {
      this.$router.push(`/quiz/${quizId}`);
    },
    async loadQuizList() {
      this.quizList = await QuizService.getQuizList();
    },
  },
};
</script>
