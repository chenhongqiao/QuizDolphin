/* eslint-disable no-param-reassign */
const state = {
  navigation: [],
};

const mutations = {
  replace(currentState, nav) {
    while (currentState.navigation.length > nav.index) {
      currentState.navigation.pop();
    }
    currentState.navigation.push(nav.info);
  },
};

export default {
  namespaced: true,
  state,
  mutations,
};
