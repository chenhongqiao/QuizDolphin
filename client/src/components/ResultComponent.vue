<template>
  <div>
    <v-container>
      <h2> Quiz result </h2>
      <div>
        You got {{ quizResult.score }} out of {{ totalPoints }}
      </div>
      <v-btn @click="generateReport">
        Download Report
      </v-btn>
      <v-container
        v-for="currentQuestion in quizResult.questions.length"
        :key="'d-'+currentQuestion"
      >
        <v-card>
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
          </v-container>
        </v-card>
      </v-container>
    </v-container>
    <v-container>
      <v-row>
        <v-spacer />
        <v-btn @click="resetQuiz">
          Reset Quiz
        </v-btn>
      </v-row>
    </v-container>
    <vue-html2pdf
      ref="html2Pdf"
      :show-layout="false"
      :float-layout="true"
      :enable-download="true"
      :preview-modal="true"
      :paginate-elements-by-height="1400"
      filename="Quiz Report"
      :pdf-quality="2"
      :manual-pagination="false"
      pdf-format="letter"
      pdf-orientation="portrait"
      pdf-content-width="800px"
      @progress="onProgress($event)"
      @hasStartedGeneration="hasStartedGeneration()"
      @hasGenerated="hasGenerated($event)"
    >
      <section slot="pdf-content">
        <v-container>
          <h2> FBLA Quiz Result </h2>
          <div>
            You got {{ quizResult.score }} out of {{ totalPoints }}
          </div>
        </v-container>
        <v-container
          v-for="currentQuestion in quizResult.questions.length"
          :key="'p-'+currentQuestion"
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
          <v-container v-if="quizResult.questions[currentQuestion-1].type==='single choice'">
            <h3>
              Options:
            </h3>
            <div
              v-for="option in quizResult.questions[currentQuestion-1].options"
              :key="'ps-'+option"
            >
              {{ option }}
            </div>
            <h3>
              Your Response:
            </h3>
            <div>
              {{ quizResult.questionsResult[currentQuestion-1].userAnswer }}
            </div>
            <h3>
              Correct Answer:
            </h3>
            <div>
              {{ quizResult.questionsResult[currentQuestion-1].correctAnswer }}
            </div>
          </v-container>
          <v-container v-if="quizResult.questions[currentQuestion-1].type==='short response'">
            <h3>
              Your Response:
            </h3>
            <div>
              {{ quizResult.questionsResult[currentQuestion-1].userAnswer }}
            </div>
            <h3>
              Correct Answer:
            </h3>
            <div>
              {{ quizResult.questionsResult[currentQuestion-1].correctAnswer }}
            </div>
          </v-container>
          <v-container v-if="quizResult.questions[currentQuestion-1].type==='multiple choice'">
            <h3>
              Options
            </h3>
            <div
              v-for="option in quizResult.questions[currentQuestion-1].options"
              :key="'pmo-'+option"
            >
              {{ option }}
            </div>
            <h3>
              Your Response:
            </h3>
            <div
              v-for="option in quizResult.questionsResult[currentQuestion-1].userAnswer"
              :key="'pmu-'+option"
            >
              {{ option }}
            </div>
            <h3>
              Correct Answer:
            </h3>
            <div
              v-for="option in quizResult.questionsResult[currentQuestion-1].correctAnswer"
              :key="'pmc-'+option"
            >
              {{ option }}
            </div>
          </v-container>
        </v-container>
      </section>
    </vue-html2pdf>
  </div>
</template>

<script>
import VueHtml2pdf from 'vue-html2pdf';

export default {
  name: 'ResultComponent',
  components: {
    VueHtml2pdf,
  },
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
