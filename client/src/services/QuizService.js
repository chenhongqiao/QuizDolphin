import axios from 'axios';

axios.defaults.withCredentials = true;

const url = `${window.location.origin}/api/quiz/`;

class QuizService {
  static async getQuizAttempt(quizId) {
    const response = await axios.get(`${url}${quizId}/attempt`, {
      withCredentials: true,
    });
    return response.data;
  }

  static async getOngoingAttempt(quizId) {
    const response = await axios.get(`${url}${quizId}/ongoing`, {
      withCredentials: true,
    });
    return response.data;
  }

  static async getAttemptHistory(quizId) {
    let response;
    if (quizId) {
      response = await axios.get(`${url}${quizId}/history`, {
        withCredentials: true,
      });
    } else {
      response = await axios.get(`${url}/history`, {
        withCredentials: true,
      });
    }
    return response.data;
  }

  static async getQuizList() {
    const response = await axios.get(`${url}list`, {
      withCredentials: true,
    });
    return response.data;
  }

  static async getQuizInfo(quizId) {
    const response = await axios.get(`${url}${quizId}/info`, {
      withCredentials: true,
    });
    return response.data;
  }

  static async getQuizQuestions(quizId) {
    const response = await axios.get(`${url}${quizId}/questions`, {
      withCredentials: true,
    });
    return response.data;
  }

  static async postQuizInfo(quizInfo) {
    const response = await axios.post(`${url}`, {
      withCredentials: true,
      data: quizInfo,
    });
    return response.data;
  }

  static async putQuizInfo(quizId, quizInfo) {
    await axios.put(`${url}${quizId}`, {
      withCredentials: true,
      data: quizInfo,
    });
  }
}

export default QuizService;
