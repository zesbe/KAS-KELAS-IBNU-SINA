const Queue = require('bull');
const { sendWhatsAppMessage } = require('./whatsappService');

let messageQueue;

try {
  // Create a queue for WhatsApp messages
  messageQueue = new Queue('whatsapp-messages', {
    redis: {
      port: process.env.REDIS_PORT || 6379,
      host: process.env.REDIS_HOST || 'localhost',
      password: process.env.REDIS_PASSWORD
    }
  });
  
  console.log('Message queue initialized successfully');
  
  // Process messages with configurable delay
  messageQueue.process(async (job) => {
    const { phoneNumber, message, studentId, studentName } = job.data;
    
    console.log(`Processing message for ${studentName} (${phoneNumber})`);
    
    try {
      const result = await sendWhatsAppMessage(phoneNumber, message, studentId);
      
      if (result.success) {
        console.log(`Message sent successfully to ${phoneNumber}`);
        return { success: true, phoneNumber, studentName };
      } else {
        throw new Error(result.error || 'Failed to send message');
      }
    } catch (error) {
      console.error(`Failed to send message to ${phoneNumber}:`, error.message);
      throw error;
    }
  });

  // Handle completed jobs
  messageQueue.on('completed', (job, result) => {
    console.log(`Job ${job.id} completed:`, result);
  });

  // Handle failed jobs
  messageQueue.on('failed', (job, err) => {
    console.error(`Job ${job.id} failed:`, err.message);
  });
  
} catch (error) {
  console.error('Failed to initialize message queue:', error.message);
  console.log('Running without Redis queue - messages will be sent directly');
}

// Add messages to queue with delay
async function addToQueue(messages, delaySeconds = 10) {
  if (!messageQueue) {
    console.warn('Message queue not available, sending messages directly');
    // Send messages directly without queue
    const results = [];
    for (const message of messages) {
      try {
        await sendWhatsAppMessage(message.phoneNumber, message.message, message.studentId);
        results.push({
          studentName: message.studentName,
          phoneNumber: message.phoneNumber,
          status: 'sent'
        });
      } catch (error) {
        results.push({
          studentName: message.studentName,
          phoneNumber: message.phoneNumber,
          status: 'failed',
          error: error.message
        });
      }
    }
    return results;
  }
  
  const jobs = [];
  
  for (let i = 0; i < messages.length; i++) {
    const message = messages[i];
    const delay = i * delaySeconds * 1000; // Convert to milliseconds
    
    const job = await messageQueue.add(message, {
      delay,
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 5000
      },
      removeOnComplete: false,
      removeOnFail: false
    });
    
    jobs.push({
      id: job.id,
      studentName: message.studentName,
      phoneNumber: message.phoneNumber,
      scheduledFor: new Date(Date.now() + delay)
    });
  }
  
  return jobs;
}

// Get queue status
async function getQueueStatus() {
  if (!messageQueue) {
    return {
      waiting: 0,
      active: 0,
      completed: 0,
      failed: 0,
      total: 0,
      queueAvailable: false
    };
  }
  
  const [waiting, active, completed, failed] = await Promise.all([
    messageQueue.getWaitingCount(),
    messageQueue.getActiveCount(),
    messageQueue.getCompletedCount(),
    messageQueue.getFailedCount()
  ]);
  
  return {
    waiting,
    active,
    completed,
    failed,
    total: waiting + active + completed + failed,
    queueAvailable: true
  };
}

// Get job status
async function getJobStatus(jobId) {
  if (!messageQueue) {
    return null;
  }
  
  const job = await messageQueue.getJob(jobId);
  
  if (!job) {
    return null;
  }
  
  const state = await job.getState();
  
  return {
    id: job.id,
    state,
    data: job.data,
    progress: job.progress(),
    createdAt: new Date(job.timestamp),
    processedAt: job.processedOn ? new Date(job.processedOn) : null,
    finishedAt: job.finishedOn ? new Date(job.finishedOn) : null,
    failedReason: job.failedReason
  };
}

// Clear completed jobs older than specified hours
async function cleanOldJobs(hoursOld = 24) {
  if (!messageQueue) {
    return;
  }
  
  const gracePeriod = hoursOld * 60 * 60 * 1000; // Convert to milliseconds
  await messageQueue.clean(gracePeriod, 'completed');
  await messageQueue.clean(gracePeriod, 'failed');
}

// Schedule cleanup every 24 hours
if (messageQueue) {
  setInterval(() => {
    cleanOldJobs(48); // Clean jobs older than 48 hours
  }, 24 * 60 * 60 * 1000);
}

module.exports = {
  messageQueue,
  addToQueue,
  getQueueStatus,
  getJobStatus
};