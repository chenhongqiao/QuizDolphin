const Agenda = require('agenda');
const { ObjectID } = require('mongodb');
const mongodb = require('../databases/mongodb');

const gradingService = require('../services/gradingService');

class JobService {
  static agenda;

  static async connect() {
    // Connect to job services
    this.agenda = new Agenda({ mongo: mongodb.client.db('test') });
    // Define grade quiz job
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
      // Get jobID from database
      const jobId = (await jobsCursor.toArray())[0];
      // eslint-disable-next-line no-underscore-dangle
      await this.agenda.cancel({ _id: ObjectID(jobId._id) });
    }
  }
}

module.exports = JobService;
