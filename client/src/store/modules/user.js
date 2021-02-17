/* eslint-disable no-param-reassign */
const state = {
  email: '',
  name: '',
  role: '',
};

const mutations = {
  login(currentState, info) {
    currentState.email = info.email;
    currentState.name = info.name;
    currentState.role = info.role;
  },

  logout(currentState) {
    currentState.email = '';
    currentState.name = '';
    currentState.role = '';
  },
};

const getters = {
  status(currentState) {
    if (currentState.email && currentState.name && currentState.role) {
      return true;
    }
    return false;
  },
};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
};
