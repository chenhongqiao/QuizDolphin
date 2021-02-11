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
        <v-tabs>
          <v-tab> Questions </v-tab>
          <v-tab-item>
            <v-data-table
              show-group-by
              :headers="headers"
              :items="questions"
            >
              <template #top>
                <v-toolbar
                  flat
                >
                  <v-toolbar-title>Question List</v-toolbar-title>
                  <v-divider
                    class="mx-4"
                    inset
                    vertical
                  />
                  <v-spacer />
                  <v-btn @click="editing=true">
                    New Question
                  </v-btn>
                </v-toolbar>
              </template>
              <!-- eslint-disable-next-line vue/valid-v-slot -->
              <template #item.actions="{ item }">
                <v-icon
                  small
                  class="mr-2"
                  @click="pendingDeleteQuestion=item;pendingDelete=true;"
                >
                  mdi-delete
                </v-icon>
                <v-icon
                  small
                  class="mr-2"
                  @click="editQuestion(item)"
                >
                  mdi-pencil
                </v-icon>
              </template>
            </v-data-table>
          </v-tab-item>
        </v-tabs>
      </v-container>
    </div>
    <v-progress-linear
      v-else
      indeterminate
    />
    <div v-if="editing&&editIndex!==null">
      <EditQuestionComponent
        :question-id="questions[editIndex].questionId"
        @cancel="editing=false;editIndex=null;"
        @update="editing=false;editIndex=null;loadQuestions()"
      />
    </div>
    <div v-else-if="editing">
      <EditQuestionComponent
        :quiz-id="quizId"
        @cancel="editing=false;editIndex=null;"
        @update="editing=false;editIndex=null;loadQuestions()"
      />
    </div>
    <v-dialog
      v-model="pendingDelete"
      max-width="500px"
    >
      <v-card>
        <v-container>
          Do you want to delete this question?
        </v-container>
        <v-divider />
        <v-card-actions>
          <v-spacer />
          <v-btn
            text
            @click="pendingDelete=false;pendingDeleteQuestion=null"
          >
            Cancel
          </v-btn>
          <v-btn
            class="red--text"
            text
            @click="deleteQuestion();pendingDelete=false;pendingDeleteQuestion=null"
          >
            Delete
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import QuizService from '../services/QuizService';
import QuestionService from '../services/QuestionService';
import EditQuestionComponent from './EditQuestionComponent.vue';

export default {
  components: {
    EditQuestionComponent,
  },
  props: {
    quizId: { type: String, default: '' },
  },
  data: () => ({
    quizName: '',
    questionCount: 0,
    infoLoaded: false,
    duration: 0,
    questions: [],
    editIndex: null,
    editing: false,
    headers: [{
      text: 'Index',
      value: 'index',
      groupable: false,
      sortable: false,
    },
    {
      text: 'Question Type ',
      value: 'type',
      sortable: false,
    },
    {
      text: 'Points ',
      value: 'points',
      sortable: false,
    },
    {
      text: 'ID',
      value: 'questionId',
      sortable: false,
      groupable: false,
    },
    {
      text: 'Actions',
      value: 'actions',
      sortable: false,
      align: 'end',
      groupable: false,
    }],
    pendingDelete: false,
    pendingDeleteQuestion: null,
  }),
  async mounted() {
    try {
      await this.loadQuizInfo();
      await this.loadQuestions();
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
    async deleteQuestion() {
      try {
        // eslint-disable-next-line max-len
        await QuestionService.deleteQuestion(this.questions[this.pendingDeleteQuestion.index - 1].questionId);
        await this.loadQuestions();
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
    async loadQuizInfo() {
      const quizInfo = await QuizService.getQuizInfo(this.quizId);
      this.quizName = quizInfo.quizName;
      this.questionCount = quizInfo.questionCount;
      this.duration = quizInfo.duration;
      this.infoLoaded = true;
    },
    async loadQuestions() {
      this.questions = await QuizService.getQuizQuestions(this.quizId);
      for (let index = 0; index < this.questions.length; index += 1) {
        this.questions[index].index = index + 1;
      }
    },
    editQuestion(question) {
      this.editIndex = question.index - 1;
      this.editing = true;
    },
  },
};
</script>
