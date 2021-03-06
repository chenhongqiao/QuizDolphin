<template>
  <div>
    <v-dialog
      v-if="needAuth"
      :value="true"
      max-width="800px"
      persistent
    >
      <v-card>
        <v-card-title>
          Quiz Dolphin Login
        </v-card-title>
        <v-container>
          <v-alert
            v-model="hasLoginError"
            dismissible
            outlined
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
            />
            <v-text-field
              v-model="loginInfo.password"
              :rules="passwordRules"
              label="Password"
              :type="showPassword ? 'text' : 'password'"
              :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
              required
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
    <v-progress-linear
      v-else
      indeterminate
    />
  </div>
</template>

<script>
import UserService from '../services/UserService';

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
    needAuth: false,
  }),
  async mounted() {
    const userInformation = (await UserService.getSessionInfo());
    // Navigate away if user is already logged in
    if (userInformation) {
      this.$store.commit('user/login', userInformation);
      if (this.$route.query.redirect) {
        // Go back if login request come from the system it self
        this.$router.go(-1);
      } else {
        this.$router.replace('/home');
      }
    } else {
      this.needAuth = true;
    }
  },
  methods: {
    async login() {
      this.actionDisabled = true;
      try {
        await UserService.postSession(this.loginInfo);
        const userInformation = (await UserService.getSessionInfo());
        this.$store.commit('user/login', userInformation);
        if (this.$route.query.redirect) {
          this.$router.replace(this.$route.query.redirect);
        } else {
          this.$router.replace('/home');
        }
      } catch (err) {
        if (err.response) {
          if (err.response.status === 401) {
            // If failing, display a message
            this.hasLoginError = true;
            this.loginResponse = 'Authenication failed, please try again.';
            this.loginInfo.password = '';
          } else {
            throw err;
          }
        } else {
          throw err;
        }
      }
      this.actionDisabled = false;
    },
  },
};
</script>
