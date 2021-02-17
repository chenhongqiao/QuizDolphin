/* eslint-disable*/
const state = {
  role: '',
  userTab: '',
  adminTab: '',
  id: ''
};

const mutations = {
  changeRole(currentState, info) {
    currentState.role = info.role;
    currentState.id = info.id;
  },
  clearState(currentState){
    currentState.role = '';
    currentState.id = '';
    currentState.userTab = '';
    currentState.adminTab = '';
  }
};

export default {
  namespaced: true,
  state,
  mutations,
};
