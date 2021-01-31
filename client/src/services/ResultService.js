import axios from 'axios';

axios.defaults.withCredentials = true;

const url = `${window.location.origin}/api/result/`;

class ResultService {
  static async getResult(attemptId) {
    const response = await axios.get(`${url}${attemptId}`, {
      withCredentials: true,
    });
    return response.data.data;
  }
}

export default ResultService;
