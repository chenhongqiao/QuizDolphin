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

  static getOngoing() {
    return new Promise((resolve, reject) => {
      axios.get(`${url}ongoingquestion`, {
        withCredentials: true,
      }).then((data) => resolve(data))
        .catch((err) => reject(err));
    });
  }

  static postProgress(quizProgress) {
    return new Promise((resolve, reject) => {
      axios.post(`${url}ongoing`, {
        withCredentials: true,
        data: quizProgress,
      }).then((data) => resolve(data))
        .catch((err) => reject(err));
    });
  }

  static getProgress() {
    return new Promise((resolve, reject) => {
      axios.get(`${url}ongoing`, {
        withCredentials: true,
      }).then((data) => resolve(data))
        .catch((err) => reject(err));
    });
  }
}

export default QuizService;
