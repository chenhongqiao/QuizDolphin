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
        <v-card-text v-if="loaded">
          <v-form v-model="infoValid">
            <div>
              Email
            </div>
            <v-text-field
              v-model="userInfo.email"
              :rules="requiredField"
              :disabled="!!email"
            />
            <div>
              Name
            </div>
            <v-text-field
              v-model.trim="userInfo.name"
              :rules="requiredField"
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
              :items="['user','admin']"
              :rules="requiredField"
            />
          </v-form>
        </v-card-text>
        <v-progress-linear
          v-else
          indeterminate
        />
        <v-card-actions>
          <v-spacer />
          <v-btn
            text
            @click="pendingQuit=true"
          >
            Quit
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
  }),
  async mounted() {
    try {
      if (this.email) {
        this.userInfo = await UserService.getUserInfo(this.email);
      }
      this.loaded = true;
    } catch (err) {
      if (err.response) {
        if (err.response.status === 401 || err.response.status === 403) {
          this.$store.commit('user/logout');
          this.$router.push({ path: '/login', query: { redirect: this.$route.path } });
        } else if (err.response.status === 404) {
        // TODO: 404 Page
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
          if (err.response.status === 401 || err.response.status === 403) {
            this.$store.commit('user/logout');
            this.$router.push({ path: '/login', query: { redirect: this.$route.path } });
          } else if (err.response.status === 404) {
            // TODO: 404 Page
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
