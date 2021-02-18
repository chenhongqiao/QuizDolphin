<template>
  <div>
    <v-dialog
      :value="true"
      persistent
    >
      <v-card>
        <v-card-title v-if="quizId&&!notFound&&!noPrivileges">
          Edit Quiz Info
        </v-card-title>
        <v-card-title v-else>
          New Quiz
        </v-card-title>
        <v-divider />
        <v-card-text v-if="loaded">
          <v-form v-model="infoValid">
            <div class="text-h6 text--primary">
              Quiz Name
            </div>
            <div>
              <v-text-field
                v-model="quizInfo.quizName"
                :rules="requiredField"
              />
            </div>
            <div class="text-h6 text--primary">
              Quiz Duration
            </div>
            <v-row>
              <v-col cols="4">
                <div> Hours </div>
                <v-text-field
                  v-model.number="duration.hours"
                  type="number"
                  :rules="[...requiredField,...numberRange]"
                />
              </v-col>
              <v-col cols="4">
                <div> Minutes </div>
                <v-text-field
                  v-model.number="duration.minutes"
                  type="number"
                  :rules="[...requiredField,...numberRange]"
                />
              </v-col>
              <v-col cols="4">
                <div> Seconds </div>
                <v-text-field
                  v-model.number="duration.seconds"
                  type="number"
                  :rules="[...requiredField,...numberRange]"
                />
              </v-col>
            </v-row>
            <div
              v-if="quizInfo.duration<=0"
              class="red--text"
            >
              Duration has to be at least 1 second
            </div>
            <div class="text-h6 text--primary">
              Question Number
            </div>
            <div>
              <v-text-field
                v-model.number="quizInfo.questionCount"
                type="number"
                :rules="[...requiredField,...numberRange]"
              />
            </div>
            <div
              v-if="quizInfo.questionCount<=0"
              class="red--text"
            >
              Question number has to be at least 1
            </div>
            <div class="text-h6 text--primary">
              Attempts Allowed
            </div>
            <div>
              <v-text-field
                v-model.number="quizInfo.maxAttempts"
                type="number"
                :rules="[...requiredField,...numberRange]"
              />
            </div>
          </v-form>
        </v-card-text>
        <v-progress-linear
          v-else-if="!notFound&&!noPrivileges"
          indeterminate
        />
        <v-alert
          v-if="notFound"
          type="error"
        >
          <v-row align="center">
            <v-col class="grow">
              Can not find this quiz in the database.
            </v-col>
            <v-col class="shrink">
              <v-btn @click="$router.push('/home')">
                Homepage
              </v-btn>
            </v-col>
          </v-row>
        </v-alert>
        <v-alert
          v-if="noPrivileges"
          type="error"
        >
          <v-row align="center">
            <v-col class="grow">
              Sorry, this account do not have access to this resource.
              Please logout and log back in with an admin account.
            </v-col>
            <v-col class="shrink">
              <v-btn @click="$router.push('/home')">
                Homepage
              </v-btn>
            </v-col>
          </v-row>
        </v-alert>
        <v-card-actions>
          <v-spacer />
          <v-btn
            text
            @click="pendingQuit=true"
          >
            Quit
          </v-btn>
          <v-btn
            text
            :disabled="!infoValid||!loaded||quizInfo.duration<=0||quizInfo.questionCount<=0"
            @click="updateInfo()"
          >
            Save
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog
      v-model="pendingQuit"
      max-width="500px"
    >
      <v-card>
        <v-container>
          Discard all changes and quit?
        </v-container>
        <v-divider />
        <v-card-actions>
          <v-spacer />
          <v-btn
            text
            @click="pendingQuit=false"
          >
            Cancel
          </v-btn>
          <v-btn
            class="red--text"
            text
            @click="$emit('cancel')"
          >
            Discard
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-snackbar
      v-model="actionFailed"
    >
      {{ actionMessage }}
    </v-snackbar>
  </div>
</template>

<script>
import QuizService from '../../services/QuizService';

export default {
  props: {
    quizId: { type: String, default: null },
  },
  data: () => ({
    quizInfo: {},
    noPrivileges: false,
    notFound: false,
    loaded: false,
    infoValid: false,
    pendingQuit: false,
    requiredField: [
      (v) => {
        if (v !== undefined && v !== null && v !== '') {
          return true;
        }
        return 'This field is requried';
      },
    ],
    numberRange: [
      (v) => {
        if (v >= 0) {
          return true;
        }
        return 'Points can not be negative';
      },
    ],
    duration: {
      hours: null,
      minutes: null,
      seconds: null,
    },
    actionFailed: false,
    actionMessage: '',
  }),
  watch: {
    duration: {
      deep: true,
      handler() {
        // Construct duration in second from hh-mm-ss
        this.quizInfo.duration = this.duration.hours * 3600
        + this.duration.minutes * 60 + this.duration.seconds;
      },
    },
  },
  async mounted() {
    try {
      if (this.quizId) {
        this.quizInfo = await QuizService.getQuizInfo(this.quizId);
        // Build hh-mm-ss from duration in second
        this.duration.seconds = Math.floor(this.quizInfo.duration % 60);
        this.duration.minutes = Math.floor((this.quizInfo.duration % 3600) / 60);
        this.duration.hours = Math.floor((this.quizInfo.duration % (3600 * 60)) / 3600);
      }
      this.loaded = true;
    } catch (err) {
      if (err.response) {
        if (err.response.status === 401) {
          this.$store.commit('user/logout');
          this.$router.replace({ name: 'Login', query: { redirect: this.$route.fullPath } });
        } else if (err.response.status === 403) {
          this.noPrivileges = true;
        } else if (err.response.status === 404) {
          this.notFound = true;
        } else {
          throw err;
        }
      } else {
        throw err;
      }
    }
  },
  methods: {
    async updateInfo() {
      try {
        this.loaded = false;
        if (this.quizId) {
          await QuizService.putQuizInfo(this.quizId, this.quizInfo);
        } else {
          const quizId = await QuizService.postQuizInfo(this.quizInfo);
          this.$router.push(`/quiz/${quizId}`);
        }
        this.$emit('update');
      } catch (err) {
        if (err.response) {
          if (err.response.status === 401) {
            this.$store.commit('user/logout');
            this.$router.replace({ name: 'Login', query: { redirect: this.$route.fullPath } });
          } else if (err.response.status === 403) {
            this.noPrivileges = true;
          } else if (err.response.status === 404) {
            this.notFound = true;
          } else if (err.response.status === 400) {
            this.loaded = true;
            this.actionMessage = err.response.data;
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
