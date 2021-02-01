<template>
  <div>
    Time Left: {{ hoursLeft }} h {{ minutesLeft }} min {{ secondsLeft }} sec
  </div>
</template>
<script>
export default {
  props: {
    endTime: { type: Number, default: undefined },
  },
  data: () => ({
    timeLeft: 0,
    timer: undefined,
  }),
  computed: {
    hoursLeft() {
      if (this.timeLeft >= 0) {
        return Math.floor(this.timeLeft / (1000 * 60 * 60));
      }
      return 0;
    },
    minutesLeft() {
      if (this.timeLeft >= 0) {
        return Math.floor((this.timeLeft % (1000 * 60 * 60)) / (1000 * 60));
      }
      return 0;
    },
    secondsLeft() {
      if (this.timeLeft >= 0) {
        return Math.floor((this.timeLeft % (1000 * 60)) / 1000);
      }
      return 0;
    },
  },
  mounted() {
    this.timeLeft = this.endTime - Date.now();
    this.timer = setInterval(() => { this.updateTimer(); }, 1000);
  },
  beforeDestroy() {
    clearInterval(this.timer);
  },
  methods: {
    updateTimer() {
      this.timeLeft = this.endTime - Date.now();
      if (this.timeLeft <= 0) {
        this.$emit('timeUp');
      }
    },
  },
};
</script>
