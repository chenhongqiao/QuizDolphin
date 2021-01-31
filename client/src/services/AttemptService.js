import axios from 'axios';

axios.defaults.withCredentials = true;

const url = `${window.location.origin}/api/attempt/`;

class AttemptService {
  static async getAttemptData(attemptId) {
    const response = await axios.get(`${url}${attemptId}`, {
      withCredentials: true,
    });
    return response.data.data;
  }

  static async getAttemptProgress(attemptId) {
    const response = await axios.get(`${url}${attemptId}/progress`, {
      withCredentials: true,
    });
    return response.data.data;
  }

  static async putAttemptProgress(attemptId, progress) {
    await axios.put(`${url}${attemptId}/progress`, {
      withCredentials: true,
      data: progress,
    });
  }

  static async postAttempt(attemptId) {
    await axios.post(`${url}${attemptId}`, {
      withCredentials: true,
    });
  }
}

export default AttemptService;
