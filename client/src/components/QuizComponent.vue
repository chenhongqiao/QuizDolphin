<template>
  <v-row>
    <v-col>
      <v-container>
        <h2>Problem #{{ currentQuestion + 1 }}</h2>
        <div>Points: {{ quizData[currentQuestion].points }}</div>
      </v-container>
      <v-container>
        <h3>Context:</h3>
        <div class="text-center">
          {{ quizData[currentQuestion].context }}
        </div>
      </v-container>
      <v-container>
        <h3 v-if="quizData[currentQuestion].type==='single choice'">
          Options:
        </h3>
        <v-radio-group
          v-if="quizData[currentQuestion].type==='single choice'"
          v-model="quizAttempts[currentQuestion]"
          row
        >
          <v-radio
            v-for="option in quizData[currentQuestion].options"
            :key="option"
            :label="option"
            :value="option"
          />
        </v-radio-group>
        <v-text-field
          v-if="quizData[currentQuestion].type==='short response'"
          v-model="quizAttempts[currentQuestion]"
          name="Your response"
        />
        <div v-if="quizData[currentQuestion].type==='multiple choice'">
          <v-checkbox
            v-for="option in quizData[currentQuestion].options"
            :key="option"
            v-model="quizAttempts[currentQuestion]"
            :label="option"
            :value="option"
          />
        </div>
      </v-container>
      <v-container>
        <div
          v-if="currentQuestion < quizData.length - 1"
          class="text-right"
        >
          <v-btn
            class="text-right"
            @click="nextQuestion"
          >
            Next
          </v-btn>
        </div>
        <div
          v-if="currentQuestion === quizData.length - 1"
          class="text-right"
        >
          <v-btn
            class="text-right"
            @click="submitQuiz"
          >
            Submit!
          </v-btn>
        </div>
        <v-container />
      </v-container>
    </v-col>
  </v-row>
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
