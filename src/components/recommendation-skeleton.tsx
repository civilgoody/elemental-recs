import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Waves, Wind, Flame, Mountain } from 'lucide-react';

interface RecommendationSkeletonProps {
  index: number;
}

export function RecommendationSkeleton({ index }: RecommendationSkeletonProps) {
  const getElementIcon = (index: number) => {
    const icons = [Waves, Wind, Flame, Mountain, Waves];
    const Icon = icons[index % icons.length];
    return <Icon className="w-5 h-5 text-muted-foreground animate-pulse" />;
  };

  const getElementColor = (index: number) => {
    const colors = [
      'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    ];
    return colors[index % colors.length];
  };

  return (
    <Card className="flex flex-col h-full border-l-4 border-l-primary/30 overflow-hidden animate-pulse">
      {/* Image Skeleton */}
      <div className="relative w-full h-48 bg-muted">
        <Skeleton className="w-full h-full" />
        
        {/* Badge skeleton overlay */}
        <div className="absolute top-3 right-3">
          <Badge variant="secondary" className={`${getElementColor(index)} opacity-50`}>
            <Skeleton className="w-3 h-3 mr-1" />
            <Skeleton className="w-12 h-3" />
          </Badge>
        </div>
      </div>

      <CardHeader className="flex-shrink-0 pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            {getElementIcon(index)}
            <CardTitle className="text-lg leading-tight">
              <Skeleton className="w-32 h-5" />
            </CardTitle>
          </div>
        </div>
        <div className="flex items-center justify-between gap-2">
          <Skeleton className="w-12 h-4" />
          <Skeleton className="w-16 h-4" />
        </div>
      </CardHeader>

      <CardContent className="flex flex-col flex-1 space-y-4">
        {/* Reasoning skeleton */}
        <div className="flex-1 space-y-2">
          <Skeleton className="w-full h-4" />
          <Skeleton className="w-full h-4" />
          <Skeleton className="w-3/4 h-4" />
          <Skeleton className="w-5/6 h-4" />
        </div>
        
        {/* Action buttons skeleton */}
        <div className="space-y-2 mt-auto">
          <Skeleton className="w-full h-9" />
          <Skeleton className="w-full h-9" />
        </div>
      </CardContent>
    </Card>
  );
} 
