import axios from 'axios';

axios.defaults.withCredentials = true;

const url = `${window.location.origin}/api/question/`;

class QuestionService {
  static async getQuestion(questionId) {
    const response = await axios.get(`${url}${questionId}`, {
      withCredentials: true,
    });
    return response.data;
  }

  static async putQuestion(questionId, questionData) {
    await axios.put(`${url}${questionId}`, {
      withCredentials: true,
      data: questionData,
    });
  }

  static async postQuestion(questionData) {
    await axios.post(`${url}`, {
      withCredentials: true,
      data: questionData,
    });
  }

  static async deleteQuestion(questionId) {
    await axios.delete(`${url}${questionId}`, {
      withCredentials: true,
    });
  }
}

export default QuestionService;
