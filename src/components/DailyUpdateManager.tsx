'use client';

import { useEffect } from 'react';

export default function DailyUpdateManager() {
  useEffect(() => {
    // Function to trigger daily update
    const triggerDailyUpdate = async () => {
      try {
        console.log('🌅 Triggering daily update...');
        const response = await fetch('/api/system/daily-update', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (response.ok) {
          const result = await response.json();
          console.log('✅ Daily update completed:', result);
        } else {
          console.error('❌ Daily update failed:', response.status);
        }
      } catch (error) {
        console.error('❌ Error triggering daily update:', error);
      }
    };

    // Calculate time until next midnight
    const scheduleNextUpdate = () => {
      const now = new Date();
      const midnight = new Date();
      midnight.setHours(24, 0, 0, 0); // Next midnight
      
      const timeUntilMidnight = midnight.getTime() - now.getTime();
      
      console.log(`🕐 Next daily update scheduled for: ${midnight.toLocaleString()}`);
      console.log(`⏰ Time until update: ${Math.round(timeUntilMidnight / (1000 * 60 * 60))} hours`);
      
      // Schedule update at midnight
      setTimeout(() => {
        triggerDailyUpdate().then(() => {
          // Schedule the next update
          scheduleNextUpdate();
        });
      }, timeUntilMidnight);
    };    // Check if we should run initial update (if it's been more than 23 hours since last check)
    const checkForInitialUpdate = async () => {
      // Only run on client side
      if (typeof window === 'undefined') return;
      
      try {
        const lastUpdateKey = 'maskio-last-daily-update';
        const lastUpdate = localStorage.getItem(lastUpdateKey);
        const now = Date.now();
        
        if (!lastUpdate || (now - parseInt(lastUpdate)) > 23 * 60 * 60 * 1000) {
          console.log('🔄 Performing initial daily update check...');
          await triggerDailyUpdate();
          localStorage.setItem(lastUpdateKey, now.toString());
        }
      } catch (error) {
        console.log('Note: Initial update check skipped (likely due to localStorage limitations)');
      }
    };

    // Initialize the daily update system
    checkForInitialUpdate();
    scheduleNextUpdate();
    
    // Cleanup is not needed for this component as it should run for the entire app lifecycle
    return () => {
      console.log('🔄 Daily update manager cleanup');
    };
  }, []);

  // This component doesn't render anything visible
  return null;
}
