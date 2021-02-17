<template>
  <div>
    <v-container>
      <div class="text-center text-h5">
        Sorry, we cannot find the page you are looking for.
      </div>
      <div class="text-center text-h7">
        This might because of incorrect url or the resource has been deleted.
      </div>
      <div class="text-center pa-4">
        <v-btn
          class="mx-2"
          @click="$router.go(-1)"
        >
          Go Back
        </v-btn>
        <v-btn
          class="mx-2"
          @click="$router.replace('/home')"
        >
          Home Page
        </v-btn>
      </div>
    </v-container>
  </div>
</template>

<script>
export default {

};
</script>
