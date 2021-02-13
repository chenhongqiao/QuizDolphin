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

  static async getUserList() {
    const response = await axios.get(`${url}list`, {
      withCredentials: true,
    });
    return response.data;
  }

  static async getUserInfo(email) {
    const response = await axios.get(`${url}${email}`, {
      withCredentials: true,
    });
    return response.data;
  }

  static async putUserInfo(email, userInfo) {
    await axios.put(`${url}${email}`, {
      withCredentials: true,
      data: userInfo,
    });
  }

  static async postUserInfo(userInfo) {
    await axios.post(`${url}`, {
      withCredentials: true,
      data: userInfo,
    });
  }
}

export default UserService;
