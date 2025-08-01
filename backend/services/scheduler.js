const cron = require('node-cron');
const User = require('../models/User');
const Target = require('../models/Target');
const nodemailer = require('nodemailer');
const platformsRouter = require('../routes/platforms');

// Get the sync functions from the platforms router
const { syncCodeforces } = platformsRouter;

// Configure nodemailer with Gmail SMTP
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // set in .env
    pass: process.env.EMAIL_PASS  // set in .env (App Password)
  }
});

// Schedule tasks to run at specific intervals
function initScheduler() {
  // Sync Codeforces data every 6 hours
  cron.schedule('0 */6 * * *', async () => {
    console.log('Running scheduled Codeforces sync...');
    try {
      // Find all users with Codeforces accounts
      const users = await User.find({
        'platformAccounts.platform': 'codeforces'
      });
      
      console.log(`Found ${users.length} users with Codeforces accounts`);
      
      // Sync each user's Codeforces data
      for (const user of users) {
        try {
          const codeforcesAccount = user.platformAccounts.find(acc => acc.platform === 'codeforces');
          
          if (codeforcesAccount) {
            console.log(`Syncing Codeforces data for user ${user.username} (${codeforcesAccount.username})`);
            
            // Add user ID to the account object for the sync function
            const accountWithUser = {
              ...codeforcesAccount,
              user: user._id
            };
            
            await syncCodeforces(accountWithUser);
            
            // Update last synced timestamp
            const accountIndex = user.platformAccounts.findIndex(acc => acc.platform === 'codeforces');
            user.platformAccounts[accountIndex].lastSynced = new Date();
            await user.save();
            
            console.log(`Sync completed for user ${user.username}`);
          }
        } catch (err) {
          console.error(`Error syncing Codeforces for user ${user.username}:`, err.message);
        }
      }
    } catch (err) {
      console.error('Error in scheduled Codeforces sync:', err.message);
    }
  });

  // Email reminder for daily/custom targets (runs every minute)
  cron.schedule('* * * * *', async () => {
    const now = new Date();
    // Calculate the time 5 minutes from now
    const reminderTime = new Date(now.getTime() + 5 * 60000);
    const reminderHHMM = reminderTime.toTimeString().slice(0, 5); // 'HH:mm'
    const currentHHMM = now.toTimeString().slice(0, 5);
    try {
      // Log the check
      console.log(`[Scheduler] Checking for contest reminders at ${currentHHMM} (for contestTime ${reminderHHMM})`);
      // Find contest targets where contestTime is 5 minutes from now
      const contestTargets = await Target.find({ targetType: 'contest', contestTime: reminderHHMM });
      for (const target of contestTargets) {
        try {
          await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: target.email,
            subject: 'Contest Reminder',
            text: `Reminder: Your contest is scheduled at ${target.contestTime}. Get ready!`
          });
          console.log(`[Scheduler] Sent contest reminder to ${target.email} for contest at ${target.contestTime}`);
        } catch (err) {
          console.error(`[Scheduler] Error sending contest reminder to ${target.email}:`, err.message);
        }
      }
      // (Optional) Add similar logic for problems targets if needed
    } catch (err) {
      console.error('[Scheduler] Error sending target reminders:', err.message);
    }
  });
}

module.exports = { initScheduler };
