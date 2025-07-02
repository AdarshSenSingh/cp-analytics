const cron = require('node-cron');
const User = require('../models/User');
const platformsRouter = require('../routes/platforms');

// Get the sync functions from the platforms router
const { syncCodeforces } = platformsRouter;

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
}

module.exports = { initScheduler };
