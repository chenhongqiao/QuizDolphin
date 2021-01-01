import axios from 'axios';

axios.defaults.withCredentials = true;

const url = 'http://localhost:5000/api/quiz/';

class QuizService {
  static getQuizHistory() {
    return new Promise((resolve, reject) => {
      axios.get(`${url}history`, {
        withCredentials: true,
      }).then((data) => resolve(data))
        .catch((err) => reject(err));
    });
  }
}

export default QuizService;
