/**
 * CLIENT-SIDE RATE LIMITING UTILITY
 * Prevents API abuse, spam, and excessive user actions
 */

class RateLimiter {
  constructor() {
    this.actions = new Map();
    this.maxRetries = 3;
  }

  /**
   * Check if action is allowed based on rate limits
   */
  checkLimit(actionType, userId, limits = {}) {
    const defaultLimits = {
      // Action limits per time window
      addItem: { max: 5, window: 300000 },           // 5 items per 5 minutes
      sendMessage: { max: 30, window: 60000 },       // 30 messages per minute
      uploadFile: { max: 10, window: 600000 },       // 10 files per 10 minutes
      login: { max: 5, window: 900000 },             // 5 login attempts per 15 minutes
      signup: { max: 3, window: 3600000 },           // 3 signups per hour (same IP)
      flagReport: { max: 10, window: 3600000 },      // 10 flags per hour
      bugReport: { max: 5, window: 1800000 },        // 5 bug reports per 30 minutes
      profileUpdate: { max: 10, window: 300000 },    // 10 profile updates per 5 minutes
      adminAction: { max: 50, window: 300000 }       // 50 admin actions per 5 minutes
    };

    const actionLimits = { ...defaultLimits, ...limits };
    const limit = actionLimits[actionType];
    
    if (!limit) {
      // Unknown action type - allow but log warning
      console.warn(`Unknown action type for rate limiting: ${actionType}`);
      return { allowed: true };
    }

    const key = `${actionType}_${userId}`;
    const now = Date.now();
    
    // Get or create action history
    if (!this.actions.has(key)) {
      this.actions.set(key, []);
    }
    
    const actionHistory = this.actions.get(key);
    
    // Remove expired actions (outside time window)
    const validActions = actionHistory.filter(
      timestamp => now - timestamp < limit.window
    );
    
    // Update the action history
    this.actions.set(key, validActions);
    
    // Check if limit exceeded
    if (validActions.length >= limit.max) {
      const oldestAction = Math.min(...validActions);
      const waitTime = limit.window - (now - oldestAction);
      
      return {
        allowed: false,
        remainingTime: Math.ceil(waitTime / 1000), // seconds
        maxActions: limit.max,
        windowMinutes: Math.ceil(limit.window / 60000),
        message: `For mange forsøg. Prøv igen om ${Math.ceil(waitTime / 60000)} minutter.`
      };
    }
    
    // Record this action
    validActions.push(now);
    this.actions.set(key, validActions);
    
    return {
      allowed: true,
      remaining: limit.max - validActions.length,
      resetsIn: Math.ceil(limit.window / 1000)
    };
  }

  /**
   * Check if user is performing actions too quickly (burst detection)
   */
  checkBurstLimit(actionType, userId, burstLimit = 3, burstWindow = 5000) {
    const key = `burst_${actionType}_${userId}`;
    const now = Date.now();
    
    if (!this.actions.has(key)) {
      this.actions.set(key, []);
    }
    
    const burstHistory = this.actions.get(key);
    
    // Remove old burst actions
    const recentActions = burstHistory.filter(
      timestamp => now - timestamp < burstWindow
    );
    
    if (recentActions.length >= burstLimit) {
      return {
        allowed: false,
        message: 'Du udfører handlinger for hurtigt. Vent et øjeblik.',
        waitTime: 5 // seconds
      };
    }
    
    recentActions.push(now);
    this.actions.set(key, recentActions);
    
    return { allowed: true };
  }

  /**
   * Get user's current rate limit status
   */
  getStatus(actionType, userId) {
    const key = `${actionType}_${userId}`;
    const now = Date.now();
    
    if (!this.actions.has(key)) {
      return { actionsUsed: 0, resetsIn: 0 };
    }
    
    const actionHistory = this.actions.get(key);
    const defaultLimits = {
      addItem: { max: 5, window: 300000 },
      sendMessage: { max: 30, window: 60000 },
      uploadFile: { max: 10, window: 600000 }
    };
    
    const limit = defaultLimits[actionType];
    if (!limit) return { actionsUsed: 0, resetsIn: 0 };
    
    const validActions = actionHistory.filter(
      timestamp => now - timestamp < limit.window
    );
    
    const oldestAction = validActions.length > 0 ? Math.min(...validActions) : now;
    const resetsIn = Math.max(0, limit.window - (now - oldestAction));
    
    return {
      actionsUsed: validActions.length,
      maxActions: limit.max,
      resetsIn: Math.ceil(resetsIn / 1000),
      resetTime: new Date(now + resetsIn)
    };
  }

  /**
   * Clear rate limit history for a user (admin function)
   */
  clearUserLimits(userId) {
    const keysToDelete = [];
    for (const key of this.actions.keys()) {
      if (key.endsWith(`_${userId}`)) {
        keysToDelete.push(key);
      }
    }
    keysToDelete.forEach(key => this.actions.delete(key));
  }

  /**
   * Clean up old entries to prevent memory leaks
   */
  cleanup() {
    const now = Date.now();
    const maxAge = 3600000; // 1 hour
    
    for (const [key, timestamps] of this.actions.entries()) {
      const validTimestamps = timestamps.filter(
        timestamp => now - timestamp < maxAge
      );
      
      if (validTimestamps.length === 0) {
        this.actions.delete(key);
      } else {
        this.actions.set(key, validTimestamps);
      }
    }
  }
}

// Create global rate limiter instance
const rateLimiter = new RateLimiter();

// Auto cleanup every 10 minutes
setInterval(() => {
  rateLimiter.cleanup();
}, 600000);

/**
 * Easy-to-use wrapper functions
 */
export const checkRateLimit = (actionType, userId, customLimits) => {
  return rateLimiter.checkLimit(actionType, userId, customLimits);
};

export const checkBurstLimit = (actionType, userId, burstLimit, burstWindow) => {
  return rateLimiter.checkBurstLimit(actionType, userId, burstLimit, burstWindow);
};

export const getRateLimitStatus = (actionType, userId) => {
  return rateLimiter.getStatus(actionType, userId);
};

export const clearUserRateLimits = (userId) => {
  return rateLimiter.clearUserLimits(userId);
};

export default rateLimiter; 