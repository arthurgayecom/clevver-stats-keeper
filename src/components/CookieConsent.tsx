
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Cookie, Shield, X } from 'lucide-react';
import { hasConsentedToCookies, setConsentCookie, getCookie, COOKIE_CONSENT_KEY } from '@/lib/cookies';

export const CookieConsent: React.FC = () => {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Check if user has already responded to cookie consent
    const consent = getCookie(COOKIE_CONSENT_KEY);
    if (consent === null) {
      // Show banner after a short delay for better UX
      const timer = setTimeout(() => setShowBanner(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    setConsentCookie(true);
    setShowBanner(false);
  };

  const handleDecline = () => {
    setConsentCookie(false);
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-slide-up">
      <Card variant="elevated" className="max-w-4xl mx-auto p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          
          <div className="flex-1 space-y-2">
            <h3 className="font-display font-bold text-lg text-foreground flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              We value your privacy
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              We use cookies to save your preferences, track your carbon savings progress, and keep you logged in. 
              Your data stays on your device and helps personalize your eco-journey. 
              Accept to enable all features and remember your progress.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <Button
              variant="ghost"
              onClick={handleDecline}
              className="text-muted-foreground hover:text-foreground"
            >
              Decline
            </Button>
            <Button
              variant="eco"
              onClick={handleAccept}
              className="gap-2"
            >
              Accept Cookies
            </Button>
          </div>

          <button
            onClick={handleDecline}
            className="absolute top-4 right-4 md:hidden text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </Card>
    </div>
  );
};
