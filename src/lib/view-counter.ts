import { Redis } from '@upstash/redis'

const redis = Redis.fromEnv()

// Get visitor identifier (IP address from request)
function getVisitorId(request: Request): string {
  // Try various headers for IP address
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const cfConnectingIp = request.headers.get('cf-connecting-ip');
  
  return forwarded?.split(',')[0] || realIp || cfConnectingIp || 'unknown';
}

// Get today's date key
function getTodayKey(): string {
  return new Date().toISOString().split('T')[0]; // YYYY-MM-DD
}

// Increment view counter
export async function incrementViews(request: Request) {
  try {
    const visitorId = getVisitorId(request);
    const today = getTodayKey();
    
    // Use Redis pipeline for atomic operations
    const pipeline = redis.pipeline();
    
    // Increment total views
    pipeline.incr('elemental:total_views');
    
    // Add to today's unique visitors set
    pipeline.sadd(`elemental:unique:${today}`, visitorId);
    
    // Set expiration for daily unique data (7 days)
    pipeline.expire(`elemental:unique:${today}`, 7 * 24 * 60 * 60);
    
    const results = await pipeline.exec();
    
    // Get the results
    const totalViews = results[0] as number;
    const todayUniqueCount = await redis.scard(`elemental:unique:${today}`);
    
    return {
      totalViews,
      todayUnique: todayUniqueCount,
      isNewVisitorToday: (await redis.sismember(`elemental:unique:${today}`, visitorId)) === 1
    };
  } catch (error) {
    console.error('Error incrementing views:', error);
    // Return fallback data instead of throwing
    return {
      totalViews: 0,
      todayUnique: 0,
      isNewVisitorToday: false
    };
  }
}

// Get current view stats
export async function getViewStats() {
  try {
    const today = getTodayKey();
    
    const [totalViews, todayUnique] = await Promise.all([
      redis.get('elemental:total_views') || 0,
      redis.scard(`elemental:unique:${today}`)
    ]);
    
    return {
      totalViews: totalViews as number,
      todayUnique,
      lastUpdated: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error getting view stats:', error);
    // Return fallback data instead of throwing
    return {
      totalViews: 0,
      todayUnique: 0,
      lastUpdated: new Date().toISOString()
    };
  }
} 
