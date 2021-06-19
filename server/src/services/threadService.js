const mongodb = require('../databases/mongodb');
const nanoidUtils = require('../utils/nanoidUtil');
const threadModel = require('../models/threadModel');

class ThreadService {
  static async newQuestion(email, question) {
    const threadsCollection = mongodb.loadCollection('threads');
    let threadId = nanoidUtils.charId();
    // Make sure id does not duplicate
    // eslint-disable-next-line no-await-in-loop
    while (await threadsCollection.findOne({ threadId })) {
      threadId = nanoidUtils.charId();
    }
    const threadContext = new threadModel.Thread(email, question, '', threadId);
    if (threadContext.invalid) {
      return { success: false, message: 'Invalid Thread Syntax!' };
    }

    threadsCollection.insertOne(threadContext);
    return { success: true, data: threadId };
  }

  static async postAnswer(threadId, answer) {
    const threadsCollection = mongodb.loadCollection('threads');
    const threadContext = threadsCollection.findOne({ threadId });
    if (!threadContext) {
      return { success: false, message: 'No Such Question!' };
    }
    const answeredThread = new threadModel.Thread(threadContext.email,
      threadContext.question, answer, threadContext.threadId);
    if (answeredThread.invalid) {
      return { success: false, message: 'Invalid Thread Syntax!' };
    }
    await threadsCollection.updateOne({ threadId }, { $set: answeredThread });
    return { success: true, data: threadId };
  }

  static async deleteThread(threadId) {
    const threadsCollection = mongodb.loadCollection('threads');
    const status = await threadsCollection.deleteOne({ threadId });
    // 404 if no matching question
    if (status.deletedCount === 0) {
      return { success: false, message: 'No Matching Thread!' };
    }
    return { success: true };
  }
}

module.exports = ThreadService;
