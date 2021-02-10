<template>
  <v-dialog
    :value="true"
    persistent
  >
    <v-card>
      <v-card-title>Edit Question</v-card-title>
      <v-divider />
      <v-card-text>
        <v-row>
          <v-col>
            <div class="text-h6">
              Question Type
            </div>
            <v-select
              v-model="question.type"
              :items="questionTypes"
            />
          </v-col>
          <v-col>
            <div class="text-h6">
              Points
            </div>
            <v-text-field
              v-model.number="question.points"
              required
              :rules="requiredField"
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
              Please Select At Least One Answer
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
                  v-model.lazy="question.answer"
                  :label="option"
                  :value="index"
                />
              </v-col>
            </v-row>
            <div v-if="!question.answer.length">
              Please Select At Least One Answer
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
                  @click="question.options[index].push('')"
                >
                  New Option
                </v-btn>
              </v-row>
              <div class="text-h7">
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
            </div>
          </div>
        </div>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn
          text
          @click="cancel()"
        >
          Cancel
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  props: {
    oldQuestion: { type: Object, default: undefined },
  },
  data: () => ({
    question: {},
    requiredField: [
      (v) => !!v || 'This field is requried',
    ],
    questionTypes: [
      'single choice',
      'multiple choice',
      'fill in the blanks',
      'short response',
      'matching',
    ],
    fillBlanksContext: '',
  }),
  watch: {
    fillBlanksContext: {
      handler() {
        this.question.context = this.fillBlanksContext.split('[?]');
      },
    },
  },
  mounted() {
    this.question = JSON.parse(JSON.stringify(this.oldQuestion));
    if (this.question.type === 'multiple choice') {
      // eslint-disable-next-line max-len
      this.question.answer = this.question.answer.map((value) => this.question.options.indexOf(value));
    } else if (this.question.type === 'single choice') {
      this.question.answer = this.question.options.indexOf(this.question.answer);
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
  methods: {
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
          this.question.answer[bindex] = null;
        } else if (this.question.answer[bindex] > index) {
          this.question.answer[bindex] -= 1;
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
  },
};
</script>
