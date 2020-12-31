<template>
  <div>
    <v-container>
      <h2> Quiz result </h2>
      <div>
        You got {{ quizResult.score.toFixed(2) }} out of {{ totalPoints }}
      </div>
      <v-container
        v-for="currentQuestion in quizResult.questions.length"
        :key="'d-'+currentQuestion"
      >
        <v-card>
          <v-container>
            <h2>Problem #{{ currentQuestion }}</h2>
            <div>
              Score: {{ quizResult.questionsResult[currentQuestion-1].score.toFixed(2) }}
              out of {{ quizResult.questionsResult[currentQuestion-1].points }}
            </div>
            <div>Type: {{ quizResult.questions[currentQuestion-1].type }}</div>
          </v-container>
          <v-divider />
          <v-container v-if="quizResult.questions[currentQuestion-1].type!=='fill in the blanks'">
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
            <h3
              v-if="quizResult.questions[currentQuestion-1].type==='matching'"
            >
              Matching:
            </h3>
            <h3
              v-if="quizResult.questions[currentQuestion-1].type==='fill in the blanks'"
            >
              Fill in the Blanks:
            </h3>
            <div v-if="quizResult.questions[currentQuestion-1].type==='single choice'">
              <v-row wrap>
                <v-col
                  v-for="option in quizResult.questions[currentQuestion-1].options"
                  :key="'ds-'+option"
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
                      :on-icon="'mdi-close-box'"
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

            <div v-if="quizResult.questions[currentQuestion-1].type==='short response'">
              <div
                v-if="quizResult.questionsResult[currentQuestion-1].userAnswer
                  ===quizResult.questionsResult[currentQuestion-1].correctAnswer"
              >
                <v-text-field
                  :value="quizResult.questionsResult[currentQuestion-1].userAnswer"
                  background-color="#66bb6a"
                  readonly
                />
              </div>
              <div v-else>
                <v-text-field
                  :value="quizResult.questionsResult[currentQuestion-1].userAnswer"
                  background-color="#ef5350"
                  readonly
                />
                <div>
                  Correct Answer: {{ quizResult.questionsResult[currentQuestion-1].correctAnswer }}
                </div>
              </div>
            </div>

            <div v-if="quizResult.questions[currentQuestion-1].type==='multiple choice'">
              <v-row wrap>
                <v-col
                  v-for="option in quizResult.questions[currentQuestion-1].options"
                  :key="'dm-'+option"
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
                      :on-icon="'mdi-close-box'"
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

            <div v-if="quizResult.questions[currentQuestion-1].type==='matching'">
              <v-row
                v-for="(left,index) in quizResult.questions[currentQuestion-1].leftcol"
                :key="'dma-'+quizResult.questions[currentQuestion-1]+left"
              >
                <v-col md="8">
                  <v-container>
                    {{ left }}
                  </v-container>
                </v-col>
                <v-col
                  v-if="quizResult.questionsResult[currentQuestion-1].userAnswer[index]===
                    quizResult.questionsResult[currentQuestion-1].correctAnswer[index]"
                  md="4"
                >
                  <v-select
                    :value="quizResult.questionsResult[currentQuestion-1].userAnswer[index]"
                    :items="quizResult.questions[currentQuestion-1].rightcol"
                    background-color="#66bb6a"
                    readonly
                  />
                </v-col>
                <v-col
                  v-else
                  md="4"
                >
                  <v-select
                    :value="quizResult.questionsResult[currentQuestion-1].userAnswer[index]"
                    :items="quizResult.questions[currentQuestion-1].rightcol"
                    background-color="#ef5350"
                    dense
                    readonly
                  />
                  <div>
                    Correct Answer:
                    {{ quizResult.questionsResult[currentQuestion-1].correctAnswer[index] }}
                  </div>
                </v-col>
              </v-row>
            </div>

            <div v-if="quizResult.questions[currentQuestion-1].type==='fill in the blanks'">
              <span

                v-for="(context, index) in quizResult.questions[currentQuestion-1].context"
                :key="'qz'+quizResult.questions[currentQuestion-1].uuid+context"
              >
                <span
                  v-if="quizResult.questionsResult[currentQuestion-1].userAnswer[index]===
                    quizResult.questionsResult[currentQuestion-1].correctAnswer[index]"
                >
                  {{ context }}
                  <v-select
                    v-if="quizResult.questions[currentQuestion-1].options[index]!==undefined"
                    :value="quizResult.questionsResult[currentQuestion-1].userAnswer[index]"
                    readonly
                    class="d-inline-flex"
                    background-color="#66bb6a"
                    :items="quizResult.questions[currentQuestion-1].options[index]"
                    dense
                  />
                </span>
                <span
                  v-else
                >
                  {{ context }}
                  <v-select
                    v-if="quizResult.questions[currentQuestion-1].options[index]!==undefined"
                    :value="quizResult.questionsResult[currentQuestion-1].userAnswer[index]"
                    readonly
                    class="d-inline-flex"
                    background-color="#ef5350"
                    :items="quizResult.questions[currentQuestion-1].options[index]"
                    dense
                  />
                  <span style="color: green"><em>{{ quizResult.questionsResult[currentQuestion-1]
                    .correctAnswer[index] }}</em></span>
                </span>
              </span>
            </div>
          </v-container>
        </v-card>
      </v-container>
    </v-container>
    <v-container>
      <v-row>
        <v-spacer />
        <v-col md="2">
          <v-btn @click="resetQuiz">
            Reset Quiz
          </v-btn>
        </v-col>
      </v-row>
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
    generateReport() {
      window.scrollTo(0, 0);
      this.$refs.html2Pdf.generatePdf();
    },
    resetQuiz() {
      window.location.reload();
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
