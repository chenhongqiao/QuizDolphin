<template>
  <div>
    <v-container>
      <h2> Quiz result </h2>
      <div>
        You got {{ quizResult.score }} out of {{ totalPoints }}
      </div>
      <v-container
        v-for="currentQuestion in quizResult.questions.length"
        :key="currentQuestion"
      >
        <v-card
          color="true ? #e8f5e9 : #ffebee"
        >
          <v-container>
            <h2>Problem #{{ currentQuestion }}</h2>
            <div>
              Score: {{ quizResult.questionsResult[currentQuestion-1].score }}
              out of {{ quizResult.questionsResult[currentQuestion-1].points }}
            </div>
            <div>Type: {{ quizResult.questions[currentQuestion-1].type }}</div>
          </v-container>
          <v-container>
            <h3>Context:</h3>
            <div class="text-center">
              {{ quizResult.questions[currentQuestion-1].context }}
            </div>
          </v-container>
          <v-container>
            <h3
              v-if="quizResult.questions[currentQuestion-1].type==='single choice'||
                quizResult.questions[currentQuestion-1].type==='multiple choice'"
            >
              Options:
            </h3>
            <h3
              v-if="quizResult.questions[currentQuestion-1].type==='short response'"
            >
              Your Response:
            </h3>
            <div v-if="quizResult.questions[currentQuestion-1].type==='single choice'">
              <v-row wrap>
                <v-col
                  v-for="option in quizResult.questions[currentQuestion-1].options"
                  :key="option"
                  md="3"
                >
                  <div
                    v-if="isChosen(option ,quizResult.questionsResult[currentQuestion-1].
                      userAnswer)"
                  >
                    <v-checkbox
                      v-if="isCorrect(option, quizResult
                        .questionsResult[currentQuestion-1].correctAnswer)"
                      color="green"
                      :input-value="true"
                      readonly
                    >
                      <template #label>
                        <span style="color:green">
                          {{ option }}
                        </span>
                      </template>
                    </v-checkbox>
                    <v-checkbox
                      v-else
                      color="red"
                      :label="option"
                      :input-value="true"
                      readonly
                    />
                  </div>
                  <v-checkbox
                    v-else-if="isCorrect(option, quizResult
                      .questionsResult[currentQuestion-1].correctAnswer)"
                    color="green"
                    readonly
                  >
                    <template #label>
                      <span style="color:green">
                        {{ option }}
                      </span>
                    </template>
                  </v-checkbox>
                  <v-checkbox
                    v-else
                    :label="option"
                    readonly
                  />
                </v-col>
                <v-row wrap />
              </v-row>
            </div>
            <v-text-field
              v-if="quizResult.questions[currentQuestion-1].type==='short response'"
              :value="quizResult.questionsResult[currentQuestion-1].correctAnswer"
              name="Your response"
              disabled
            />
            <div v-if="quizResult.questions[currentQuestion-1].type==='multiple choice'">
              <v-row wrap>
                <v-col
                  v-for="option in quizResult.questions[currentQuestion-1].options"
                  :key="option"
                  md="3"
                >
                  <div
                    v-if="isChosen(option ,quizResult.questionsResult[currentQuestion-1].
                      userAnswer)"
                  >
                    <v-checkbox
                      v-if="isCorrect(option, quizResult
                        .questionsResult[currentQuestion-1].correctAnswer)"
                      color="green"
                      :input-value="true"
                      readonly
                    >
                      <template #label>
                        <span style="color:green">
                          {{ option }}
                        </span>
                      </template>
                    </v-checkbox>
                    <v-checkbox
                      v-else
                      color="red"
                      :label="option"
                      :input-value="true"
                      readonly
                    />
                  </div>
                  <v-checkbox
                    v-else-if="isCorrect(option, quizResult
                      .questionsResult[currentQuestion-1].correctAnswer)"
                    color="green"
                    readonly
                  >
                    <template #label>
                      <span style="color:green">
                        {{ option }}
                      </span>
                    </template>
                  </v-checkbox>
                  <v-checkbox
                    v-else
                    :label="option"
                    readonly
                  />
                </v-col>
              </v-row>
            </div>
          </v-container>
        </v-card>
      </v-container>
    </v-container>
  </div>
</template>

<script>
export default {
  name: 'ResultComponent',
  props: {
    quizResult: { type: Object, default: null },
    totalPoints: { type: Number, default: 0 },
  },
  data: () => ({

  }),
  methods: {
    isChosen(option, userAnswer) {
      if (Array.isArray(userAnswer)) {
        const answerSet = new Set(userAnswer);
        return answerSet.has(option);
      }
      return userAnswer === option;
    },
    isCorrect(userAnswer, correctAnswer) {
      if (Array.isArray(correctAnswer)) {
        const answerSet = new Set(correctAnswer);
        return answerSet.has(userAnswer);
      }
      return userAnswer === correctAnswer;
    },
  },
};
</script>
