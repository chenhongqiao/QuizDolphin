import axios from 'axios';

axios.defaults.withCredentials = true;

const url = `${window.location.origin}/api/users/`;

class UserService {
  static getCurrentUser() {
    return new Promise((resolve, reject) => {
      axios.get(`${url}current`, {
        withCredentials: true,
      }).then((data) => resolve(data))
        .catch((err) => reject(err));
    });
  }

  static login(information) {
    return new Promise((resolve, reject) => {
      axios.post(`${url}login`, {
        withCredentials: true,
        data: information,
      }).then((data) => resolve(data))
        .catch((err) => reject(err));
    });
  }

  static logout() {
    return new Promise((resolve, reject) => {
      axios.post(`${url}logout`, {
        withCredentials: true,
      }).then((data) => resolve(data))
        .catch((err) => reject(err));
    });
  }
}

export default UserService;
