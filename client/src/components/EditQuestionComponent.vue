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
                @click="question.options.splice(index,1)"
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
              @click="question.options.push(null)"
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
                  :value="option"
                />
              </v-col>
            </v-radio-group>
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
                  :value="option"
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
    oldQuestion: { type: Object, default: Object },
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
    this.question = { ...this.oldQuestion };
  },
  methods: {
    cancel() {
      this.$emit('cancel');
    },
  },
};
</script>
