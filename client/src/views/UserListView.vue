<template>
  <div>
    <v-container>
      <v-card>
        <v-data-table
          :headers="tableHeaders"
          :items="userList"
        >
          <!-- eslint-disable-next-line vue/valid-v-slot -->
          <template #item.actions="{ item }">
            <v-icon
              small
              class="mr-2"
              @click="pendingDeleteQuestion=item;pendingDelete=true;"
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
  },
};
</script>
