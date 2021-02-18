<template>
  <div>
    <div
      v-if="quizRunning&&!notFound"
    >
      <v-container>
        <v-row wrap>
          <v-col>
            <div
              class="text-h4"
              :style="'white-space: nowrap;'"
            >
              {{ quizName }} - Attempt
            </div>
            <div class="text--secondary">
              Attempt ID: {{ attemptId }}
            </div>
          </v-col>
        </v-row>
      </v-container>
      <v-container>
        <v-card>
          <v-container>
            <div class="text-h5 font-weight-medium">
              Question #{{ questionIndex }}
            </div>
            <div class="text-subtitle-2 font-weight-regular">
              Points: {{ questions[questionIndex-1].points }}
            </div>
            <div class="text-subtitle-2 font-weight-regular">
              Type: {{ questions[questionIndex-1].type }}
            </div>
          </v-container>
          <v-divider />

          <v-container
            v-if="questions[questionIndex-1].type!=='fill in the blanks'"
          >
            <div class="text-body-1 font-weight-medium text-center ma-4">
              {{ questions[questionIndex-1].context }}
            </div>
          </v-container>

          <v-container>
            <div v-if="questions[questionIndex-1].type==='single choice'">
              <v-radio-group
                v-model="responses[questionIndex-1]"
                row
              >
                <v-col
                  v-for="option in questions[questionIndex-1].options"
                  :key="option"
                  md="3"
                  cols="6"
                >
                  <v-radio
                    :label="option"
                    :value="option"
                  />
                </v-col>
              </v-radio-group>
            </div>

            <div v-if="questions[questionIndex-1].type==='short response'">
              <v-text-field
                v-model="responses[questionIndex-1]"
                name="Your response"
              />
            </div>

            <div v-if="questions[questionIndex-1].type==='multiple choice'">
              <v-row wrap>
                <v-col
                  v-for="option in questions[questionIndex-1].options"
                  :key="option"
                  md="3"
                  cols="6"
                >
                  <v-checkbox
                    v-model="responses[questionIndex-1]"
                    :label="option"
                    :value="option"
                  />
                </v-col>
              </v-row>
            </div>

            <div v-if="questions[questionIndex-1].type==='matching'">
              <v-row
                v-for="(left,index) in questions[questionIndex-1].leftcol"
                :key="'qz'+questions[questionIndex-1].questionId+left"
              >
                <v-col md="8">
                  <v-container>
                    {{ left }}
                  </v-container>
                </v-col>
                <v-col md="4">
                  <v-select
                    v-model="responses[questionIndex-1][index]"
                    :items="questions[questionIndex-1].rightcol"
                    dense
                  />
                </v-col>
              </v-row>
            </div>
            <div
              v-if="questions[questionIndex-1].type==='fill in the blanks'"
              class="ma-4"
            >
              <v-row>
                <div
                  v-for="(context, index) in questions[questionIndex-1].context"
                  :key="'qz'+questions[questionIndex-1].questionId+context"
                >
                  <v-col>
                    <v-row>
                      <v-col
                        cols="auto"
                        class="px-0"
                      >
                        <span>
                          {{ context }}
                        </span>
                      </v-col>
                      <v-col
                        v-if="questions[questionIndex-1].options[index]"
                        cols="auto"
                        class="px-1 pt-1"
                      >
                        <v-select
                          v-model="responses[questionIndex-1][index]"
                          :style="'width: min-content;'"
                          :items="questions[questionIndex-1].options[index]"
                          dense
                        />
                      </v-col>
                    </v-row>
                  </v-col>
                </div>
              </v-row>
            </div>
          </v-container>
        </v-card>
      </v-container>
      <v-container>
        <v-row class="px-2">
          <v-spacer />
          <v-btn
            v-if="questionIndex!==1"
            class="ma-1"
            @click="questionIndex-=1"
          >
            Back
          </v-btn>
          <v-btn
            v-if="questionIndex < questions.length"
            class="ma-1"
            @click="questionIndex+=1;"
          >
            Next
          </v-btn>
          <v-btn
            v-if="questionIndex === questions.length"
            class="ma-1"
            @click="pendingSubmission=true"
          >
            Submit
          </v-btn>
        </v-row>
      </v-container>
      <v-container>
        <v-pagination
          v-model="questionIndex"
          :length="questions.length"
        />
      </v-container>
      <v-container class="text--secondary">
        <v-row class="mx-2">
          <div v-if="needSave">
            Saving...
          </div>
          <div v-else>
            Progress Saved
          </div>
          <v-spacer />
          <TimerComponent
            :end-time="endTime"
            @timeUp="postAttempt()"
          />
        </v-row>
      </v-container>
      <v-dialog
        v-model="pendingSubmission"
        max-width="500px"
      >
        <v-card>
          <v-container>
            You have attempted <b>{{ attemptedNumber }}</b> questions.
            Do you want to submit this quiz? You cannot change your answer once it's submitted.
          </v-container>
          <v-divider />
          <v-card-actions>
            <v-spacer />
            <v-btn
              text
              :disabled="actionDisabled"
              @click="pendingSubmission=false"
            >
              Cancel
            </v-btn>
            <v-btn
              text
              :disabled="actionDisabled"
              @click="postAttempt"
            >
              Submit
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>
    <v-progress-linear
      v-else-if="!notFound"
      indeterminate
    />
    <v-alert
      v-if="notFound"
      type="error"
    >
      <v-row align="center">
        <v-col class="grow">
          Can not find this attempt in the database,
          this might because of incorrect url.
        </v-col>
        <v-col class="shrink">
          <v-btn @click="$router.push('/home')">
            Homepage
          </v-btn>
        </v-col>
      </v-row>
    </v-alert>
    <v-dialog
      v-model="needReload"
      max-width="500px"
      persistent
    >
      <v-card>
        <v-container>
          A newer version of your quiz progress detected on cloud.
          Please click this button to reload.
        </v-container>
        <v-divider />
        <v-card-actions>
          <v-spacer />
          <v-btn
            text
            @click="loadQuiz()"
          >
            Reload
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import AttemptService from '../services/AttemptService';
import TimerComponent from '../components/TimerComponent.vue';

