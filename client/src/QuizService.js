import axios from 'axios';

axios.defaults.withCredentials = true;

const url = `${window.location.origin}/api/quiz/`;

class QuizService {
  static getQuizHistory(quizId) {
    return new Promise((resolve, reject) => {
      axios.get(`${url}history`, {
        withCredentials: true,
        params: { quizId },
      }).then((data) => resolve(data))
        .catch((err) => reject(err));
    });
  }

  static getOngoing(quizId) {
    return new Promise((resolve, reject) => {
      axios.get(`${url}ongoingquestion`, {
        withCredentials: true,
        params: { quizId },
      }).then((data) => resolve(data))
        .catch((err) => reject(err));
    });
  }

  static postProgress(quizProgress, quizId) {
    return new Promise((resolve, reject) => {
      axios.post(`${url}ongoing`, {
        withCredentials: true,
        data: { quizProgress, quizId },
      }).then((data) => resolve(data))
        .catch((err) => reject(err));
    });
  }

  static getProgress(quizId) {
    return new Promise((resolve, reject) => {
      axios.get(`${url}ongoing`, {
        withCredentials: true,
        params: { quizId },
      }).then((data) => resolve(data))
        .catch((err) => reject(err));
    });
  }

  static getQuizList() {
    return new Promise((resolve, reject) => {
      axios.get(`${url}`)
        .then((data) => resolve(data))
        .catch((err) => reject(err));
    });
  }
}

export default QuizService;
