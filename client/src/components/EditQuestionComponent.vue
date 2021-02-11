<template>
  <v-dialog
    :value="true"
    persistent
  >
    <v-card>
      <v-card-title>Edit Question</v-card-title>
      <v-divider />
      <div v-if="loaded">
        <v-card-text>
          <v-form v-model="questionValid">
            <v-row>
              <v-col>
                <div class="text-h6">
                  Question Type
                </div>
                <v-select
                  v-model="question.type"
                  :items="questionTypes"
                  @change="changeQuestionType"
                />
              </v-col>
              <v-col>
                <div class="text-h6">
                  Points
                </div>
                <v-text-field
                  v-model.number="question.points"
                  required
                  :rules="[...requiredField,...pointsRange]"
                  type="number"
                />
              </v-col>
            </v-row>
            <div v-if="question.type==='single choice'||question.type==='multiple choice'">
              <div class="text-h6">
                Context
              </div>
              <v-textarea
                v-model="question.context"
                required
                :rules="requiredField"
              />
              <div class="text-h6">
                Options
              </div>
              <div
                v-for="(option,index) in question.options"
                :key="'editing option'+index"
              >
                <v-row>
                  <v-col>
                    <v-text-field
                      v-model="question.options[index]"
                      required
                      :rules="requiredField"
                    />
                  </v-col>
                  <v-btn
                    text
                    class="mt-6 mx-2"
                    @click="deleteOption(index)"
                  >
                    <v-icon>
                      mdi-delete
                    </v-icon>
                  </v-btn>
                </v-row>
              </div>
              <div class="text-right">
                <v-btn
                  text
                  @click="question.options.push('')"
                >
                  New Option
                </v-btn>
              </div>
              <div v-if="question.type==='single choice'">
                <div class="text-h6 mt-4">
                  Answer
                </div>
                <v-radio-group
                  v-model="question.answer"
                  row
                >
                  <v-col
                    v-for="(option,index) in question.options"
                    :key="'choosing answer'+index"
                    md="3"
                    cols="6"
                  >
                    <v-radio
                      :label="option"
                      :value="index"
                    />
                  </v-col>
                </v-radio-group>
                <div v-if="question.answer===null">
                  Please select an answer
                </div>
              </div>
              <div v-if="question.type==='multiple choice'">
                <div class="text-h6 mt-4">
                  Answer
                </div>
                <v-row wrap>
                  <v-col
                    v-for="(option,index) in question.options"
                    :key="'choosing answer'+index"
                    md="3"
                    cols="6"
                  >
                    <v-checkbox
                      v-model="question.answer"
                      :label="option"
                      :value="index"
                    />
                  </v-col>
                </v-row>
                <div
                  v-if="!question.answer.length"
                  class="pt-2"
                >
                  Please select at lease one answer
                </div>
              </div>
            </div>
            <div v-if="question.type==='short response'">
              <div class="text-h6">
                Context
              </div>
              <v-textarea
                v-model="question.context"
                required
                :rules="requiredField"
              />
              <div class="text-h6 mt-4">
                Answer
              </div>
              <v-text-field
                v-model.trim="question.answer"
                required
                :rules="requiredField"
              />
            </div>
            <div v-if="question.type==='matching'">
              <div class="text-h6">
                Context
              </div>
              <v-textarea
                v-model="question.context"
                required
                :rules="requiredField"
              />
              <v-row>
                <v-col md="6">
                  <div class="text-h6">
                    Left Col
                  </div>
                  <div
                    v-for="(left,index) in question.leftcol"
                    :key="'leftcol'+index"
                  >
                    <v-row>
                      <v-col>
                        <v-text-field
                          v-model="question.leftcol[index]"
                          required
                          :rules="requiredField"
                        />
                      </v-col>
                    </v-row>
                  </div>
                </v-col>
                <v-col md="6">
                  <div class="text-h6">
                    Right Col
                  </div>
                  <div
                    v-for="(answer,index) in question.answer"
                    :key="'answer'+index"
                  >
                    <v-row>
                      <v-col>
                        <v-text-field
                          v-model="question.answer[index]"
                          required
                          :rules="requiredField"
                        />
                      </v-col>
                      <v-btn
                        class="mt-6"
                        text
                        @click="deleteRow(index)"
                      >
                        <v-icon>
                          mdi-delete
                        </v-icon>
                      </v-btn>
                    </v-row>
                  </div>
                </v-col>
              </v-row>
              <div class="text-right">
                <v-btn
                  text
                  @click="newRow()"
                >
                  New Row
                </v-btn>
              </div>
            </div>
            <div v-if="question.type==='fill in the blanks'">
              <div class="text-h6">
                Context
              </div>
              <v-textarea
                v-model="fillBlanksContext"
                required
                :rules="requiredField"
              />
              <div
                v-for="(blank,index) in question.context"
                :key="'blank'+index"
              >
                <div v-if="index!==question.context.length-1">
                  <div class="text-h6">
                    Blank {{ index+1 }}
                  </div>
                  <div class="text-h7">
                    Options
                  </div>
                  <v-row wrap>
                    <v-col
                      v-for="(option,oindex) in question.options[index]"
                      :key="index+'option'+oindex"
                      class="auto"
                    >
                      <v-text-field
                        v-model="question.options[index][oindex]"
                        required
                        :rules="requiredField"
                      />
                      <a @click="deleteOption(oindex,index)">delete</a>
                    </v-col>
                    <v-btn
                      text
                      class="mt-6"
                      @click="addBlankOption(index)"
                    >
                      New Option
                    </v-btn>
                  </v-row>
                  <div class="text-h7 pt-2">
                    Answer
                  </div>
                  <v-radio-group
                    v-model="question.answer[index]"
                    row
                  >
                    <v-col
                      v-for="(option,aindex) in question.options[index]"
                      :key="'choosing answer'+aindex"
                      md="3"
                      cols="6"
                    >
                      <v-radio
                        :label="option"
                        :value="aindex"
                      />
                    </v-col>
                  </v-radio-group>
                  <div v-if="question.answer[index]===null">
                    Please select an answer
                  </div>
                </div>
              </div>
            </div>
          </v-form>
        </v-card-text>
      </div>
      <v-progress-linear
        v-else
        indeterminate
      />
      <v-card-actions>
        <v-spacer />
        <v-btn
          text
          @click="cancel()"
        >
          Cancel
        </v-btn>
        <v-btn
          text
          :disabled="!questionValid||missingAnswer||!loaded"
          @click="updateQuestion()"
        >
          Upload
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import QuestionService from '../services/QuestionService';

