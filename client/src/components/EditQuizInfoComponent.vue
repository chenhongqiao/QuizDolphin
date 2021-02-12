<template>
  <div>
    <v-dialog
      :value="true"
      persistent
    >
      <v-card>
        <v-card-title v-if="quizId">
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
          </v-form>
        </v-card-text>
        <v-progress-linear
          v-else
          indeterminate
        />
        <v-card-actions>
          <v-spacer />
          <v-btn
            text
            @click="pendingQuit=true"
          >
            Quit
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
  </div>
</template>

<script>
import QuizService from '../services/QuizService';

export default {
  props: {
    quizId: { type: String, default: null },
  },
  data: () => ({
    quizInfo: {},
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
      hours: 0,
      minutes: 0,
      seconds: 0,
    },
  }),
  watch: {
    duration: {
      deep: true,
      handler() {
        this.quizInfo.duration = this.duration.hours * 3600
        + this.duration.minutes * 60 + this.duration.seconds;
      },
    },
  },
  async mounted() {
    try {
      if (this.quizId) {
        this.quizInfo = await QuizService.getQuizInfo(this.quizId);
        this.duration.seconds = Math.floor(this.quizInfo.duration % 60);
        this.duration.minutes = Math.floor((this.quizInfo.duration % 3600) / 60);
        this.duration.hours = Math.floor((this.quizInfo.duration % (3600 * 60)) / 3600);
        this.loaded = true;
      }
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
};
</script>
