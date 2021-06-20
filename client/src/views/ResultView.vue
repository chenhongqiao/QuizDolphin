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
              {{ rawQuizResult.quizName }} - Result
            </div>
            <div
              v-if="rawQuizResult.preview"
              class="text--primary"
            >
              Admin Preview
            </div>
            <div class="text--secondary">
              {{ rawQuizResult.userName }} &lt;{{ rawQuizResult.email }}&gt;
            </div>
            <div class="text--secondary">
              Attempt ID: {{ rawQuizResult.attemptId }}
            </div>
          </v-col>
          <v-spacer />
          <div class="text-h5 mt-4 ml-4">
            {{ rawQuizResult.score.toFixed(2) }} / {{ rawQuizResult.totalPoints.toFixed(2) }}
          </div>
          <div class="text-h5 mt-4 ml-4">
            <span v-if="rawQuizResult.score/rawQuizResult.totalPoints>=0.9"> A </span>
            <span v-else-if="rawQuizResult.score/rawQuizResult.totalPoints>=0.8"> B </span>
            <span v-else-if="rawQuizResult.score/rawQuizResult.totalPoints>=0.7"> C </span>
            <span v-else-if="rawQuizResult.score/rawQuizResult.totalPoints>=0.6"> D </span>
            <span v-else> F </span>
          </div>
          <v-progress-circular
            class="mx-4 mt-3"
            color="green"
            :size="40"
            :width="5"
            :value="(rawQuizResult.score/rawQuizResult.totalPoints)*100"
          />
        </v-row>
      </v-container>
      <v-container>
        <v-row>
          <div class="mt-5 ml-4">
            Show
          </div>
          <v-checkbox
            v-model="showCorrect"
            class="mx-4"
            label="Correct questions"
          />
          <v-checkbox
            v-model="showIncorrect"
            label="Incorrect questions"
          />
          <v-responsive
            max-width="700"
            class="mx-4 mt-1"
          >
            <v-select
              v-model="showTypes"
              chips
              hint="select question types to show"
              dense
              multiple
              :items="['single choice', 'multiple choice',
                       'matching','short response','fill in the blanks']"
            />
          </v-responsive>
        </v-row>
        <v-row>
          <div class="mt-5 ml-4">
            Sort
          </div>
          <v-responsive
            max-width="100"
            class="mx-4 mt-3"
          >
            <v-select
              v-model="sortBy"
              dense
              :items="['index','points','score']"
            />
          </v-responsive>
          <v-checkbox
            v-model="reverse"
            class="mx-4"
            label="Reverse"
          />
        </v-row>
      </v-container>
      <v-container>
        <div
          v-for="currentQuestion in quizQuestions.length"
          :key="'d-'+currentQuestion"
          class="my-2"
        >
          <v-card>
            <v-container>
              <v-row>
                <v-col>
                  <div
                    class="text-h5 font-weight-medium"
                    :style="'white-space: nowrap;'"
                  >
                    Question #{{ quizQuestions[currentQuestion-1].index }}
                  </div>
                  <div class="text-subtitle-2 font-weight-regular">
                    {{ quizQuestions[currentQuestion-1].type.split(" ").map((word) => {
                      if(word==='in' || word ==='the'){
                        return word
                      } else {
                        return word[0].toUpperCase() + word.substring(1)
                      }
                    }).join(" ") }}
                  </div>
                </v-col>
                <v-spacer />
                <div class="text-h6 font-weight-regular py-3 px-4">
                  {{ quizQuestions[currentQuestion-1].score.toFixed(2) }} /
                  {{ quizQuestions[currentQuestion-1].points.toFixed(2) }}
                </div>
              </v-row>
            </v-container>
            <v-divider />
            <v-container v-if="quizQuestions[currentQuestion-1].type!=='fill in the blanks'">
              <div class="text-body-1 font-weight-medium text-center ma-4">
                {{ quizQuestions[currentQuestion-1].context }}
              </div>
            </v-container>
            <v-container>
              <div v-if="quizQuestions[currentQuestion-1].type==='single choice'">
                <v-row wrap>
                  <v-col
                    v-for="option in quizQuestions[currentQuestion-1].options"
                    :key="'ds-'+option"
                    md="3"
                    cols="6"
                  >
                    <v-checkbox
                      :color="isCorrect(option, rawQuizResult
                        .questions[currentQuestion-1].answer)?'green':'red'"
                      :on-icon="isCorrect(option, rawQuizResult
                        .questions[currentQuestion-1].answer)?'mdi-checkbox-marked':'mdi-close-box'"
                      :input-value="isChosen(option ,quizQuestions[currentQuestion-1].
                        response)"
                      readonly
                    >
                      <template #label>
                        <span
                          v-if="isCorrect(option, rawQuizResult
                            .questions[currentQuestion-1].answer)"
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

              <div v-if="quizQuestions[currentQuestion-1].type==='short response'">
                <v-text-field
                  :value="quizQuestions[currentQuestion-1].response"
                  :background-color="quizQuestions[currentQuestion-1].response.trim()
                    .toLowerCase()
                    ===quizQuestions[currentQuestion-1].answer.trim().toLowerCase()
                    ?'green':'red'"
                  disabled
                />
                <div
                  v-if="quizQuestions[currentQuestion-1].response.trim().toLowerCase()
                    !==quizQuestions[currentQuestion-1].answer.trim().toLowerCase()"
                >
                  Correct Answer: {{ quizQuestions[currentQuestion-1].answer }}
                </div>
              </div>

              <div v-if="quizQuestions[currentQuestion-1].type==='multiple choice'">
                <v-row wrap>
                  <v-col
                    v-for="option in quizQuestions[currentQuestion-1].options"
                    :key="'dm-'+option"
                    md="3"
                    cols="6"
                  >
                    <v-checkbox
                      :color="isCorrect(option, rawQuizResult
                        .questions[currentQuestion-1].answer)?'green':'red'"
                      :on-icon="isCorrect(option, rawQuizResult
                        .questions[currentQuestion-1].answer)?'mdi-checkbox-marked':'mdi-close-box'"
                      :input-value="isChosen(option ,quizQuestions[currentQuestion-1].
                        response)"
                      readonly
                    >
                      <template #label>
                        <span
                          v-if="isCorrect(option, rawQuizResult
                            .questions[currentQuestion-1].answer)"
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

              <div v-if="quizQuestions[currentQuestion-1].type==='matching'">
                <v-row
                  v-for="(left,index) in quizQuestions[currentQuestion-1].leftcol"
                  :key="'dma-'+quizQuestions[currentQuestion-1]+left"
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
                      :value="quizQuestions[currentQuestion-1].response[index]"
                      :items="quizQuestions[currentQuestion-1].rightcol"
                      :background-color="quizQuestions[currentQuestion-1].response[index]===
                        quizQuestions[currentQuestion-1].answer[index]?'green':'red'"
                      disabled
                    />
                    <div
                      v-if="quizQuestions[currentQuestion-1].response[index]!==
                        quizQuestions[currentQuestion-1].answer[index]"
                    >
                      Correct Answer:
                      {{ quizQuestions[currentQuestion-1].answer[index] }}
                    </div>
                  </v-col>
                </v-row>
              </div>

              <div
                v-if="quizQuestions[currentQuestion-1].type==='fill in the blanks'"
                class="ma-4"
              >
                <v-row>
                  <div
                    v-for="(context, index) in quizQuestions[currentQuestion-1].context"
                    :key="'qz'+quizQuestions[currentQuestion-1].questionId+context"
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
                          v-if="quizQuestions[currentQuestion-1].options[index]"
                          cols="auto"
                          class="px-1 pt-1"
                        >
                          <v-select
                            :style="'width: min-content;'"
                            :value="quizQuestions[currentQuestion-1].response[index]"
                            disabled
                            :items="quizQuestions[currentQuestion-1].options[index]"
                            :background-color="quizQuestions[currentQuestion-1].response[index]
                              ===quizQuestions[currentQuestion-1].answer[index]?'green':'red'"
                            dense
                          />
                        </v-col>
                        <v-col
                          v-if="quizQuestions[currentQuestion-1].response[index]!==
                            quizQuestions[currentQuestion-1].answer[index]"
                          cols="auto"
                          class="px-0"
                        >
                          <span style="color:green">
                            {{ quizQuestions[currentQuestion-1].answer[index] }}
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
    rawQuizResult: {},
    mergedQuizResult: {},
    resultLoaded: false,
    notFound: false,
    showCorrect: true,
    showIncorrect: true,
    showTypes: ['single choice', 'multiple choice',
      'matching', 'short response', 'fill in the blanks'],
    sortBy: 'index',
    reverse: false,
  }),
  computed: {
    quizQuestions() {
      let filteredQuestions = this.mergedQuizResult.questions;
      if (!this.showCorrect) {
        filteredQuestions = filteredQuestions.filter((value) => (value.score !== value.points));
      }
      if (!this.showIncorrect) {
        filteredQuestions = filteredQuestions.filter((value) => (value.score === value.points));
      }
      const showTypes = new Set(this.showTypes);
      filteredQuestions = filteredQuestions.filter((value) => (showTypes.has(value.type)));
      if (this.sortBy === 'points') {
        filteredQuestions.sort((a, b) => {
          if (a.points === b.points) {
            return a.index > b.index ? 1 : -1;
          }
          return a.points < b.points ? 1 : -1;
        });
      } else if (this.sortBy === 'score') {
        filteredQuestions.sort((a, b) => {
          if (a.score === b.score) {
            return a.index > b.index ? 1 : -1;
          }
          return a.score > b.score ? 1 : -1;
        });
      }
      if (this.reverse) {
        return filteredQuestions.reverse();
      }
      return filteredQuestions;
    },
  },
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
          text: this.rawQuizResult.quizName,
          disabled: false,
          to: `/quiz/${this.rawQuizResult.quizId}`,
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
        this.rawQuizResult = await ResultService.getResult(this.attemptId);
        this.mergedQuizResult = this.rawQuizResult;
        for (let index = 0; index < this.rawQuizResult.questions.length; index += 1) {
          this.mergedQuizResult.questions[index] = {
            ...this.rawQuizResult.questions[index],
            ...this.rawQuizResult.results[index],
          };
          this.mergedQuizResult.questions[index].index = index + 1;
        }
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
      // Used in multiple choice, return if option is chosen
      if (Array.isArray(response)) {
        const answerSet = new Set(response);
        return answerSet.has(option);
      }
      return response === option;
    },
    isCorrect(response, answer) {
      // Used in multiple choice, return if option is correct
      if (Array.isArray(answer)) {
        const answerSet = new Set(answer);
        return answerSet.has(response);
      }
      return response === answer;
    },
    generateReport() {
      let filteredQuestions = this.mergedQuizResult.questions;
      if (!this.showCorrect) {
        filteredQuestions = filteredQuestions.filter((value) => (value.score !== value.points));
      }
      if (!this.showIncorrect) {
        filteredQuestions = filteredQuestions.filter((value) => (value.score === value.points));
      }
      const showTypes = new Set(this.showTypes);
      filteredQuestions = filteredQuestions.filter((value) => (showTypes.has(value.type)));
      if (this.sortBy === 'points') {
        filteredQuestions.sort((a, b) => {
          if (a.points === b.points) {
            return a.index > b.index ? 1 : -1;
          }
          return a.points < b.points ? 1 : -1;
        });
      } else if (this.sortBy === 'score') {
        filteredQuestions.sort((a, b) => {
          if (a.score === b.score) {
            return a.index > b.index ? 1 : -1;
          }
          return a.score > b.score ? 1 : -1;
        });
      }
      if (this.reverse) {
        PDFReport.newReport(filteredQuestions.reverse());
      }
      PDFReport.newReport(filteredQuestions);
    },
    toQuizInfo() {
      this.$router.push({ name: 'QuizInfo', params: { id: this.rawQuizResult.quizId } });
    },
  },
};
</script>
<style>
.v-text-field .v-select__slot .v-select__selection--comma { min-width: min-content}
</style>
