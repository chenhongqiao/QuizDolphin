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
              v-model="quizAttempts[currentQuestion-1]"
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
              v-model="quizAttempts[currentQuestion-1]"
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
                  v-model="quizAttempts[currentQuestion-1]"
                  :label="option"
                  :value="option"
                />
              </v-col>
            </v-row>
          </div>

          <div v-if="quizData[currentQuestion-1].type==='matching'">
            <v-row
              v-for="(left,index) in quizData[currentQuestion-1].leftcol"
              :key="'qz'+quizData[currentQuestion-1].uuid+left"
            >
              <v-col md="8">
                <v-container>
                  {{ left }}
                </v-container>
              </v-col>
              <v-col md="4">
                <v-select
                  v-model="quizAttempts[currentQuestion-1][index]"
                  :items="quizData[currentQuestion-1].rightcol"
                  dense
                  @input="updateRightCol(index)"
                />
              </v-col>
            </v-row>
          </div>

          <div v-if="quizData[currentQuestion-1].type==='fill in the blanks'">
            <span
              v-for="(context, index) in quizData[currentQuestion-1].context"
              :key="'qz'+quizData[currentQuestion-1].uuid+context"
            >
              {{ context }}
              <v-select
                v-if="quizData[currentQuestion-1].options[index]!==undefined"
                v-model="quizAttempts[currentQuestion-1][index]"
                class="d-inline-flex"
                :items="quizData[currentQuestion-1].options[index]"
                dense
              />
            </span>
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
          @click="nextQuestion"
        >
          Next
        </v-btn>
        <v-btn
          v-if="currentQuestion === quizData.length"
          @click="submitQuiz"
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
  </div>
</template>

<script>
export default {
  name: 'QuizComponent',
  props: {
    quizData: { type: Array, default: null },
    quizAnswers: { type: Array, default: null },
  },
  data: () => ({
    currentQuestion: 1,
    quizAttempts: [],
  }),
  beforeMount() {
    this.quizData.forEach((question) => {
      if (question.type === 'single choice' || question.type === 'short response') {
        this.quizAttempts.push('');
      } else if (question.type === 'multiple choice' || question.type === 'matching' || question.type === 'fill in the blanks') {
        this.quizAttempts.push([]);
      }
    });
  },
  methods: {
    nextQuestion() {
      this.currentQuestion += 1;
      this.$emit('update:quizAnswers', this.quizAttempts);
    },
    submitQuiz() {
      this.$emit('update:quizAnswers', this.quizAttempts);
      this.$emit('quizDone');
    },
    updateRightCol(index) {
      let targetIndex = this.quizAttempts[this.currentQuestion - 1]
        .indexOf(this.quizAttempts[this.currentQuestion - 1][index]);
      if (targetIndex === index) {
        targetIndex = this.quizAttempts[this.currentQuestion - 1]
          .indexOf(this.quizAttempts[this.currentQuestion - 1][index], index + 1);
      }
      if (targetIndex !== -1) {
        this.quizAttempts[this.currentQuestion - 1][targetIndex] = undefined;
      }
    },
  },
};
</script>
<style>
.v-select.v-input input {
  width: 80px;
}
.v-select.v-input--is-dirty input {
  width: 4px;
}
</style>
