"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface AuthBackgroundProps {
  children: React.ReactNode;
  variant?: 'luxury' | 'minimal' | 'jewelry' | 'gradient';
  showPattern?: boolean;
  animated?: boolean;
  className?: string;
}

export default function AuthBackground({
  children,
  variant = 'luxury',
  showPattern = true,
  animated = true,
  className = ""
}: AuthBackgroundProps) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Track mouse for subtle parallax effect
  useEffect(() => {
    if (!animated) return;

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [animated]);

  // Animated floating jewelry pieces
  const FloatingElements = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Large floating circles */}
      <motion.div
        className="absolute w-96 h-96 rounded-full bg-gradient-to-br from-gold/5 to-gold/20 blur-3xl"
        animate={{
          x: [0, 100, 0],
          y: [0, -50, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        style={{
          top: '10%',
          left: '10%',
        }}
      />
      
      <motion.div
        className="absolute w-64 h-64 rounded-full bg-gradient-to-br from-gold/10 to-gold/30 blur-2xl"
        animate={{
          x: [0, -80, 0],
          y: [0, 60, 0],
          scale: [1, 0.8, 1],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2
        }}
        style={{
          bottom: '20%',
          right: '15%',
        }}
      />

      {/* Small floating dots */}
      {Array.from({ length: 12 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-gold/40 rounded-full"
          animate={{
            y: [0, -30, 0],
            opacity: [0.2, 0.8, 0.2],
          }}
          transition={{
            duration: 4 + (i * 0.5),
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.8
          }}
          style={{
            left: `${10 + (i * 7)}%`,
            top: `${20 + (i * 5)}%`,
          }}
        />
      ))}
    </div>
  );

  // Luxury pattern overlay
  const LuxuryPattern = () => (
    <div className="absolute inset-0 opacity-5 dark:opacity-10">
      <div 
        className="w-full h-full"
        style={{
          backgroundImage: `
            radial-gradient(circle at 25% 25%, #D4AF37 2px, transparent 2px),
            radial-gradient(circle at 75% 75%, #D4AF37 2px, transparent 2px),
            linear-gradient(45deg, transparent 25%, #D4AF37 25%, #D4AF37 50%, transparent 50%, transparent 75%, #D4AF37 75%)
          `,
          backgroundSize: '60px 60px, 60px 60px, 120px 120px',
          backgroundPosition: '0 0, 30px 30px, 0 0'
        }}
      />
    </div>
  );

  // Jewelry-inspired pattern
  const JewelryPattern = () => (
    <div className="absolute inset-0 opacity-10 dark:opacity-20">
      <svg
        className="w-full h-full"
        viewBox="0 0 400 400"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id="jewelry-pattern"
            x="0"
            y="0"
            width="100"
            height="100"
            patternUnits="userSpaceOnUse"
          >
            {/* Diamond shape */}
            <path
              d="M50 10 L70 30 L50 50 L30 30 Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.5"
              className="text-gold"
            />
            {/* Ring shape */}
            <circle
              cx="50"
              cy="50"
              r="15"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.5"
              className="text-gold"
            />
            <circle
              cx="50"
              cy="50"
              r="8"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.3"
              className="text-gold"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#jewelry-pattern)" />
      </svg>
    </div>
  );

  // Interactive gradient that follows mouse
  const InteractiveGradient = () => (
    <motion.div
      className="absolute inset-0 opacity-30"
      style={{
        background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, 
          rgba(212, 175, 55, 0.15) 0%, 
          rgba(212, 175, 55, 0.05) 25%, 
          transparent 50%)`
      }}
      animate={animated ? {
        background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, 
          rgba(212, 175, 55, 0.15) 0%, 
          rgba(212, 175, 55, 0.05) 25%, 
          transparent 50%)`
      } : {}}
      transition={{ duration: 0.3, ease: "easeOut" }}
    />
  );

  // Background variants
  const getBackgroundClasses = () => {
    switch (variant) {
      case 'luxury':
        return "bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-black dark:to-gray-800";
      case 'minimal':
        return "bg-white dark:bg-black";
      case 'jewelry':
        return "bg-gradient-to-br from-amber-50 via-white to-gold/5 dark:from-gray-900 dark:via-black dark:to-yellow-900/20";
      case 'gradient':
        return "bg-gradient-to-br from-gold/5 via-white to-gold/10 dark:from-gold/5 dark:via-black dark:to-gold/10";
      default:
        return "bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-black dark:to-gray-800";
    }
  };

  return (
    <div className={`min-h-screen relative overflow-hidden ${getBackgroundClasses()} ${className}`}>
      {/* Animated background elements */}
      {animated && <FloatingElements />}
      
      {/* Pattern overlays */}
      {showPattern && variant === 'luxury' && <LuxuryPattern />}
      {showPattern && variant === 'jewelry' && <JewelryPattern />}
      
      {/* Interactive gradient */}
      {animated && <InteractiveGradient />}
      
      {/* Main gradient overlays */}
      <div className="absolute inset-0">
        {/* Top gradient */}
        <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-gold/5 via-gold/2 to-transparent" />
        
        {/* Bottom gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-gold/10 via-gold/3 to-transparent" />
        
        {/* Side gradients for depth */}
        <div className="absolute left-0 top-0 bottom-0 w-1/4 bg-gradient-to-r from-gold/5 to-transparent" />
        <div className="absolute right-0 top-0 bottom-0 w-1/4 bg-gradient-to-l from-gold/5 to-transparent" />
      </div>

      {/* Noise texture for premium feel */}
      <div 
        className="absolute inset-0 opacity-10 dark:opacity-20 mix-blend-multiply dark:mix-blend-screen"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>

      {/* Vignette effect */}
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-black/5 dark:to-black/20 pointer-events-none" />
    </div>
  );
}

// Specialized background variants for different auth pages
export function SignInBackground({ children }: { children: React.ReactNode }) {
  return (
    <AuthBackground variant="luxury" showPattern={true} animated={true}>
      {children}
    </AuthBackground>
  );
}

export function SignUpBackground({ children }: { children: React.ReactNode }) {
  return (
    <AuthBackground variant="jewelry" showPattern={true} animated={true}>
      {children}
    </AuthBackground>
  );
}

export function PasswordResetBackground({ children }: { children: React.ReactNode }) {
  return (
    <AuthBackground variant="minimal" showPattern={false} animated={false}>
      {children}
    </AuthBackground>
  );
}