<template>
  <div>
    <v-container>
      <v-card>
        <v-container>
          <h2>Problem #{{ currentQuestion }}</h2>
          <div>Points: {{ quizData[currentQuestion-1].points }}</div>
          <div>Type: {{ quizData[currentQuestion-1].type }}</div>
        </v-container>
        <v-container>
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
          <v-text-field
            v-if="quizData[currentQuestion-1].type==='short response'"
            v-model="quizAttempts[currentQuestion-1]"
            name="Your response"
          />
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
      this.$emit('update:quizAnswers', this.quizAttempts);
      this.$emit('quizDone');
    },
  },
};
</script>
