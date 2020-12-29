import axios from 'axios';

const url = 'http://192.168.0.230:5000/api/grading/';

class ResultService {
  static gradeQuiz(answers) {
    return new Promise((resolve, reject) => {
      axios.post(`${url}`, { answers }).then((result) => resolve(result))
        .catch((err) => reject(err));
    });
  }
}

export default ResultService;
