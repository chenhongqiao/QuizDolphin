import axios from 'axios';

axios.defaults.withCredentials = true;

const url = `${window.location.origin}/api/quiz/`;

class QuizService {
  static getQuizHistory(quizId) {
    return new Promise((resolve, reject) => {
      axios.get(`${url}${quizId}/history`, {
        withCredentials: true,
      }).then((data) => resolve(data))
        .catch((err) => reject(err));
    });
  }

  static postProgress(progress, quizId) {
    return new Promise((resolve, reject) => {
      axios.post(`${url}${quizId}/progress`, {
        withCredentials: true,
        data: { progress },
      }).then((data) => resolve(data))
        .catch((err) => reject(err));
    });
  }

  static getProgress(quizId, attemptId) {
    return new Promise((resolve, reject) => {
      axios.get(`${url}${quizId}/progress`, {
        withCredentials: true,
        params: { attemptId },
      }).then((data) => resolve(data))
        .catch((err) => reject(err));
    });
  }

  static getQuizList() {
    return new Promise((resolve, reject) => {
      axios.get(`${url}list`)
        .then((data) => resolve(data))
        .catch((err) => reject(err));
    });
  }

  static getQuizQuestions(quizId, newQuiz) {
    return new Promise((resolve, reject) => {
      axios.get(`${url}${quizId}/questions`, {
        params: {
          newQuiz,
        },
        withCredentials: true,
      }).then((data) => resolve(data))
        .catch((err) => reject(err));
    });
  }

  static submitQuiz(quizId, attemptId) {
    return new Promise((resolve, reject) => {
      axios.get(`${url}${quizId}/result`, {
        params: { attemptId },
        withCredentials: true,
      }).then((result) => resolve(result))
        .catch((err) => reject(err));
    });
  }
}

export default QuizService;
