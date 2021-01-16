import axios from 'axios';

axios.defaults.withCredentials = true;

const url = `${window.location.origin}/api/user/`;

class UserService {
  static getSession() {
    return new Promise((resolve, reject) => {
      axios.get(`${url}session`, {
        withCredentials: true,
      }).then((data) => resolve(data))
        .catch((err) => reject(err));
    });
  }

  static postSession(information) {
    return new Promise((resolve, reject) => {
      axios.post(`${url}session`, {
        withCredentials: true,
        data: information,
      }).then((data) => resolve(data))
        .catch((err) => reject(err));
    });
  }

  static deleteSession() {
    return new Promise((resolve, reject) => {
      axios.delete(`${url}session`, {
        withCredentials: true,
      }).then((data) => resolve(data))
        .catch((err) => reject(err));
    });
  }
}

export default UserService;
