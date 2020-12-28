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
        <v-radio-group v-model="answer[currentQuestion]" row>
          <v-radio
            v-for="option in quizData[currentQuestion].options"
            :key="option"
            :label="option"
            :value="option"
          ></v-radio>
        </v-radio-group>
      </div>
      <div class="text-right">
        <v-btn class="text-right" @click="currentQuestion++">Next</v-btn>
      </div>
    </v-col>
  </v-row>
</template>

<script>
export default {
  name: "QuizComponent",
  props: ["quizData"],
  data: () => ({
    currentQuestion: 0,
    answer: [],
  }),
};
</script>
