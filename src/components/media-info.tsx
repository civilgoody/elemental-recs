import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { TMDBSearchResult } from '@/lib/types';

interface MediaInfoProps {
  item: TMDBSearchResult;
  variant?: 'compact' | 'detailed';
  showFullTitle?: boolean;
}

export function MediaInfo({ item, variant = 'compact', showFullTitle = false }: MediaInfoProps) {
  const title = item.title || item.name || '';
  const year = item.display_year;
  const fullTitle = year ? `${title} (${year})` : title;
  
  // For compact variant without showFullTitle, always use line-clamp and show tooltip for longer titles
  const shouldShowTooltip = !showFullTitle && variant === 'compact' && fullTitle.length > 40;

  const TitleComponent = ({ children, className }: { children: React.ReactNode; className: string }) => {
    const baseClassName = showFullTitle ? className : `${className} line-clamp-2`;
    
    if (shouldShowTooltip) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className={baseClassName}>{children}</div>
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-xs">{fullTitle}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }
    return <div className={baseClassName}>{children}</div>;
  };

  if (variant === 'compact') {
    return (
      <div className="flex-1 min-w-0">
        <TitleComponent className="font-medium">
          {fullTitle}
        </TitleComponent>
        <div className="flex items-center gap-2 mt-0.5">
          <Badge variant="outline" className="text-xs">
            {item.media_type === 'movie' ? 'Movie' : 'TV Show'}
          </Badge>
          {item.original_language && item.original_language !== 'en' && (
            <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
              {item.original_language.toUpperCase()}
            </span>
          )}
          {item.vote_average && item.vote_average > 0 && (
            <span className="text-xs text-muted-foreground">
              ⭐ {item.vote_average.toFixed(1)}
            </span>
          )}
        </div>
      </div>
    );
  }

  // Detailed variant for selected items
  return (
    <div className="flex-1 min-w-0">
      <TitleComponent className="font-medium">
        {fullTitle}
      </TitleComponent>
      <Badge variant="secondary" className="text-xs mt-1">
        {item.media_type === 'movie' ? 'Movie' : 'TV Show'}
      </Badge>
    </div>
  );
} 