export default {
  props: {
    questionId: { type: String, default: null },
    quizId: { type: String, default: null },
  },
  data: () => ({
    question: {},
    requiredField: [
      (v) => {
        if (v !== undefined && v !== null && v !== '') {
          return true;
        }
        return 'This field is requried';
      },
    ],
    pointsRange: [
      (v) => {
        if (v >= 0) {
          return true;
        }
        return 'Points can not be negative';
      },
    ],
    questionTypes: [
      'single choice',
      'multiple choice',
      'fill in the blanks',
      'short response',
      'matching',
    ],
    fillBlanksContext: '',
    loaded: false,
    questionValid: false,
    missingAnswer: true,
  }),
  watch: {
    fillBlanksContext: {
      handler() {
        this.question.context = this.fillBlanksContext.split('[?]');
      },
    },
    'question.answer': {
      deep: true,
      handler() {
        if (this.question.type === 'single choice') {
          if (this.question.answer === null) {
            this.missingAnswer = true;
          } else {
            this.missingAnswer = false;
          }
        } else if (this.question.type === 'multiple') {
          if (!this.question.answer.length) {
            this.missingAnswer = true;
          } else {
            this.missingAnswer = false;
          }
        } else if (this.question.type === 'fill in the blanks') {
          let cnt = 0;
          for (let index = 0; index < this.question.answer.length; index += 1) {
            if (this.question.answer[index] !== null) {
              cnt += 1;
            }
          }
          if (cnt === this.question.answer.length) {
            this.missingAnswer = false;
          } else {
            this.missingAnswer = true;
          }
        } else if (this.question.type === 'short response' || this.question.type === 'matching') {
          this.missingAnswer = false;
        }
      },
    },
  },
  async mounted() {
    try {
      if (this.questionId) {
        this.question = await QuestionService.getQuestion(this.questionId);
        this.preProcess();
      } else {
        this.question.quizId = this.quizId;
      }
      this.loaded = true;
    } catch (err) {
      if (err.response) {
        if (err.response.status === 401 || err.response.status === 403) {
          this.$store.commit('logout');
          this.$router.push({ path: '/login', query: { redirect: `/quiz/${this.quizId}` } });
        } else if (err.response.status === 404) {
        // TODO: 404 Page
        } else {
          throw err;
        }
      } else {
        throw err;
      }
    }
  },
  methods: {
    preProcess() {
      if (this.question.type === 'multiple choice') {
      // eslint-disable-next-line max-len
        this.question.answer = this.question.answer.map((value) => this.question.options.indexOf(value));
      } else if (this.question.type === 'single choice') {
        if (this.question.answer !== null) {
          this.question.answer = this.question.options.indexOf(this.question.answer);
        }
      } else if (this.question.type === 'fill in the blanks') {
        const oldContext = this.question.context;
        // eslint-disable-next-line max-len
        this.question.answer = this.question.answer.map((value, index) => this.question.options[index].indexOf(value));
        for (let index = 0; index < oldContext.length; index += 1) {
          this.fillBlanksContext += oldContext[index];
          if (index !== oldContext.length - 1) {
            this.fillBlanksContext += '[?]';
          }
        }
      }
    },
    deleteOption(index, bindex) {
      if (this.question.type === 'single choice') {
        if (this.question.answer === index) {
          this.question.answer = null;
        } else if (this.question.answer > index) {
          this.question.answer -= 1;
        }
        this.question.options.splice(index, 1);
      } else if (this.question.type === 'multiple choice') {
        if (this.question.answer.indexOf(index) !== -1) {
          this.question.answer.splice(
            this.question.answer.indexOf(index), 1,
          );
        }
        this.question.answer = this.question.answer.map((value) => {
          if (value > index) {
            return value - 1;
          }
          return value;
        });
        this.question.options.splice(index, 1);
      } else if (this.question.type === 'fill in the blanks') {
        if (this.question.answer[bindex] === index) {
          this.$set(this.question.answer, bindex, null);
        } else if (this.question.answer[bindex] > index) {
          this.$set(this.question.answer, bindex, this.question.answer[bindex] - 1);
        }
        this.question.options[bindex].splice(index, 1);
      }
    },
    deleteRow(index) {
      this.question.leftcol.splice(index, 1);
      this.question.answer.splice(index, 1);
    },
    newRow() {
      this.question.leftcol.push('');
      this.question.answer.push('');
    },
    cancel() {
      this.$emit('cancel');
    },
    async updateQuestion() {
      this.loaded = false;
      if (this.question.type === 'multiple choice') {
      // eslint-disable-next-line max-len
        this.question.answer = this.question.answer.map((value) => this.question.options[value]);
      } else if (this.question.type === 'single choice') {
        this.question.answer = this.question.options[this.question.answer];
      } else if (this.question.type === 'fill in the blanks') {
        // eslint-disable-next-line max-len
        this.question.answer = this.question.answer.map((value, index) => this.question.options[index][value]);
      } else if (this.question.type === 'matching') {
        this.question.rightcol = [...this.question.answer];
        for (let index = this.question.rightcol.length - 1; index >= 1; index -= 1) {
          const pindex = Math.floor(Math.random() * (index + 1));
          const temp = this.question.rightcol[index];
          this.question.rightcol[index] = this.question.rightcol[pindex];
          this.question.rightcol[pindex] = temp;
        }
      }
      try {
        if (this.questionId) {
          await QuestionService.putQuestion(this.questionId, this.question);
        } else {
          await QuestionService.postQuestion(this.question);
        }
        this.$emit('update');
      } catch (err) {
        if (err.response) {
          if (err.response.status === 401 || err.response.status === 403) {
            this.$store.commit('logout');
            this.$router.push({ path: '/login', query: { redirect: `/quiz/${this.quizId}` } });
          } else if (err.response.status === 404) {
            // TODO: 404 Page
          } else {
            throw err;
          }
        } else {
          throw err;
        }
      }
    },
    addBlankOption(index) {
      if (!Array.isArray(this.question.options[index])) {
        this.$set(this.question.options, index, []);
      }
      this.question.options[index].push('');
      this.$set(this.question.answer, index, null);
    },
    changeQuestionType(type) {
      if (type === 'single choice') {
        this.question.answer = null;
        if (typeof this.question.context !== 'string') {
          this.question.context = '';
        }
        if (!Array.isArray(this.question.options)) {
          this.question.options = [];
        }
        for (let index = this.question.options.length - 1; index >= 0; index -= 1) {
          if (typeof this.question.options[index] !== 'string') {
            this.question.options.pop();
          }
        }
      } else if (type === 'multiple choice') {
        this.question.answer = [];
        if (typeof this.question.context !== 'string') {
          this.question.context = '';
        }
        if (!Array.isArray(this.question.options)) {
          this.question.options = [];
        }
        for (let index = this.question.options.length - 1; index >= 0; index -= 1) {
          if (typeof this.question.options[index] !== 'string') {
            this.question.options.pop();
          }
        }
      } else if (type === 'short response') {
        this.question.answer = '';
        if (typeof this.question.context !== 'string') {
          this.question.context = '';
        }
      } else if (type === 'matching') {
        this.question.answer = [];
        this.question.leftcol = [];
        this.question.rightcol = [];
        if (typeof this.question.context !== 'string') {
          this.question.context = '';
        }
      } else if (type === 'fill in the blanks') {
        this.question.answer = [];
        this.question.options = [];
        if (typeof this.question.context === 'string') {
          const oldContext = this.question.context;
          this.question.context = [];
          this.question.context.push(oldContext);
        } else {
          this.question.context = [];
        }
      }
      this.preProcess();
    },
  },
};
</script>
