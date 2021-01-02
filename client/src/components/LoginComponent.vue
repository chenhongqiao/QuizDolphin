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
        <v-alert
          v-model="hasLoginError"
          dismissible
          type="error"
        >
          {{ loginResponse }}
        </v-alert>
        <v-form
          v-model="loginInfoValid"
        >
          <v-text-field
            v-model="loginInfo.email"
            :rules="emailRules"
            label="E-mail"
            required
            @change="dismissError()"
          />
          <v-text-field
            v-model="loginInfo.password"
            :rules="passwordRules"
            label="Password"
            required
            @change="dismissError()"
          />
        </v-form>
      </v-container>
      <v-card-actions>
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
    hasLoginError: false,
  }),
  methods: {
    async login() {
      const response = (await UserService.login(this.loginInfo)).data;
      if (response === 'Success!') {
        this.$emit('update:loggedIn', true);
        this.$emit('authDone');
      } else {
        this.hasLoginError = true;
        this.loginResponse = response;
        this.loginInfo.password = '';
      }
    },
    dismissError() {
      this.hasLoginError = false;
    },
  },
};
</script>
