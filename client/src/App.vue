<template>
  <v-app>
    <v-app-bar app>
      <v-toolbar-title>FBLA Quiz System</v-toolbar-title>
    </v-app-bar>
    <v-main>
      <v-container v-if="!quizStarted">
        <v-row>
          <v-col>
          <v-card-actions class="justify-center">
            <v-btn @click="startQuiz">Start Quiz!</v-btn>
          </v-card-actions>
          </v-col>
        </v-row>
      </v-container>
      <v-container v-if="quizStarted">
        <QuizComponent v-bind:quizData="quizData" />
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import QuizComponent from "./components/QuizComponent";
import QuestionService from "./QuestionService";
export default {
  name: "App",

  components: {
    QuizComponent,
  },
  methods: {
    async startQuiz() {
      this.quizStarted = true;
      this.quizData = (await QuestionService.getQuestions(3)).data;
    },
  },
  data: () => ({
    quizStarted: false,
    quizData: [],
  }),
};
</script>
