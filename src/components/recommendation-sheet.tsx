import { useState, useEffect } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { RecommendationCarousel } from './recommendation-carousel';
import { Recommendation } from '@/lib/types';

interface RecommendationSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  recommendations: Recommendation[];
  initialIndex: number;
}

export function RecommendationSheet({ 
  isOpen, 
  onOpenChange, 
  recommendations, 
  initialIndex 
}: RecommendationSheetProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  // Reset index when sheet opens with new initial index
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
    }
  }, [isOpen, initialIndex]);

  if (recommendations.length === 0) return null;

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader className="text-left">
          <SheetTitle>Recommendation Details</SheetTitle>
          <SheetDescription>
            Explore your personalized recommendations in detail
          </SheetDescription>
        </SheetHeader>
        
        <div className="mt-6">
          <RecommendationCarousel
            recommendations={recommendations}
            currentIndex={currentIndex}
            onIndexChange={setCurrentIndex}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
} 
