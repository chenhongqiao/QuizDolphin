<template>
  <v-dialog
    :value="true"
    max-width="800px"
    persistent
  >
    <v-card>
      <v-card-title>
        Please Login
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
            label="Email"
            required
            @change="dismissError()"
          />
          <v-text-field
            v-model="loginInfo.password"
            :rules="passwordRules"
            label="Password"
            :type="showPassword ? 'text' : 'password'"
            :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
            required
            @change="dismissError()"
            @click:append="showPassword = !showPassword"
          />
        </v-form>
      </v-container>
      <v-card-actions>
        <v-spacer />
        <v-btn
          :disabled="!loginInfoValid||actionDisabled"
          text
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
  name: 'LoginView',
  data: () => ({
    loginInfo: {},
    loginInfoValid: false,
    emailRules: [
      (v) => !!v || 'Please enter your Email',
      (v) => /.+@.+\..+/.test(v) || 'Email must be valid',
    ],
    passwordRules: [
      (v) => !!v || 'Please enter your password',
    ],
    loginResponse: '',
    hasLoginError: false,
    actionDisabled: false,
    showPassword: false,
  }),
  beforeMount() {
    if (this.$store.state.loggedIn) {
      this.goDashboard();
    }
  },
  methods: {
    async login() {
      this.actionDisabled = true;
      const response = (await UserService.postSession(this.loginInfo)).data;
      if (response === 'Success!') {
        const userInformation = (await UserService.getSession()).data;
        this.$store.commit('login', userInformation);
        this.$router.go(-1);
      } else {
        this.hasLoginError = true;
        this.loginResponse = response;
        this.loginInfo.password = '';
      }
      this.actionDisabled = false;
    },
    goDashboard() {
      this.$router.push('/');
    },
    dismissError() {
      this.hasLoginError = false;
    },
  },
};
</script>
