<template>
  <div>
    <v-container>
      <h2>Problem #{{ currentQuestion + 1 }}</h2>
      <div>Points: {{ quizData[currentQuestion].points }}</div>
      <div>Type: {{ quizData[currentQuestion].type }}</div>
    </v-container>
    <v-container>
      <h3>Context:</h3>
      <div class="text-center">
        {{ quizData[currentQuestion].context }}
      </div>
    </v-container>
    <v-container>
      <h3
        v-if="quizData[currentQuestion].type==='single choice'||
          quizData[currentQuestion].type==='multiple choice'"
      >
        Options:
      </h3>
      <h3
        v-if="quizData[currentQuestion].type==='short response'"
      >
        Your Response:
      </h3>
      <div v-if="quizData[currentQuestion].type==='single choice'">
        <v-radio-group
          v-model="quizAttempts[currentQuestion]"
          row
        >
          <v-col
            v-for="option in quizData[currentQuestion].options"
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
      <v-text-field
        v-if="quizData[currentQuestion].type==='short response'"
        v-model="quizAttempts[currentQuestion]"
        name="Your response"
      />
      <div v-if="quizData[currentQuestion].type==='multiple choice'">
        <v-row wrap>
          <v-col
            v-for="option in quizData[currentQuestion].options"
            :key="option"
            md="3"
          >
            <v-checkbox
              v-model="quizAttempts[currentQuestion]"
              :label="option"
              :value="option"
            />
          </v-col>
        </v-row>
      </div>
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
          v-if="currentQuestion < quizData.length - 1"
          @click="nextQuestion"
        >
          Next
        </v-btn>
        <v-btn
          v-if="currentQuestion === quizData.length - 1"
          @click="submitQuiz"
        >
          Submit!
        </v-btn>
      </v-row>
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
    currentQuestion: 0,
    quizAttempts: [],
  }),
  mounted() {
    this.quizData.forEach((question) => {
      if (question.type === 'single choice' || question.type === 'short response') {
        this.quizAttempts.push('');
      } else if (question.type === 'multiple choice') {
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
      this.$emit('update:quizAnswers', this.quizAnswers);
      this.$emit('quizDone');
    },
  },
};
</script>
