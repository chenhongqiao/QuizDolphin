<template>
  <v-row>
    <v-col>
      <div>
        <h2>Problem #{{ currentQuestion + 1 }}</h2>
        <div>Points: {{ quizData[currentQuestion].points }}</div>
      </div>
      <div>
        <h3>Context:</h3>
        <div class="text-center">
          {{ quizData[currentQuestion].context }}
        </div>
      </div>
      <div>
        <h3>Options:</h3>
        <v-radio-group v-model="quizAnswers[currentQuestion]" row>
          <v-radio
            v-for="option in quizData[currentQuestion].options"
            :key="option"
            :label="option"
            :value="option"
          ></v-radio>
        </v-radio-group>
      </div>
      <div class="text-right" v-if="currentQuestion < quizData.length - 1">
        <v-btn class="text-right" @click="nextQuestion">Next</v-btn>
      </div>
      <div class="text-right" v-if="currentQuestion === quizData.length - 1">
        <v-btn class="text-right" @click="submitQuiz">Submit!</v-btn>
      </div>
    </v-col>
  </v-row>
</template>

<script>
export default {
  name: 'QuizComponent',
  props: ['quizData', 'quizAnswers'],
  data: () => ({
    currentQuestion: 0,
  }),
  methods: {
    nextQuestion() {
      this.currentQuestion += 1;
      this.$emit('update:quizAnswers', this.quizAnswers);
    },
    submitQuiz() {
      this.$emit('update:quizAnswers', this.quizAnswers);
      this.$emit('quizDone');
    },
  },
};
</script>
