import axios from 'axios';

axios.defaults.withCredentials = true;

const url = `${window.location.origin}/api/thread/`;

class ThreadService {
  static async getThreads() {
    const response = await axios.get(url, {
      withCredentials: true,
    });
    return response.data;
  }

  static async postAnswer(threadId, answer) {
    const response = await axios.put(`${url}${threadId}/answer`, {
      withCredentials: true,
      data: answer,
    });
    return response.data;
  }

  static async postQuestion(question) {
    const response = await axios.post(`${url}question`, {
      withCredentials: true,
      data: question,
    });
    return response.data;
  }

  static async deleteThread(threaId) {
    const response = await axios.delete(`${url}${threaId}`, {
      withCredentials: true,
    });
    return response.data;
  }
}

export default ThreadService;
