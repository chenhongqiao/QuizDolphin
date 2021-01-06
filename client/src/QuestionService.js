import axios from 'axios';

axios.defaults.withCredentials = true;

const url = `${window.location.origin}/api/questions/`;

class QuestionService {
  static getQuestions(count, quizId) {
    return new Promise((resolve, reject) => {
      axios.get(url, {
        params: {
          count,
          quizId,
        },
        withCredentials: true,
      }).then((data) => resolve(data))
        .catch((err) => reject(err));
    });
  }
}

export default QuestionService;
