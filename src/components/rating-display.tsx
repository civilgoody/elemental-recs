import { Star } from 'lucide-react';

interface RatingDisplayProps {
  rating?: number;
  voteCount?: number;
  size?: 'sm' | 'md' | 'lg';
  showVoteCount?: boolean;
}

export function RatingDisplay({ 
  rating, 
  voteCount, 
  size = 'sm', 
  showVoteCount = true 
}: RatingDisplayProps) {
  if (!rating) return null;

  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  // Convert 10-point scale to 5-star scale
  const starRating = (rating / 10) * 5;
  const fullStars = Math.floor(starRating);
  const hasHalfStar = starRating % 1 >= 0.5;

  const formatVoteCount = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  };

  return (
    <div className={`flex items-center gap-1 ${sizeClasses[size]}`}>
      <div className="flex items-center">
        {/* Full stars */}
        {Array.from({ length: fullStars }).map((_, i) => (
          <Star 
            key={i} 
            className={`${iconSizes[size]} fill-yellow-400 text-yellow-400`} 
          />
        ))}
        
        {/* Half star */}
        {hasHalfStar && (
          <div className="relative">
            <Star className={`${iconSizes[size]} text-gray-300`} />
            <div className="absolute inset-0 overflow-hidden w-1/2">
              <Star className={`${iconSizes[size]} fill-yellow-400 text-yellow-400`} />
            </div>
          </div>
        )}
        
        {/* Empty stars */}
        {Array.from({ length: 5 - fullStars - (hasHalfStar ? 1 : 0) }).map((_, i) => (
          <Star 
            key={i + fullStars + (hasHalfStar ? 1 : 0)} 
            className={`${iconSizes[size]} text-gray-300`} 
          />
        ))}
      </div>
      
      <span className="text-muted-foreground font-medium">
        {rating.toFixed(1)}
      </span>
      
      {showVoteCount && voteCount && voteCount > 0 && (
        <span className="text-muted-foreground">
          ({formatVoteCount(voteCount)})
        </span>
      )}
    </div>
  );
} 
