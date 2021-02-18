<template>
  <div>
    <div v-if="resultLoaded&&!notFound">
      <v-container>
        <v-row wrap>
          <v-col>
            <div
              class="text-h4"
              :style="'white-space: nowrap;'"
            >
              {{ quizResult.quizName }} - Result
            </div>
            <div class="text--secondary">
              Attempt ID: {{ quizResult.attemptId }}
            </div>
          </v-col>
          <v-spacer />
          <div class="text-h5 mt-6">
            {{ quizResult.score.toFixed(2) }} / {{ quizResult.totalPoints.toFixed(2) }}
          </div>
          <div class="text-h5 mt-6 ml-4">
            <span v-if="quizResult.score/quizResult.totalPoints>=0.9"> A </span>
            <span v-else-if="quizResult.score/quizResult.totalPoints>=0.8"> B </span>
            <span v-else-if="quizResult.score/quizResult.totalPoints>=0.7"> C </span>
            <span v-else-if="quizResult.score/quizResult.totalPoints>=0.6"> D </span>
            <span v-else> F </span>
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
                Question #{{ currentQuestion }}
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
                    >
                      <!-- eslint-disable-next-line vue/valid-v-slot -->
                      <template #selection="{ item }">
                        <span class="text--secondary">
                          {{ item }}
                        </span>
                      </template>
                    </v-select>
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

              <div
                v-if="quizResult.questions[currentQuestion-1].type==='fill in the blanks'"
                class="ma-4"
              >
                <v-row>
                  <div
                    v-for="(context, index) in quizResult.questions[currentQuestion-1].context"
                    :key="'qz'+quizResult.questions[currentQuestion-1].questionId+context"
                  >
                    <v-col>
                      <v-row>
                        <v-col
                          cols="auto"
                          class="px-0"
                        >
                          <span>
                            {{ context }}
                          </span>
                        </v-col>
                        <v-col
                          v-if="quizResult.questions[currentQuestion-1].options[index]"
                          cols="auto"
                          class="px-1 pt-1"
                        >
                          <v-select
                            :style="'width: min-content;'"
                            :value="quizResult.results[currentQuestion-1].response[index]"
                            disabled
                            :items="quizResult.questions[currentQuestion-1].options[index]"
                            :background-color="quizResult.results[currentQuestion-1].response[index]
                              ===quizResult.results[currentQuestion-1].answer[index]?'green':'red'"
                            dense
                          >
                            <!-- eslint-disable-next-line vue/valid-v-slot -->
                            <template #selection="{ item }">
                              <span class="text--secondary">
                                {{ item }}
                              </span>
                            </template>
                          </v-select>
                        </v-col>
                        <v-col
                          v-if="quizResult.results[currentQuestion-1].response[index]!==
                            quizResult.results[currentQuestion-1].answer[index]"
                          cols="auto"
                          class="px-0"
                        >
                          <span style="color:green">
                            {{ quizResult.results[currentQuestion-1].answer[index] }}
                          </span>
                        </v-col>
                      </v-row>
                    </v-col>
                  </div>
                </v-row>
              </div>
            </v-container>
          </v-card>
        </div>
      </v-container>
      <v-container>
        <v-row class="px-2 mb-2">
          <v-spacer />
          <v-btn
            class="ma-1 text-right"
            @click="toQuizInfo"
          >
            Back To Info
          </v-btn>
          <v-btn
            class="ma-1 text-right"
            @click="generateReport"
          >
            Download Report
          </v-btn>
        </v-row>
      </v-container>
    </div>
    <v-progress-linear
      v-else-if="!notFound"
      indeterminate
    />
    <v-alert
      v-if="notFound"
      type="error"
    >
      <v-row align="center">
        <v-col class="grow">
          Can not find this record in the database,
          this might because of incorrect url.
        </v-col>
        <v-col class="shrink">
          <v-btn @click="$router.push('/home')">
            Homepage
          </v-btn>
        </v-col>
      </v-row>
    </v-alert>
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
    notFound: false,
  }),
  async mounted() {
    this.attemptId = this.$route.params.id;
    await this.loadResult();
    if (!this.$store.state.navigation.navigation[0]) {
      this.$store.commit('navigation/replace', {
        index: 0,
        info: {
          text: 'Home',
          disabled: false,
          to: '/home',
        },
      });
    }
    if (!this.$store.state.navigation.navigation[1]) {
      this.$store.commit('navigation/replace', {
        index: 1,
        info: {
          text: this.quizResult.quizName,
          disabled: false,
          to: `/quiz/${this.quizResult.quizId}`,
        },
      });
    }
    this.$store.commit('navigation/replace', {
      index: 2,
      info: {
        text: 'Result',
        disabled: false,
        to: `/result/${this.attemptId}`,
      },
    });
    this.resultLoaded = true;
  },
  methods: {
    async loadResult() {
      try {
        this.quizResult = await ResultService.getResult(this.attemptId);
      } catch (err) {
        if (err.response) {
          if (err.response.status === 401) {
            this.$store.commit('user/logout');
            this.$router.replace({ name: 'Login', query: { redirect: this.$route.fullPath } });
          } else if (err.response.status === 404) {
            this.notFound = true;
          } else {
            throw err;
          }
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
    toQuizInfo() {
      this.$router.push({ name: 'QuizInfo', params: { id: this.quizResult.quizId } });
    },
  },
};
</script>
<style>
.v-text-field .v-select__slot .v-select__selection--comma { min-width: min-content}
</style>
