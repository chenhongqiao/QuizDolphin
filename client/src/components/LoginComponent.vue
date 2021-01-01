<template>
  <v-dialog
    :value="true"
    max-width="800px"
    persistent
  >
    <v-card>
      <v-card-title>
        Please Login First
      </v-card-title>
      <v-container>
        <v-form
          v-model="loginInfoValid"
        >
          <v-text-field
            v-model="loginInfo.email"
            :rules="emailRules"
            label="E-mail"
            required
          />
          <v-text-field
            v-model="loginInfo.password"
            :rules="passwordRules"
            label="Password"
            required
          />
        </v-form>
      </v-container>
      <v-card-actions>
        <span style="color: red">
          {{ loginResponse }}
        </span>
        <v-spacer />
        <v-btn
          :disabled="!loginInfoValid"
          @click="login()"
        >
          Login
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import UserService from '../UserService';

export default {
  name: 'LoginComponent',
  props: {
    loggedIn: { type: Boolean, default: null },
  },
  data: () => ({
    loginInfo: {},
    loginInfoValid: false,
    emailRules: [
      (v) => !!v || 'Please enter your E-mail',
      (v) => /.+@.+\..+/.test(v) || 'E-mail must be valid',
    ],
    passwordRules: [
      (v) => !!v || 'Please enter your password',
    ],
    loginResponse: '',
  }),
  methods: {
    async login() {
      const response = (await UserService.login(this.loginInfo)).data;
      if (response === 'Success!') {
        this.$emit('update:loggedIn', true);
      } else {
        this.loginResponse = response;
        this.loginInfo.password = '';
      }
    },
  },
};
</script>
