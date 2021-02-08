<template>
  <v-dialog
    :value="true"
    persistent
    max-width="1000px"
  >
    <v-card>
      <v-container>
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
<<<<<<< HEAD
                @click="deleteOption(index)"
=======
                @click="question.options.splice(index,1)"
>>>>>>> main
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
<<<<<<< HEAD
              @click="question.options.push('')"
=======
              @click="question.options.push(null)"
>>>>>>> main
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
<<<<<<< HEAD
                  :value="index"
                />
              </v-col>
            </v-radio-group>
            <div v-if="question.answer===null">
              Please Select At Least One Answer
            </div>
=======
                  :value="option"
                />
              </v-col>
            </v-radio-group>
>>>>>>> main
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
<<<<<<< HEAD
                  v-model.lazy="question.answer"
                  :label="option"
                  :value="index"
=======
                  v-model="question.answer"
                  :label="option"
                  :value="option"
>>>>>>> main
                />
              </v-col>
            </v-row>
            <div v-if="!question.answer.length">
              Please Select At Least One Answer
            </div>
          </div>
        </div>
      </v-container>
      <v-card-actions>
        <v-spacer />
        <v-btn @click="cancel()">
          Cancel
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  props: {
<<<<<<< HEAD
    oldQuestion: { type: Object, default: undefined },
=======
    oldQuestion: { type: Object, default: Object },
>>>>>>> main
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
  }),
  mounted() {
<<<<<<< HEAD
    this.question = JSON.parse(JSON.stringify(this.oldQuestion));
    if (this.question.type === 'multiple choice') {
      // eslint-disable-next-line max-len
      this.question.answer = this.question.answer.map((value) => this.question.options.indexOf(value));
    } else if (this.question.type === 'single choice') {
      this.question.answer = this.question.options.indexOf(this.question.answer);
    }
  },
  methods: {
    deleteOption(index) {
      if (this.question.type === 'single choice') {
        if (this.question.answer === index) {
          this.question.answer = null;
        }
      } else if (this.question.type === 'multiple choice') {
        this.question.answer.splice(
          this.question.answer.indexOf(index), 1,
        );
      }
      this.question.options.splice(index, 1);
    },
=======
    this.question = { ...this.oldQuestion };
  },
  methods: {
>>>>>>> main
    cancel() {
      this.$emit('cancel');
    },
  },
};
</script>
