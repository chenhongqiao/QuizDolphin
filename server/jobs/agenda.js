const Agenda = require('agenda');
const mongodb = require('../databases/mongodb');

const gradingService = require('../services/grading');

class JobService {
  static agenda;

  static async connect() {
    this.agenda = new Agenda({ mongo: mongodb.client.db('test') });
    this.agenda.define('grade quiz', async (job, done) => {
      const { attemptId } = job.attrs.data;
      const { email } = job.attrs.data;
      await gradingService.gradeQuiz(attemptId, email);
      done();
      job.remove();
    });
    await this.agenda.start();
  }

  static async gradeQuiz(attemptId, email, seconds) {
    await this.agenda.schedule(`in ${seconds} seconds`, 'grade quiz', { attemptId, email });
  }
}

module.exports = JobService;
