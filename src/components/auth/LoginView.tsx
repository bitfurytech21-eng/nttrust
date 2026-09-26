import React, { useState } from 'react';
import { AuthenticationLayout } from './AuthenticationLayout';
import { LoginCard } from './LoginCard';
import { NorthernTrustSplashScreen } from './NorthernTrustSplashScreen';

export const LoginView: React.FC = () => {
  // Always show the full Northern Trust green logo animation upon each access
  const [showSplash, setShowSplash] = useState(true);

  return (
    <>
      {showSplash && (
        <NorthernTrustSplashScreen onComplete={() => setShowSplash(false)} />
      )}
      
      <div className={`transition-opacity duration-700 ${showSplash ? 'opacity-0' : 'opacity-100'}`}>
        <AuthenticationLayout activeHeaderTab="signin">
          <LoginCard />
        </AuthenticationLayout>
      </div>
    </>
  );
};
