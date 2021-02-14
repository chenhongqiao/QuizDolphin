import axios from 'axios';

axios.defaults.withCredentials = true;

const url = `${window.location.origin}/api/result/`;

class ResultService {
  static async getResult(attemptId, admin) {
    let response;
    if (admin) {
      response = await axios.get(`${url}${attemptId}?admin=true`, {
        withCredentials: true,
      });
    } else {
      response = await axios.get(`${url}${attemptId}`, {
        withCredentials: true,
      });
    }
    return response.data;
  }
}

export default ResultService;
