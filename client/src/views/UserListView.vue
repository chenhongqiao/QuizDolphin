<template>
  <div>
    <v-container>
      <v-card>
        <v-data-table
          :headers="tableHeaders"
          :items="userList"
        >
          <template #top>
            <v-toolbar
              flat
            >
              <v-toolbar-title>User List</v-toolbar-title>
              <v-divider
                class="mx-4"
                inset
                vertical
              />
              <v-spacer />
              <v-btn @click="newUser=true">
                New User
              </v-btn>
            </v-toolbar>
          </template>
          <!-- eslint-disable-next-line vue/valid-v-slot -->
          <template #item.actions="{ item }">
            <v-icon
              small
              class="mr-2"
              @click="pendingDeleteUser=item;pendingDelete=true;"
            >
              mdi-delete
            </v-icon>
            <v-icon
              small
              class="mr-2"
              @click="editUser(item)"
            >
              mdi-pencil
            </v-icon>
          </template>
        </v-data-table>
      </v-card>
    </v-container>
    <div v-if="editing">
      <EditUserComponent
        :email="editEmail"
        @cancel="editing=false;editEmail=null;"
        @update="editing=false;editEmail=null;loadUserList();"
      />
    </div>
    <div v-else-if="newUser">
      <EditUserComponent
        @cancel="newUser=false;"
        @update="newUser=false;loadUserList();"
      />
    </div>
    <v-dialog
      v-model="pendingDelete"
      max-width="500px"
    >
      <v-card>
        <v-container>
          Do you want to delete this user?
        </v-container>
        <v-divider />
        <v-card-actions>
          <v-spacer />
          <v-btn
            text
            @click="pendingDelete=false;pendingDeleteUser=null"
          >
            Cancel
          </v-btn>
          <v-btn
            class="red--text"
            text
            @click="deleteUser();pendingDelete=false;pendingDeleteUser=null"
          >
            Delete
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import UserService from '../services/UserService';
import EditUserComponent from '../components/admin/EditUserComponent.vue';

export default {
  components: {
    EditUserComponent,
  },
  data: () => ({
    userList: [],
    pendingDelete: false,
    pendingDeleteUser: {},
    tableHeaders: [
      {
        text: 'Name',
        value: 'name',
      },
      {
        text: 'Email',
        value: 'email',
      },
      {
        text: 'Role',
        value: 'role',
      },
      {
        text: 'Actions',
        value: 'actions',
        sortable: false,
        align: 'end',
        groupable: false,
      },
    ],
    editing: false,
    editEmail: null,
    newUser: false,
  }),
  async mounted() {
    await this.loadUserList();
  },
  methods: {
    editUser(user) {
      this.editing = true;
      this.editEmail = user.email;
    },
    async loadUserList() {
      this.userList = await UserService.getUserList();
    },
    async deleteUser() {
      try {
        // eslint-disable-next-line max-len
        await UserService.deleteUser(this.pendingDeleteUser.email);
        await this.loadUserList();
      } catch (err) {
        if (err.response) {
          if (err.response.status === 401 || err.response.status === 403) {
            this.$store.commit('logout');
            this.$router.push({ path: '/login', query: { redirect: `/quiz/${this.quizId}` } });
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
