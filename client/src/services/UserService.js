import axios from 'axios';

axios.defaults.withCredentials = true;

const url = `${window.location.origin}/api/user/`;

class UserService {
  static async getSessionInfo() {
    const response = await axios.get(`${url}session`, {
      withCredentials: true,
    });
    return response.data;
  }

  static async postSession(loginInfo) {
    const response = await axios.post(`${url}session`, {
      withCredentials: true,
      data: loginInfo,
    });
    return response.data;
  }

  static async deleteSession() {
    const response = await axios.delete(`${url}session`, {
      withCredentials: true,
    });
    return response.data;
  }
}

export default UserService;
