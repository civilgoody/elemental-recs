'use client';

import { Eye, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useViewCounter } from '@/hooks/use-view-counter';

export function ViewCounter() {
  const { stats, isLoading, error } = useViewCounter();

  if (error) {
    return null; // Fail silently for better UX
  }

  if (isLoading) {
    return (
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-1">
          <Eye className="w-4 h-4" />
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toLocaleString();
  };

  return (
    <div className="flex items-center gap-4 text-sm text-muted-foreground">
      <div className="flex items-center gap-1">
        <Eye className="w-4 h-4" />
        <span>{formatNumber(stats.totalViews)} views</span>
      </div>
      
      {stats.todayUnique > 0 && (
        <div className="flex items-center gap-1">
          <Users className="w-4 h-4" />
          <span>{stats.todayUnique} today</span>
        </div>
      )}
      
      {stats.totalViews > 100 && (
        <Badge variant="secondary" className="text-xs">
          Popular 🔥
        </Badge>
      )}
    </div>
  );
} 
