<template>
  <div>
    <div v-if="resultLoaded">
      <v-container>
        <v-row wrap>
          <v-col>
            <div
              class="text-h4"
              :style="'white-space: nowrap;'"
            >
              {{ quizResult.quizName }} - Result
            </div>
            <div>
              Attempt ID: {{ quizResult.attemptId }}
            </div>
          </v-col>
          <v-spacer />
          <div class="text-h5 mt-6">
            {{ quizResult.score.toFixed(2) }} / {{ quizResult.totalPoints.toFixed(2) }}
          </div>
          <v-progress-circular
            class="ma-5"
            color="green"
            :size="40"
            :width="5"
            :value="(quizResult.score/quizResult.totalPoints)*100"
          />
        </v-row>
      </v-container>
      <v-container>
        <div
          v-for="currentQuestion in quizResult.questions.length"
          :key="'d-'+currentQuestion"
          class="my-2"
        >
          <v-card>
            <v-container>
              <div class="text-h5 font-weight-medium">
                Problem #{{ currentQuestion }}
              </div>
              <div class="text-subtitle-2 font-weight-regular">
                Score: {{ quizResult.results[currentQuestion-1].score.toFixed(2) }}
                out of {{ quizResult.results[currentQuestion-1].points }}
              </div>
              <div class="text-subtitle-2 font-weight-regular">
                Type: {{ quizResult.questions[currentQuestion-1].type }}
              </div>
            </v-container>
            <v-divider />
            <v-container v-if="quizResult.questions[currentQuestion-1].type!=='fill in the blanks'">
              <div class="text-body-1 font-weight-medium text-center ma-4">
                {{ quizResult.questions[currentQuestion-1].context }}
              </div>
            </v-container>
            <v-container>
              <div v-if="quizResult.questions[currentQuestion-1].type==='single choice'">
                <v-row wrap>
                  <v-col
                    v-for="option in quizResult.questions[currentQuestion-1].options"
                    :key="'ds-'+option"
                    md="3"
                    cols="6"
                  >
                    <v-checkbox
                      :color="isCorrect(option, quizResult
                        .results[currentQuestion-1].answer)?'green':'red'"
                      :on-icon="isCorrect(option, quizResult
                        .results[currentQuestion-1].answer)?'mdi-checkbox-marked':'mdi-close-box'"
                      :input-value="isChosen(option ,quizResult.results[currentQuestion-1].
                        response)"
                      readonly
                      class="red-text"
                    >
                      <template #label>
                        <span
                          v-if="isCorrect(option, quizResult
                            .results[currentQuestion-1].answer)"
                          style="color:green"
                        >
                          {{ option }}
                        </span>
                        <span
                          v-else
                        >
                          {{ option }}
                        </span>
                      </template>
                    </v-checkbox>
                  </v-col>
                  <v-row wrap />
                </v-row>
              </div>

              <div v-if="quizResult.questions[currentQuestion-1].type==='short response'">
                <v-text-field
                  :value="quizResult.results[currentQuestion-1].response"
                  :background-color="quizResult.results[currentQuestion-1].response
                    ===quizResult.results[currentQuestion-1].answer?'green':'red'"
                  disabled
                />
                <div
                  v-if="quizResult.results[currentQuestion-1].response
                    !==quizResult.results[currentQuestion-1].answer"
                >
                  Correct Answer: {{ quizResult.results[currentQuestion-1].answer }}
                </div>
              </div>

              <div v-if="quizResult.questions[currentQuestion-1].type==='multiple choice'">
                <v-row wrap>
                  <v-col
                    v-for="option in quizResult.questions[currentQuestion-1].options"
                    :key="'dm-'+option"
                    md="3"
                    cols="6"
                  >
                    <v-checkbox
                      :color="isCorrect(option, quizResult
                        .results[currentQuestion-1].answer)?'green':'red'"
                      :on-icon="isCorrect(option, quizResult
                        .results[currentQuestion-1].answer)?'mdi-checkbox-marked':'mdi-close-box'"
                      :input-value="isChosen(option ,quizResult.results[currentQuestion-1].
                        response)"
                      readonly
                      class="red-text"
                    >
                      <template #label>
                        <span
                          v-if="isCorrect(option, quizResult
                            .results[currentQuestion-1].answer)"
                          style="color:green"
                        >
                          {{ option }}
                        </span>
                        <span
                          v-else
                        >
                          {{ option }}
                        </span>
                      </template>
                    </v-checkbox>
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

                    md="4"
                  >
                    <v-select
                      :value="quizResult.results[currentQuestion-1].response[index]"
                      :items="quizResult.questions[currentQuestion-1].rightcol"
                      :background-color="quizResult.results[currentQuestion-1].response[index]===
                        quizResult.results[currentQuestion-1].answer[index]?'green':'red'"
                      disabled
                    />
                    <div
                      v-if="quizResult.results[currentQuestion-1].response[index]!==
                        quizResult.results[currentQuestion-1].answer[index]"
                    >
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
                  {{ context }}
                  <v-select
                    v-if="quizResult.questions[currentQuestion-1].options[index]"
                    :value="quizResult.results[currentQuestion-1].response[index]"
                    disabled
                    class="d-inline-flex"
                    :background-color="quizResult.results[currentQuestion-1].response[index]===
                      quizResult.results[currentQuestion-1].answer[index]?'green':'red'"
                    :items="quizResult.questions[currentQuestion-1].options[index]"
                    dense
                  />
                  <span
                    v-if="quizResult.results[currentQuestion-1].response[index]!==
                      quizResult.results[currentQuestion-1].answer[index]"
                    style="color: green"
                  ><em>{{ quizResult.results[currentQuestion-1]
                    .answer[index] }}</em></span>
                </span>
              </div>
            </v-container>
          </v-card>
        </div>
      </v-container>
      <v-container>
        <v-row>
          <v-spacer />
          <v-btn
            class="ma-2 text-right"
            @click="generateReport"
          >
            Download Report
          </v-btn>
        </v-row>
      </v-container>
    </div>
    <v-progress-linear
      v-else
      indeterminate
    />
  </div>
</template>

<script>
import PDFReport from '../services/PDFReport';
import ResultService from '../services/ResultService';

export default {
  name: 'ResultView',
  data: () => ({
    attemptId: undefined,
    quizResult: {},
    resultLoaded: false,
  }),
  async mounted() {
    this.attemptId = this.$route.params.id;
    await this.loadResult();
    this.resultLoaded = true;
  },
  methods: {
    async loadResult() {
      try {
        this.quizResult = await ResultService.getResult(this.attemptId);
      } catch (err) {
        if (err.response.status === 401) {
          this.$store.commit('logout');
          this.$router.push({ path: '/login', query: { redirect: `/result/${this.attemptId}` } });
        } else if (err.response.status === 404) {
        // TODO: 404 Page
        } else {
          throw err;
        }
      }
    },
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
    generateReport() {
      PDFReport.newReport(this.quizResult);
    },
  },
};
</script>