export default {
  name: 'AttemptView',
  components: {
    TimerComponent,
  },
  data: () => ({
    questions: [],
    questionIndex: 1,
    responses: [],
    pendingSubmission: false,
    actionDisabled: false,
    quizRunning: false,
    attemptId: '',
    version: 0,
    needSave: false,
    needReload: false,
    saver: undefined,
    endTime: 0,
    quizName: '',
    quizId: '',
    notFound: false,
  }),
  computed: {
    attemptedNumber() {
      // Compute attempted number
      const attempted = this.responses.reduce((accumulator, current) => {
        if (Array.isArray(current)) {
          if (current.length !== 0) {
            return accumulator + 1;
          }
        }
        if (typeof current === 'string') {
          if (current !== '') {
            return accumulator + 1;
          }
        }
        return accumulator;
      }, 0);
      if (attempted === this.questions.length) {
        return 'ALL';
      }
      return attempted;
    },
  },
  watch: {
    responses: {
      deep: true,
      handler() {
        this.needSave = true;
      },
    },
    questionIndex: {
      handler() {
        this.needSave = true;
      },
    },
  },
  async mounted() {
    this.attemptId = this.$route.params.id;
    await this.loadQuiz();
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
    if (!this.$store.state.navigation.navigation[1]) {
      this.$store.commit('navigation/replace', {
        index: 1,
        info: {
          text: this.quizName,
          disabled: false,
          to: `/quiz/${this.quizId}`,
        },
      });
    }
    this.$store.commit('navigation/replace', {
      index: 2,
      info: {
        text: 'Attempt',
        disabled: false,
        to: `/attempt/${this.attemptId}`,
      },
    });
    // Update progress if necessary every 1 second
    this.saver = setInterval(() => { this.putProgress(); }, 1000);
  },
  methods: {
    async loadQuiz() {
      try {
        // Load quiz data
        const quizData = await AttemptService.getAttemptData(this.attemptId);
        const progress = await AttemptService.getAttemptProgress(this.attemptId);
        this.questions = quizData.questions;
        this.endTime = Date.parse(quizData.endTime);
        this.questionIndex = progress.index;
        this.responses = progress.responses;
        this.version = progress.version;
        this.quizRunning = true;
        this.needReload = false;
        this.quizName = quizData.quizName;
        this.quizId = quizData.quizId;
      } catch (err) {
        if (err.response) {
          if (err.response.status === 401) {
            this.$store.commit('user/logout');
            this.$router.replace({ name: 'Login', query: { redirect: this.$route.fullPath } });
          } else if (err.response.status === 404) {
            this.notFound = true;
          } else if (err.response.status === 410) {
            this.$router.push({ name: 'Result', params: { id: this.attemptId } });
          } else {
            throw err;
          }
        } else {
          throw err;
        }
      }
    },
    async putProgress() {
      // Only upload if there's changes since last upload
      if (this.needSave && this.quizRunning) {
        try {
          // version number ++
          this.version += 1;
          // upload progress
          await AttemptService.putAttemptProgress(this.attemptId, {
            index: this.questionIndex,
            responses: this.responses,
            version: this.version,

          });
          this.needSave = false;
        } catch (err) {
          if (err.response) {
            if (err.response.status === 401) {
              this.$store.commit('user/logout');
              this.$router.replace({ name: 'Login', query: { redirect: this.$route.fullPath } });
            } else if (err.response.status === 404) {
              this.notFound = true;
            } else if (err.response.status === 409) {
              this.needReload = true;
              this.quizRunning = false;
            } else if (err.response.status === 410) {
              if (this.quizRunning) {
                this.postAttempt();
              }
            } else {
              throw err;
            }
          } else {
            throw err;
          }
        }
      }
    },
    async postAttempt() {
      try {
        // Post attempt
        this.quizRunning = false;
        // Stop auto uploading progress
        clearInterval(this.saver);
        // Upload one last time to ensure the server has up to date response
        await this.putProgress();
        // Submit for grading and navigate to result page
        await AttemptService.postAttempt(this.attemptId);
        this.$router.replace({ name: 'Result', params: { id: this.attemptId } });
      } catch (err) {
        if (err.response) {
          if (err.response.status === 401) {
            this.$store.commit('user/logout');
            this.$router.replace({ name: 'Login', query: { redirect: this.$route.fullPath } });
          } else if (err.response.status === 404) {
            this.notFound = true;
          } else if (err.response.status === 410) {
            this.$router.replace({ name: 'Result', params: { id: this.attemptId } });
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
<style>
.v-text-field .v-select__slot .v-select__selection--comma { min-width: min-content}
</style>
