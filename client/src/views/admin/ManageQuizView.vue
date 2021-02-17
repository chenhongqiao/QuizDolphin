<template>
  <!--eslint-disable max-len -->
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
          <v-spacer />
          <div
            class="pa-4"
            @click="editing = 'info'"
          >
            <v-btn> Edit Quiz Info </v-btn>
          </div>
        </v-row>
      </v-container>
      <v-container>
        <v-tabs v-model="$store.state.quizView.adminTab">
          <v-tab> Questions </v-tab>
          <v-tab> Results </v-tab>
          <v-tab-item>
            <v-data-table
              show-group-by
              :headers="questionHeader"
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
                  <v-btn @click="editing = 'question'">
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
          <v-tab-item>
            <v-data-table
              show-expand
              multi-sort
              :headers="resultsHeader"
              :items="results"
              item-key="email"
              :single-expand="true"
            >
              <template
                #expanded-item="{ headers, item }"
              >
                <td :colspan="headers.length">
                  <v-simple-table
                    light
                    :style="'box-shadow: inset 0px 4px 8px -5px rgb(50 50 50 / 75%);'"
                  >
                    <template #default>
                      <thead>
                        <tr class="auto">
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
                          v-for="(record, index) in item.records"
                          :key="'r'+index+record"
                        >
                          <td>{{ toLocalTime(record) }} </td>
                          <td class="text-left">
                            {{ record.score.toFixed(2) }}/{{ record.totalPoints.toFixed(2) }}
                          </td>
                          <td class="text-right">
                            <router-link :to="{ name: 'Result', params: { id: record.attemptId },query: { admin: true } }">
                              View
                            </router-link>
                          </td>
                        </tr>
                      </tbody>
                    </template>
                  </v-simple-table>
                </td>
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
    <div v-if="editing==='question'&&editIndex!==null">
      <EditQuestionComponent
        :question-id="questions[editIndex].questionId"
        @cancel="editing=null;editIndex=null;"
        @update="editing=null;editIndex=null;loadQuestions()"
      />
    </div>
    <div v-if="editing==='question'&&editIndex===null">
      <EditQuestionComponent
        :quiz-id="quizId"
        @cancel="editing=null;editIndex=null;"
        @update="editing=null;editIndex=null;loadQuestions()"
      />
    </div>
    <div v-if="editing==='info'">
      <EditQuizInfoComponent
        :quiz-id="quizId"
        @cancel="editing=null;"
        @update="editing=null;loadQuizInfo()"
      />
    </div>
    <v-dialog
      v-model="pendingDelete"
      max-width="500px"
    >
      <v-card>
        <v-container>
          Do you want to delete this question? You cannot recover this question once it's deleted.
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
import QuizService from '../../services/QuizService';
import QuestionService from '../../services/QuestionService';
import EditQuestionComponent from '../../components/admin/EditQuestionComponent.vue';
import EditQuizInfoComponent from '../../components/admin/EditQuizInfoComponent.vue';

export default {
  components: {
    EditQuestionComponent,
    EditQuizInfoComponent,
  },
  props: {
    quizId: { type: String, default: null },
  },
  data: () => ({
    quizName: '',
    questionCount: 0,
    infoLoaded: false,
    duration: 0,
    questions: [],
    editIndex: null,
    editing: null,
    expanded: [],
    questionHeader: [{
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
    resultsHeader: [{
      text: 'Name',
      value: 'userName',
    },
    {
      text: 'Email',
      value: 'email',
    },
    {
      text: 'Best Score',
      value: 'bestScore',
    }, {
      text: '',
      value: 'data-table-expand',
    }],
    pendingDelete: false,
    pendingDeleteQuestion: null,
    results: [],
  }),
  async mounted() {
    try {
      await this.loadQuizInfo();
      await this.loadQuestions();
      await this.loadResults();
      this.infoLoaded = true;
      if (!this.$store.state.navigation.navigation[0]) {
        this.$store.commit('navigation/replace', {
          index: 0,
          info: {
            text: 'Home',
            disabled: false,
            to: '/home',
          },
        });
      }
      this.$store.commit('navigation/replace', {
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
          this.$store.commit('user/logout');
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
    async deleteQuestion() {
      try {
        // eslint-disable-next-line max-len
        await QuestionService.deleteQuestion(this.questions[this.pendingDeleteQuestion.index - 1].questionId);
        await this.loadQuestions();
      } catch (err) {
        if (err.response) {
          if (err.response.status === 401 || err.response.status === 403) {
            this.$store.commit('user/logout');
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
    async loadResults() {
      const history = (await QuizService.getAttemptHistory(this.quizId, true)).reverse();
      const results = new Map();
      for (let index = 0; index < history.length; index += 1) {
        // eslint-disable-next-line max-len
        let result = {};
        if (!results.has(history[index].email)) {
          result.bestScore = history[index].score;
          result.email = history[index].email;
          result.userName = history[index].userName;
          result.records = [];
        } else {
          result = results.get(history[index].email);
          if (history[index].score > result.bestScore) {
            result.bestScore = history[index].score;
          }
        }
        result.records.push(history[index]);
        results.set(history[index].email, result);
      }
      this.results = [...results].map(([, value]) => value);
      this.results.sort((a, b) => ((a.userName > b.userName) ? 1 : -1));
    },
    editQuestion(question) {
      this.editIndex = question.index - 1;
      this.editing = 'question';
    },
    toLocalTime(record) {
      return (new Date(record.timeStamp)).toLocaleString();
    },
  },
};
</script>
<style>
 .v-data-table__expanded__content {
   box-shadow: none !important;
 }
</style>
