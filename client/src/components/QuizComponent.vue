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
        <h3>Options:</h3>
        <v-radio-group
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
  props: { quizData: Set, quizAnswers: Set },
  data: () => ({
    currentQuestion: 0,
    quizAttempts: [],
  }),
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
