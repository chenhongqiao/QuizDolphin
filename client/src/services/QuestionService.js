import axios from 'axios';

axios.defaults.withCredentials = true;

const url = `${window.location.origin}/api/question/`;

class QuestionService {
  static async getQuestion(questionId) {
    await axios.get(`${url}${questionId}`, {
      withCredentials: true,
    });
  }
}

export default QuestionService;
