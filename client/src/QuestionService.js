import axios from 'axios';

axios.defaults.withCredentials = true;

const url = 'http://192.168.0.230:5000/api/questions/';

class QuestionService {
  static getQuestions(count) {
    return new Promise((resolve, reject) => {
      axios.get(url, {
        params: {
          count,
        },
        withCredentials: true,
      }).then((data) => resolve(data))
        .catch((err) => reject(err));
    });
  }
}

export default QuestionService;
