// In-memory store for active sessions
let activeSessions = [];

// Session expiration time (30 minutes)
const SESSION_EXPIRY_TIME = 30 * 60 * 1000;

/**
 * Add a new active session
 * @param {Object} session - Session object
 * @returns {Object} - Added session with metadata
 */
export const addActiveSession = (session) => {
  const sessionWithMeta = {
    ...session,
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + SESSION_EXPIRY_TIME),
    isActive: true
  };
  
  activeSessions.push(sessionWithMeta);
  console.log(`Active session added: ${session.subject} - ${session.session_id}`);
  
  // Auto-expire session after timeout
  setTimeout(() => {
    removeActiveSession(session.session_id);
  }, SESSION_EXPIRY_TIME);
  
  return sessionWithMeta;
};

/**
 * Get all active sessions
 * @returns {Array} - Array of active sessions
 */
export const getActiveSessions = () => {
  // Filter out expired sessions
  const now = new Date();
  activeSessions = activeSessions.filter(session => 
    session.isActive && session.expiresAt > now
  );
  
  return activeSessions;
};

/**
 * Get session by ID
 * @param {string} sessionId - Session ID
 * @returns {Object|null} - Session object or null if not found
 */
export const getSessionById = (sessionId) => {
  const now = new Date();
  return activeSessions.find(session => 
    session.session_id === sessionId && 
    session.isActive && 
    session.expiresAt > now
  ) || null;
};

/**
 * Remove active session
 * @param {string} sessionId - Session ID to remove
 * @returns {boolean} - True if removed, false if not found
 */
export const removeActiveSession = (sessionId) => {
  const index = activeSessions.findIndex(session => session.session_id === sessionId);
  
  if (index !== -1) {
    activeSessions[index].isActive = false;
    console.log(`Active session removed: ${sessionId}`);
    return true;
  }
  
  return false;
};

/**
 * Clear all active sessions
 */
export const clearAllActiveSessions = () => {
  activeSessions = [];
  console.log('All active sessions cleared');
};

/**
 * Get session statistics
 * @returns {Object} - Session statistics
 */
export const getSessionStats = () => {
  const now = new Date();
  const activeCount = activeSessions.filter(session => 
    session.isActive && session.expiresAt > now
  ).length;
  
  return {
    total: activeSessions.length,
    active: activeCount,
    expired: activeSessions.length - activeCount
  };
};

// Clean up expired sessions every 5 minutes
setInterval(() => {
  const now = new Date();
  const beforeCount = activeSessions.length;
  
  activeSessions = activeSessions.filter(session => 
    session.isActive && session.expiresAt > now
  );
  
  const afterCount = activeSessions.length;
  const removedCount = beforeCount - afterCount;
  
  if (removedCount > 0) {
    console.log(`Cleaned up ${removedCount} expired sessions`);
  }
}, 5 * 60 * 1000);
