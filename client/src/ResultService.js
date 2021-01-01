import axios from 'axios';

axios.defaults.withCredentials = true;

const url = 'http://localhost:5000/api/grading/';

class ResultService {
  static gradeQuiz(answers) {
    return new Promise((resolve, reject) => {
      axios.post(`${url}`, { data: answers, withCredentials: true }).then((result) => resolve(result))
        .catch((err) => reject(err));
    });
  }
}

export default ResultService;
