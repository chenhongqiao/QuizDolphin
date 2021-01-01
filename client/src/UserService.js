import axios from 'axios';

axios.defaults.withCredentials = true;

const url = 'http://localhost:5000/api/users/';

class UserService {
  static getUserStatus() {
    return new Promise((resolve, reject) => {
      axios.get(`${url}status`, {
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
}

export default UserService;
