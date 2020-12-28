<template>
  <v-app>
    <v-app-bar app>
      <v-toolbar-title>FBLA Quiz System</v-toolbar-title>
    </v-app-bar>

    <v-main>
      <QuizComponent />
    </v-main>
  </v-app>
</template>

<script>
import QuizComponent from "./components/QuizComponent";

export default {
  name: "App",

  components: {
    QuizComponent,
  },

  data: () => ({
    //
  }),
};
</script>
