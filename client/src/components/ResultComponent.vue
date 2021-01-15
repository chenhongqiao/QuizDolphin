<template>
  <div>
    <v-container>
      <h2> Quiz result </h2>
      <div>
        You got {{ quizResult.score.toFixed(2) }} out of {{ quizResult.totalPoints }}
      </div>
      <v-container
        v-for="currentQuestion in quizResult.questions.length"
        :key="'d-'+currentQuestion"
      >
        <v-card>
          <v-container>
            <h2>Problem #{{ currentQuestion }}</h2>
            <div>
              Score: {{ quizResult.results[currentQuestion-1].score.toFixed(2) }}
              out of {{ quizResult.results[currentQuestion-1].points }}
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
                    v-if="isChosen(option ,quizResult.results[currentQuestion-1].
                      response)"
                  >
                    <v-checkbox
                      v-if="isCorrect(option, quizResult
                        .results[currentQuestion-1].answer)"
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
                      .results[currentQuestion-1].answer)"
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
                v-if="quizResult.results[currentQuestion-1].response
                  ===quizResult.results[currentQuestion-1].answer"
              >
                <v-text-field
                  :value="quizResult.results[currentQuestion-1].response"
                  background-color="#66bb6a"
                  disabled
                />
              </div>
              <div v-else>
                <v-text-field
                  :value="quizResult.results[currentQuestion-1].response"
                  background-color="#ef5350"
                  disabled
                />
                <div>
                  Correct Answer: {{ quizResult.results[currentQuestion-1].answer }}
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
                    v-if="isChosen(option ,quizResult.results[currentQuestion-1].
                      response)"
                  >
                    <v-checkbox
                      v-if="isCorrect(option, quizResult
                        .results[currentQuestion-1].answer)"
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
                      .results[currentQuestion-1].answer)"
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
                  v-if="quizResult.results[currentQuestion-1].response[index]===
                    quizResult.results[currentQuestion-1].answer[index]"
                  md="4"
                >
                  <v-select
                    :value="quizResult.results[currentQuestion-1].response[index]"
                    :items="quizResult.questions[currentQuestion-1].rightcol"
                    background-color="#66bb6a"
                    disabled
                  />
                </v-col>
                <v-col
                  v-else
                  md="4"
                >
                  <v-select
                    :value="quizResult.results[currentQuestion-1].response[index]"
                    :items="quizResult.questions[currentQuestion-1].rightcol"
                    background-color="#ef5350"
                    dense
                    disabled
                  />
                  <div>
                    Correct Answer:
                    {{ quizResult.results[currentQuestion-1].answer[index] }}
                  </div>
                </v-col>
              </v-row>
            </div>

            <div v-if="quizResult.questions[currentQuestion-1].type==='fill in the blanks'">
              <span

                v-for="(context, index) in quizResult.questions[currentQuestion-1].context"
                :key="'qz'+quizResult.questions[currentQuestion-1].questionId+context"
              >
                <span
                  v-if="quizResult.results[currentQuestion-1].response[index]===
                    quizResult.results[currentQuestion-1].answer[index]"
                >
                  {{ context }}
                  <v-select
                    v-if="quizResult.questions[currentQuestion-1].options[index]"
                    :value="quizResult.results[currentQuestion-1].response[index]"
                    disabled
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
                    v-if="quizResult.questions[currentQuestion-1].options[index]"
                    :value="quizResult.results[currentQuestion-1].response[index]"
                    disabled
                    class="d-inline-flex"
                    background-color="#ef5350"
                    :items="quizResult.questions[currentQuestion-1].options[index]"
                    dense
                  />
                  <span style="color: green"><em>{{ quizResult.results[currentQuestion-1]
                    .answer[index] }}</em></span>
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
        <v-btn
          class="mb-4"
          @click="generateReport"
        >
          Download Report
        </v-btn>
        <v-btn
          v-if="!viewOnly"
          class="mb-4"
          @click="resetQuiz"
        >
          Back to info page
        </v-btn>
      </v-row>
    </v-container>
  </div>
</template>

<script>
import PDFReport from '../PDFReport';

export default {
  name: 'ResultComponent',
  props: {
    quizResult: { type: Object, default: null },
    viewOnly: { type: Boolean, default: true },
  },
  data: () => ({

  }),
  methods: {
    isChosen(option, response) {
      if (Array.isArray(response)) {
        const answerSet = new Set(response);
        return answerSet.has(option);
      }
      return response === option;
    },
    isCorrect(response, answer) {
      if (Array.isArray(answer)) {
        const answerSet = new Set(answer);
        return answerSet.has(response);
      }
      return response === answer;
    },
    resetQuiz() {
      window.location.reload();
    },
    generateReport() {
      PDFReport.newReport(this.quizResult);
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
