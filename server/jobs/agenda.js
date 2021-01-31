const Agenda = require('agenda');
const { ObjectID } = require('mongodb');
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

  static async gradeQuiz(attemptId, email, endTime) {
    await this.agenda.schedule(endTime, 'grade quiz', { attemptId, email });
  }

  static async cancelJob(attemptId, email) {
    const jobsCollection = await mongodb.loadCollection('agendaJobs');
    const jobsCursor = await jobsCollection
      .find({ data: { attemptId, email } }).project({ _id: 1 });
    if (await jobsCursor.count()) {
      const jobId = (await jobsCursor.toArray())[0];
      // eslint-disable-next-line no-underscore-dangle
      await this.agenda.cancel({ _id: ObjectID(jobId._id) });
    }
  }
}

module.exports = JobService;
