'use client';

import { useState, useEffect } from 'react';

interface ViewStats {
  totalViews: number;
  todayUnique: number;
  lastUpdated: string;
}

export function useViewCounter() {
  const [stats, setStats] = useState<ViewStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Increment view count on mount
  useEffect(() => {
    let mounted = true;

    const incrementView = async () => {
      try {
        const response = await fetch('/api/views', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to increment view count');
        }

        const result = await response.json();
        
        if (mounted) {
          setStats({
            totalViews: result.totalViews,
            todayUnique: result.todayUnique,
            lastUpdated: new Date().toISOString()
          });
          setIsLoading(false);
        }
      } catch (err) {
        console.error('View counter error:', err);
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Unknown error');
          setIsLoading(false);
        }
      }
    };

    incrementView();

    return () => {
      mounted = false;
    };
  }, []);

  // Function to manually refresh stats
  const refreshStats = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/views');
      
      if (!response.ok) {
        throw new Error('Failed to fetch view stats');
      }

      const result = await response.json();
      setStats(result);
      setError(null);
    } catch (err) {
      console.error('Error refreshing stats:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    stats,
    isLoading,
    error,
    refreshStats
  };
} 
