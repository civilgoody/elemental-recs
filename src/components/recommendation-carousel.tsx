import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { RecommendationDetails } from './recommendation-details';
import { Recommendation } from '@/lib/types';

interface RecommendationCarouselProps {
  recommendations: Recommendation[];
  currentIndex: number;
  onIndexChange: (index: number) => void;
}

export function RecommendationCarousel({ 
  recommendations, 
  currentIndex, 
  onIndexChange 
}: RecommendationCarouselProps) {
  const handlePrevious = () => {
    const newIndex = currentIndex > 0 ? currentIndex - 1 : recommendations.length - 1;
    onIndexChange(newIndex);
  };

  const handleNext = () => {
    const newIndex = currentIndex < recommendations.length - 1 ? currentIndex + 1 : 0;
    onIndexChange(newIndex);
  };

  if (recommendations.length === 0) return null;

  return (
    <div className="space-y-4">
      {/* Navigation Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {currentIndex + 1} of {recommendations.length}
          </span>
        </div>
        
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={handlePrevious}
            disabled={recommendations.length <= 1}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleNext}
            disabled={recommendations.length <= 1}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Current Recommendation */}
      <RecommendationDetails 
        recommendation={recommendations[currentIndex]} 
        index={currentIndex} 
      />

      {/* Dots Indicator */}
      {recommendations.length > 1 && (
        <div className="flex justify-center gap-2 pt-4">
          {recommendations.map((_, index) => (
            <button
              key={index}
              onClick={() => onIndexChange(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentIndex 
                  ? 'bg-primary' 
                  : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
              }`}
              aria-label={`Go to recommendation ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
} 
 