<template>
  <div>
    <v-container>
      <p class="text-center">
        You got {{ quizScore }} out of {{ totalPoints }}
      </p>
    </v-container>
  </div>
</template>

<script>
export default {
  name: 'ResultComponent',
  props: {
    quizScore: { type: Number, default: 0 },
    totalPoints: { type: Number, default: 0 },
  },
};
</script>
