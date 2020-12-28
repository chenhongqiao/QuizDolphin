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
      <v-container v-if="quizStarted && !quizGraded">
        <QuizComponent
          :quizData="quizData"
          :quizAnswers.sync="quizAnswers"
          v-on:quizDone="gradeQuiz"
        />
      </v-container>
      <v-container v-if="quizGraded">
        <div>you got {{ quizScore }}</div>
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
  data: () => ({
    quizStarted: false,
    quizData: [],
    quizScore: 0,
    quizAnswers: [],
    quizGraded: false,
  }),
  methods: {
    async startQuiz() {
      this.quizData = (await QuestionService.getQuestions(3)).data;
      this.quizStarted = true;
    },
    async gradeQuiz() {
      const processedAnswers = this.quizAnswers.map((value, index) => {
        return { uuid: this.quizData[index].uuid, answer: value };
      });
      const rawResponse = await QuestionService.gradeQuestions(
        processedAnswers
      );
      this.quizScore = rawResponse.data.score;
      this.quizGraded = true;
    },
  },
};
</script>
