import axios from 'axios';

axios.defaults.withCredentials = true;

const url = `${window.location.origin}/api/quiz/`;

class QuizService {
  static async getQuizAttempt(quizId) {
    const response = await axios.get(`${url}${quizId}/attempt`, {
      withCredentials: true,
    });
    return response.data.data;
  }

  static async getOngoingAttempt(quizId) {
    const response = await axios.get(`${url}${quizId}/ongoing`, {
      withCredentials: true,
    });
    return response.data.data;
  }

  static async getAttemptHistory(quizId) {
    const response = await axios.get(`${url}${quizId}/history`, {
      withCredentials: true,
    });
    return response.data.data;
  }

  static async getQuizList() {
    const response = await axios.get(`${url}list`, {
      withCredentials: true,
    });
    return response.data.data;
  }

  static async getQuizInfo(quizId) {
    const response = await axios.get(`${url}${quizId}/info`, {
      withCredentials: true,
    });
    return response.data.data;
  }
}

export default QuizService;
