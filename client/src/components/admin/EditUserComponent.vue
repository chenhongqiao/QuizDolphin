<template>
  <div>
    <v-dialog
      :value="true"
      persistent
    >
      <v-card>
        <v-card-title v-if="email">
          Edit User Info
        </v-card-title>
        <v-card-title v-else>
          New User
        </v-card-title>
        <v-divider />
        <v-card-text v-if="loaded&&!notFound&&!noPrivileges">
          <v-form v-model="infoValid">
            <div>
              Email
            </div>
            <v-text-field
              v-model="userInfo.email"
              :rules="emailRules"
              :disabled="!!email"
            />
            <div>
              Name
            </div>
            <v-text-field
              v-model.trim="userInfo.name"
              :rules="requiredField"
              :disabled="!!email"
            />
            <div>
              Password
            </div>
            <v-text-field
              v-model.trim="userInfo.password"
              :rules="requiredField"
            />
            <div>
              Role
            </div>
            <v-select
              v-model="userInfo.role"
              :items="[{text: 'User', value: 'user'},{text:'Admin',value: 'admin'}]"
              item-text="text"
              item-value="value"
              :rules="requiredField"
            />
          </v-form>
        </v-card-text>
        <v-progress-linear
          v-else-if="!notFound&&!noPrivileges"
          indeterminate
        />
        <v-alert
          v-if="notFound"
          type="error"
        >
          <v-row align="center">
            <v-col class="grow">
              Can not find this user in the database.
            </v-col>
            <v-col class="shrink">
              <v-btn @click="$router.push('/home')">
                Homepage
              </v-btn>
            </v-col>
          </v-row>
        </v-alert>
        <v-alert
          v-if="noPrivileges"
          type="error"
        >
          <v-row align="center">
            <v-col class="grow">
              Sorry, this account do not have access to this resource.
              Please logout and log back in with an admin account.
            </v-col>
            <v-col class="shrink">
              <v-btn @click="$router.push('/home')">
                Homepage
              </v-btn>
            </v-col>
          </v-row>
        </v-alert>
        <v-card-actions>
          <v-spacer />
          <v-btn
            text
            @click="pendingQuit=true"
          >
            Discard
          </v-btn>
          <v-btn
            text
            :disabled="!infoValid||!loaded"
            @click="updateInfo()"
          >
            Save
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog
      v-model="pendingQuit"
      max-width="500px"
    >
      <v-card>
        <v-container>
          Discard all changes and quit?
        </v-container>
        <v-divider />
        <v-card-actions>
          <v-spacer />
          <v-btn
            text
            @click="pendingQuit=false"
          >
            Cancel
          </v-btn>
          <v-btn
            class="red--text"
            text
            @click="$emit('cancel')"
          >
            Discard
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-snackbar
      v-model="actionFailed"
    >
      {{ actionMessage }}
    </v-snackbar>
  </div>
</template>

<script>
import UserService from '../../services/UserService';

export default {
  props: {
    email: { type: String, default: null },
  },
  data: () => ({
    userInfo: {},
    loaded: false,
    infoValid: false,
    pendingQuit: false,
    requiredField: [
      (v) => {
        if (v !== undefined && v !== null && v !== '') {
          return true;
        }
        return 'This field is requried';
      },
    ],
    emailRules: [
      (v) => !!v || 'This field is requried',
      (v) => /.+@.+\..+/.test(v) || 'Email must be valid',
    ],
    notFound: false,
    noPrivileges: false,
    actionFailed: false,
    actionMessage: '',
  }),
  async mounted() {
    try {
      if (this.email) {
        // Get user info if editing
        this.userInfo = await UserService.getUserInfo(this.email);
      }
      this.loaded = true;
    } catch (err) {
      if (err.response) {
        if (err.response.status === 401) {
          this.$store.commit('user/logout');
          this.$router.replace({ name: 'Login', query: { redirect: this.$route.fullPath } });
        } else if (err.response.status === 404) {
          this.notFound = true;
        } else if (err.response.status === 403) {
          this.noPrivileges = true;
        } else {
          throw err;
        }
      } else {
        throw err;
      }
    }
  },
  methods: {
    async updateInfo() {
      try {
        this.loaded = false;
        if (this.email) {
          await UserService.putUserInfo(this.email, this.userInfo);
        } else {
          await UserService.postUserInfo(this.userInfo);
        }
        this.$emit('update');
      } catch (err) {
        if (err.response) {
          if (err.response.status === 401) {
            this.$store.commit('user/logout');
            this.$router.replace({ name: 'Login', query: { redirect: this.$route.fullPath } });
          } else if (err.response.status === 404) {
            this.notFound = true;
          } else if (err.response.status === 403) {
            this.noPrivileges = true;
          } else if (err.response.status === 409) {
            this.loaded = true;
            this.actionMessage = err.response.data;
            this.actionFailed = true;
          } else if (err.response.status === 400) {
            this.loaded = true;
            this.actionMessage = err.response.data;
            this.actionFailed = true;
          } else {
            throw err;
          }
        } else {
          throw err;
        }
      }
    },
  },
};
</script>
