import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import defaultLogo from '../assets/images/qukebasket-logo.svg';

interface SplashScreenProps {
  onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  // Load official uploaded QukeBasket vector logo
  const [logoSrc, setLogoSrc] = useState<string>('/qukebasket-logo.svg');

  useEffect(() => {
    // Quick, smooth app initialization timer (1.8s)
    const timer = setTimeout(() => {
      onFinish();
    }, 1800);

    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <motion.div
      id="qukebasket-splash-screen"
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.99 }}
      transition={{ duration: 0.35, ease: 'easeInOut' }}
      className="absolute inset-0 z-50 bg-[#fcfcfc] flex flex-col items-center justify-center p-6 select-none"
    >
      <div className="flex flex-col items-center justify-center -mt-8">
        {/* Centered QukeBasket Logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          className="flex items-center justify-center"
        >
          <img
            id="splash-brand-logo"
            src={logoSrc}
            alt="QukeBasket"
            referrerPolicy="no-referrer"
            onError={() => {
              if (logoSrc === '/qukebasket-logo.png') {
                setLogoSrc('/logo.png');
              } else if (logoSrc === '/logo.png') {
                setLogoSrc(defaultLogo);
              }
            }}
            className="w-56 max-w-[240px] h-auto object-contain select-none pointer-events-none"
          />
        </motion.div>

        {/* Subtle, Smooth Loading Animation below the Logo */}
        <div className="mt-8 flex flex-col items-center">
          <div className="w-36 h-1 bg-gray-100 rounded-full overflow-hidden relative">
            <motion.div
              className="h-full bg-gradient-to-r from-[#001f3f] to-[#FF8C00] rounded-full"
              initial={{ x: '-100%' }}
              animate={{ x: '100%' }}
              transition={{
                repeat: Infinity,
                duration: 1.1,
                ease: 'easeInOut',
              }}
              style={{ width: '50%' }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
};
