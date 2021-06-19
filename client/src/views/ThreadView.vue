<template>
  <div>
    <div v-if="loaded">
      <v-container>
        <div class="text-h5 pa-2">
          Answered Questions
        </div>
        <div
          v-for="thread in answeredThreads"
          :key="thread.threadId"
        >
          <v-card class="my-2">
            <v-container>
              <v-row>
                <div class="pa-3 text-h6">
                  Question
                </div>
                <v-spacer />
                <div class="px-3 pt-4 text--secondary text-subtitle-2">
                  Posted by {{ thread.email }}
                </div>
              </v-row>
              <div class="text-body-1 pt-2 pb-4 text-center">
                {{ thread.question }}
              </div>
              <div
                v-if="$store.state.user.role==='admin'"
                class="text-right pb-2"
              >
                <v-btn
                  text
                  @click="deleteThread(thread.threadId)"
                >
                  Delete
                </v-btn>
              </div>
              <v-divider />
              <v-row class="mt-1">
                <div class="pa-3 text-h6">
                  Answer
                </div>
                <v-spacer />
                <div class="px-3 pt-4 text--secondary text-subtitle-2">
                  Posted by Administrators
                </div>
              </v-row>
              <v-textarea
                v-if="$store.state.user.role==='admin'"
                v-model="thread.answer"
              />
              <div
                v-else
                class="text-body-1 pt-2 text-center"
              >
                {{ thread.answer }}
              </div>
              <div
                v-if="$store.state.user.role==='admin'"
                class="text-right"
              >
                <v-btn
                  text
                  @click="postAnswer(thread)"
                >
                  Save
                </v-btn>
              </div>
            </v-container>
          </v-card>
        </div>
        <div class="text-h5 pa-2 mt-4">
          Unanswered Questions
        </div>
        <div
          v-for="thread in unansweredThreads"
          :key="thread.threadId"
        >
          <v-card class="my-2">
            <v-container>
              <v-row>
                <div class="pa-3 text-h6">
                  Question
                </div>
                <v-spacer />
                <div class="px-3 pt-4 text--secondary text-subtitle-2">
                  Posted by {{ thread.email }}
                </div>
              </v-row>
              <div class="text-body-1 pt-2 pb-4 text-center">
                {{ thread.question }}
              </div>
              <div
                v-if="$store.state.user.role==='admin'"
                class="text-right pb-2"
              >
                <v-btn
                  text
                  @click="deleteThread(thread.threadId)"
                >
                  Delete
                </v-btn>
              </div>
              <div v-if="$store.state.user.role==='admin'">
                <v-divider />
                <v-row class="mt-1">
                  <div class="pa-3 text-h6">
                    Answer
                  </div>
                  <v-spacer />
                </v-row>
                <v-textarea v-model="thread.answer" />
              </div>
              <div
                v-if="$store.state.user.role==='admin'"
                class="text-right"
              >
                <v-btn
                  text
                  @click="postAnswer(thread)"
                >
                  Save
                </v-btn>
              </div>
            </v-container>
          </v-card>
        </div>
        <div class="text-right pt-2">
          <v-btn @click="newQuestion=true;">
            New Question
          </v-btn>
        </div>
      </v-container>
    </div>
    <v-progress-linear
      v-else
      indeterminate
    />
    <v-dialog v-model="newQuestion">
      <v-card>
        <v-card-title>
          New Question
        </v-card-title>
        <v-textarea
          v-model="newQuestionContext"
          class="pa-4 mx-2"
        />
        <v-card-actions>
          <v-spacer />
          <v-btn
            text
            @click="newQuestion=false;newQuestionContext=''"
          >
            Discard
          </v-btn>
          <v-btn
            text
            @click="newQuestion=false;postQuestion();newQuestionContext=''"
          >
            Save
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import ThreadService from '../services/ThreadService';

export default {
  name: 'ThreadView',
  data: () => ({
    threads: [],
    answeredThreads: [],
    unansweredThreads: [],
    loaded: false,
    newQuestion: false,
    newQuestionContext: '',
  }),
  mounted() {
    this.$store.commit('navigation/replace', {
      index: 0,
      info: {
        text: 'Help',
        disabled: false,
        to: '/help',
      },
    });
    this.loadQuestions();
  },
  methods: {
    async loadQuestions() {
      try {
        this.loaded = false;
        this.threads = await ThreadService.getThreads();
        this.answeredThreads = this.threads.filter((value) => (value.answer));
        this.unansweredThreads = this.threads.filter((value) => (!value.answer));
        this.loaded = true;
      } catch (err) {
        if (err.response) {
          if (err.response.status === 401) {
            this.$store.commit('user/logout');
            this.$router.replace({ name: 'Login', query: { redirect: this.$route.fullPath } });
          }
        } else {
          throw err;
        }
      }
    },
    async postAnswer(thread) {
      try {
        await ThreadService.postAnswer(thread.threadId, thread.answer);
        await this.loadQuestions();
      } catch (err) {
        if (err.response) {
          if (err.response.status === 401) {
            this.$store.commit('user/logout');
            this.$router.replace({ name: 'Login', query: { redirect: this.$route.fullPath } });
          }
        } else {
          throw err;
        }
      }
    },
    async postQuestion() {
      try {
        await ThreadService.postQuestion(this.newQuestionContext);
        await this.loadQuestions();
      } catch (err) {
        if (err.response) {
          if (err.response.status === 401) {
            this.$store.commit('user/logout');
            this.$router.replace({ name: 'Login', query: { redirect: this.$route.fullPath } });
          }
        } else {
          throw err;
        }
      }
    },
    async deleteThread(threaId) {
      try {
        await ThreadService.deleteThread(threaId);
        await this.loadQuestions();
      } catch (err) {
        if (err.response) {
          if (err.response.status === 401) {
            this.$store.commit('user/logout');
            this.$router.replace({ name: 'Login', query: { redirect: this.$route.fullPath } });
          }
        } else {
          throw err;
        }
      }
    },
  },
};
</script>
