'use client';
import { X, ArrowRight } from 'lucide-react';
import { useState } from 'react';

interface PromoBannerProps {
  message?: string;
  ctaText?: string;
  onCtaClick?: () => void;
}

const PromoBanner = ({
  message = 'Earn up to 10% on stables on minimask Earn',
  ctaText = 'Check it out',
  onCtaClick
}: PromoBannerProps) => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-primary/20 to-accent/20 border border-primary/30 p-3 mb-4">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-foreground flex-1">{message}</p>

        <div className="flex items-center gap-2">
          {onCtaClick && (
            <button
              onClick={onCtaClick}
              className="flex items-center gap-1 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
            >
              {ctaText}
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={() => setDismissed(true)}
            className="p-1 rounded-full hover:bg-secondary transition-colors"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Decorative gradient orb */}
      <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
    </div>
  );
};

export { PromoBanner };
