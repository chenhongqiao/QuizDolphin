import axios from 'axios';

axios.defaults.withCredentials = true;

const url = `${window.location.origin}/api/grading/`;

class ResultService {
  static gradeQuiz(answers, quizId) {
    return new Promise((resolve, reject) => {
      axios.post(`${url}`, {
        data: { answers, quizId },
        withCredentials: true,
      }).then((result) => resolve(result))
        .catch((err) => reject(err));
    });
  }
}

export default ResultService;
