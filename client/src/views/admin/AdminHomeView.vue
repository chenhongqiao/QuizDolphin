<template>
  <div>
    <div v-if="loaded">
      <v-container>
        <div class="text-h5 pa-2">
          Enabled Quizzes
        </div>
        <div
          v-for="quiz in enabledQuiz"
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
              <div>{{ quiz.maxAttempts }} attempts allowed </div>
            </v-card-text>
            <v-card-actions>
              <v-btn
                v-if="quiz.enable"
                text
                @click="edIndex=quiz.quizId;pendingDisable=true;"
              >
                Disable Quiz
              </v-btn>
              <v-btn
                v-else
                text
                @click="edIndex=quiz.quizId;pendingEnable=true;"
              >
                Enable Quiz
              </v-btn>
              <v-spacer />
              <v-btn
                text
                @click="pendingDelete=true;deleteIndex=quiz.quizId;"
              >
                Delete Quiz
              </v-btn>
              <v-btn
                text
                @click="toQuiz(quiz.quizId)"
              >
                Access Quiz
              </v-btn>
            </v-card-actions>
          </v-card>
        </div>
        <div class="text-h5 pa-2">
          Disabled Quizzes
        </div>
        <div
          v-for="quiz in disabledQuiz"
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
              <div>{{ quiz.maxAttempts }} attempts allowed </div>
            </v-card-text>
            <v-card-actions>
              <v-btn
                v-if="quiz.enable"
                text
                @click="edIndex=quiz.quizId;pendingDisable=true;"
              >
                Disable Quiz
              </v-btn>
              <v-btn
                v-else
                text
                @click="edIndex=quiz.quizId;pendingEnable=true;"
              >
                Enable Quiz
              </v-btn>
              <v-spacer />
              <v-btn
                text
                @click="pendingDelete=true;deleteIndex=quiz.quizId;"
              >
                Delete Quiz
              </v-btn>
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
          class="text-right mt-4"
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
    <v-dialog
      v-model="pendingDelete"
      max-width="500px"
    >
      <v-card>
        <v-container>
          Do you want to delete this quiz?
          All questions associated with this quiz will be deleted too.
        </v-container>
        <v-divider />
        <v-card-actions>
          <v-spacer />
          <v-btn
            text
            @click="pendingDelete=false;deleteIndex=null"
          >
            Cancel
          </v-btn>
          <v-btn
            class="red--text"
            text
            @click="deleteQuiz(deleteIndex);loadQuizList();pendingDelete=false;deleteIndex=null"
          >
            Delete
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog
      v-model="pendingEnable"
      max-width="500px"
    >
      <v-card>
        <v-container>
          Do you want to enable this quiz?
          This quiz will be visible to users and will accept submission once enabled.
        </v-container>
        <v-divider />
        <v-card-actions>
          <v-spacer />
          <v-btn
            text
            @click="pendingEnable=false;edIndex=null;"
          >
            Cancel
          </v-btn>
          <v-btn
            text
            @click="enableQuiz(edIndex);loadQuizList();pendingEnable=false;edIndex=null;"
          >
            Enable
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog
      v-model="pendingDisable"
      max-width="500px"
    >
      <v-card>
        <v-container>
          Do you want to disable this quiz?
          This quiz will be no longer visible to users and will not accept submission once disabled.
        </v-container>
        <v-divider />
        <v-card-actions>
          <v-spacer />
          <v-btn
            text
            @click="pendingDisable=false;edIndex=null;"
          >
            Cancel
          </v-btn>
          <v-btn
            text
            @click="disableQuiz(edIndex);loadQuizList();pendingDisable=false;edIndex=null;"
          >
            Disable
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-snackbar
      v-model="actionFailed"
    >
      Action failed because of insufficient privilege.
    </v-snackbar>
  </div>
</template>

<script>
import QuizService from '../../services/QuizService';
import EditQuizInfoComponent from '../../components/admin/EditQuizInfoComponent.vue';

export default {
  name: 'AdminHomeView',
  components: {
    EditQuizInfoComponent,
  },
  data: () => ({
    enabledQuiz: [],
    disabledQuiz: [],
    noPrivileges: false,
    actionFailed: false,
    loaded: false,
    newQuiz: false,
    pendingDelete: false,
    deleteIndex: null,
    edIndex: null,
    pendingEnable: false,
    pendingDisable: false,
  }),
  async mounted() {
    try {
      await this.loadQuizList();
      this.loaded = true;
    } catch (err) {
      if (err.response) {
        if (err.response.status === 401) {
          this.$store.commit('user/logout');
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
      try {
        // Load quiz list and seperate into enabled and disabled
        const quizList = await QuizService.getQuizList();
        this.enabledQuiz = quizList.filter((quiz) => quiz.enable);
        this.disabledQuiz = quizList.filter((quiz) => !quiz.enable);
      } catch (err) {
        if (err.response) {
          if (err.response.status === 401) {
            this.$store.commit('user/logout');
            this.$router.replace({ path: '/login', query: { redirect: this.$route.fullPath } });
          } else {
            throw err;
          }
        } else {
          throw err;
        }
      }
    },
    async deleteQuiz(quizId) {
      try {
        await QuizService.deleteQuiz(quizId);
      } catch (err) {
        if (err.response) {
          if (err.response.status === 401) {
            this.$store.commit('user/logout');
            this.$router.replace({ path: '/login', query: { redirect: this.$route.fullPath } });
          } else if (err.response.status === 404) {
            await this.loadQuizList();
          } else if (err.response.status === 403) {
            this.actionFailed = true;
          } else {
            throw err;
          }
        } else {
          throw err;
        }
      }
    },
    async disableQuiz(quizId) {
      try {
        await QuizService.disableQuiz(quizId);
      } catch (err) {
        if (err.response) {
          if (err.response.status === 401) {
            this.$store.commit('user/logout');
            this.$router.replace({ path: '/login', query: { redirect: this.$route.fullPath } });
          } else if (err.response.status === 404) {
            await this.loadQuizList();
          } else if (err.response.status === 403) {
            this.actionFailed = true;
          } else {
            throw err;
          }
        } else {
          throw err;
        }
      }
    },
    async enableQuiz(quizId) {
      try {
        await QuizService.enableQuiz(quizId);
      } catch (err) {
        if (err.response) {
          if (err.response.status === 401) {
            this.$store.commit('user/logout');
            this.$router.replace({ path: '/login', query: { redirect: this.$route.fullPath } });
          } else if (err.response.status === 404) {
            await this.loadQuizList();
          } else if (err.response.status === 403) {
            this.actionFailed = true;
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
