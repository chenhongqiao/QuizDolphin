<template>
  <div>
    <v-container>
      <v-card>
        <v-container>
          <h2>Problem #{{ currentQuestion }}</h2>
          <div>Points: {{ quizData[currentQuestion-1].points }}</div>
          <div>Type: {{ quizData[currentQuestion-1].type }}</div>
        </v-container>
        <v-divider />

        <v-container
          v-if="quizData[currentQuestion-1].type!=='fill in the blanks'"
        >
          <h3>Context:</h3>
          <div class="text-center">
            {{ quizData[currentQuestion-1].context }}
          </div>
        </v-container>

        <v-container>
          <h3
            v-if="quizData[currentQuestion-1].type==='single choice'||
              quizData[currentQuestion-1].type==='multiple choice'"
          >
            Options:
          </h3>
          <h3
            v-if="quizData[currentQuestion-1].type==='short response'"
          >
            Your Response:
          </h3>
          <h3
            v-if="quizData[currentQuestion-1].type==='matching'"
          >
            Matching:
          </h3>
          <h3
            v-if="quizData[currentQuestion-1].type==='fill in the blanks'"
          >
            Fill in the Blanks:
          </h3>

          <div v-if="quizData[currentQuestion-1].type==='single choice'">
            <v-radio-group
              v-model="quizResponses[currentQuestion-1]"
              row
            >
              <v-col
                v-for="option in quizData[currentQuestion-1].options"
                :key="option"
                md="3"
              >
                <v-radio
                  :label="option"
                  :value="option"
                />
              </v-col>
            </v-radio-group>
          </div>

          <div v-if="quizData[currentQuestion-1].type==='short response'">
            <v-text-field
              v-model="quizResponses[currentQuestion-1]"
              name="Your response"
            />
          </div>

          <div v-if="quizData[currentQuestion-1].type==='multiple choice'">
            <v-row wrap>
              <v-col
                v-for="option in quizData[currentQuestion-1].options"
                :key="option"
                md="3"
              >
                <v-checkbox
                  v-model="quizResponses[currentQuestion-1]"
                  :label="option"
                  :value="option"
                />
              </v-col>
            </v-row>
          </div>

          <div v-if="quizData[currentQuestion-1].type==='matching'">
            <v-row
              v-for="(left,index) in quizData[currentQuestion-1].leftcol"
              :key="'qz'+quizData[currentQuestion-1].questionId+left"
            >
              <v-col md="8">
                <v-container>
                  {{ left }}
                </v-container>
              </v-col>
              <v-col md="4">
                <v-select
                  v-model="quizResponses[currentQuestion-1][index]"
                  :items="quizData[currentQuestion-1].rightcol"
                  dense
                  @input="updateRightCol(index)"
                />
              </v-col>
            </v-row>
          </div>

          <div v-if="quizData[currentQuestion-1].type==='fill in the blanks'">
            <v-container>
              <span
                v-for="(context, index) in quizData[currentQuestion-1].context"
                :key="'qz'+quizData[currentQuestion-1].questionId+context"
              >
                {{ context }}
                <v-select
                  v-if="quizData[currentQuestion-1].options[index]"
                  v-model="quizResponses[currentQuestion-1][index]"
                  class="d-inline-flex"
                  :items="quizData[currentQuestion-1].options[index]"
                  dense
                />
              </span>
            </v-container>
          </div>
        </v-container>
      </v-card>
    </v-container>

    <v-container>
      <v-row>
        <v-spacer />
        <v-btn
          @click="currentQuestion-=1"
        >
          Back
        </v-btn>
        <v-btn
          v-if="currentQuestion < quizData.length"
          @click="currentQuestion+=1;"
        >
          Next
        </v-btn>
        <v-btn
          v-if="currentQuestion === quizData.length"
          @click="pendingSubmission=true"
        >
          Submit!
        </v-btn>
      </v-row>
    </v-container>
    <v-container>
      <v-pagination
        v-model="currentQuestion"
        :length="quizData.length"
      />
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
</template>

<script>
export default {
  name: 'QuizComponent',
  props: {
    quizData: { type: Array, default: null },
    previousResponses: { type: Array, default: null },
    currentIndex: { type: Number, default: 1 },
  },
  data: () => ({
    currentQuestion: 1,
    quizResponses: [],
    pendingSubmission: false,
    actionDisabled: false,
  }),
  computed: {
    attemptedNumber() {
      const attempted = this.quizResponses.reduce((accumulator, current) => {
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
      if (attempted === this.quizData.length) {
        return 'ALL';
      }
      return attempted;
    },
  },
  watch: {
    quizResponses: {
      deep: true,
      handler() {
        this.$emit('update:previousResponses', this.quizResponses);
      },
    },
    currentQuestion: {
      handler() {
        this.$emit('update:currentIndex', this.currentQuestion);
      },
    },
  },
  beforeMount() {
    this.currentQuestion = this.currentIndex;
    this.quizResponses = [...this.previousResponses];
  },
  methods: {
    postAttempt() {
      this.actionDisabled = true;
      this.$emit('update:previousResponses', this.quizResponses);
      this.$emit('quizDone');
    },
    updateRightCol(index) {
      let targetIndex = this.quizResponses[this.currentQuestion - 1]
        .indexOf(this.quizResponses[this.currentQuestion - 1][index]);
      if (targetIndex === index) {
        targetIndex = this.quizResponses[this.currentQuestion - 1]
          .indexOf(this.quizResponses[this.currentQuestion - 1][index], index + 1);
      }
      if (targetIndex !== -1) {
        this.quizResponses[this.currentQuestion - 1][targetIndex] = null;
      }
    },
  },
};
</script>
<style>
.v-select.v-input input {
  width: 60px;
}
.v-select.v-input--is-dirty input {
  width: 4px;
}
</style>
