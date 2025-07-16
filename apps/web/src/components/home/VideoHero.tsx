"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Volume2, VolumeX, Play, Pause } from "lucide-react";
import Image from "next/image";

interface VideoHeroProps {
  videoSrc: string;
  fallbackImage: string;
  title?: string;
  subtitle?: string;
  ctaText?: string;
  ctaLink?: string;
}

export default function VideoHero({
  videoSrc,
  fallbackImage,
  title = "WHERE AMBITION MEETS ARTISTRY",
  subtitle = "Designed without Limits",
  ctaText = "EXPLORE COLLECTION",
  ctaLink = "/shop"
}: VideoHeroProps) {
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showFallback, setShowFallback] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleCanPlay = () => {
      setIsLoaded(true);
      video.play().catch(() => {
        // Autoplay failed, show fallback
        setShowFallback(true);
      });
    };

    const handleError = () => {
      setShowFallback(true);
    };

    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('error', handleError);

    return () => {
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('error', handleError);
    };
  }, []);

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const titleVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 1.2,
        ease: "easeOut",
        delay: 0.5
      }
    }
  };

  const subtitleVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 1,
        ease: "easeOut",
        delay: 1.2
      }
    }
  };

  const ctaVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.8,
        ease: "easeOut",
        delay: 1.8
      }
    }
  };

  return (
    <section className="relative w-full h-screen overflow-hidden bg-black">
      {/* Video Background */}
      {!showFallback && (
        <video
          ref={videoRef}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
            isLoaded ? 'opacity-70' : 'opacity-0'
          }`}
          autoPlay
          loop
          muted={isMuted}
          playsInline
          preload="metadata"
        >
          <source src={videoSrc} type="video/mp4" />
        </video>
      )}

      {/* Fallback Image */}
      {(showFallback || !isLoaded) && (
        <Image
          src={fallbackImage}
          alt="Hero background"
          fill
          className="object-cover opacity-60"
          priority
        />
      )}

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60" />

      {/* Content */}
      <div className="relative z-10 flex items-center justify-center h-full px-4">
        <div className="text-center max-w-5xl">
          {/* Main Title */}
          <motion.h1
            className="text-4xl md:text-6xl lg:text-7xl font-sans tracking-wider uppercase text-white leading-tight"
            variants={titleVariants}
            initial="hidden"
            animate="visible"
          >
            {title}
          </motion.h1>

          {/* Divider */}
          <motion.div
            className="w-32 h-px bg-gold mx-auto my-8"
            initial={{ width: 0 }}
            animate={{ width: 128 }}
            transition={{ duration: 1, delay: 1.0 }}
          />

          {/* Subtitle */}
          <motion.p
            className="text-xl md:text-2xl lg:text-3xl text-gray-200 tracking-wide font-light italic"
            variants={subtitleVariants}
            initial="hidden"
            animate="visible"
          >
            {subtitle}
          </motion.p>

          {/* CTA Button */}
          <motion.div
            variants={ctaVariants}
            initial="hidden"
            animate="visible"
          >
            <a
              href={ctaLink}
              className="inline-block mt-12 px-8 md:px-12 py-4 md:py-5 border-2 border-white bg-transparent text-white text-lg md:text-xl tracking-widest uppercase hover:bg-white hover:text-black transition-all duration-500 group"
            >
              <span className="inline-block transform group-hover:translate-x-1 transition-transform duration-300">
                {ctaText}
              </span>
              <span className="inline-block ml-2 transform group-hover:translate-x-1 transition-transform duration-300">
                →
              </span>
            </a>
          </motion.div>
        </div>
      </div>

      {/* Video Controls */}
      {!showFallback && (
        <motion.div
          className="absolute bottom-8 right-8 flex items-center space-x-4 z-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.5 }}
        >
          {/* Play/Pause */}
          <button
            onClick={togglePlayPause}
            className="p-3 bg-black/50 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 transition-all duration-300"
            aria-label={isPlaying ? "Pause video" : "Play video"}
          >
            {isPlaying ? <Pause size={20} /> : <Play size={20} />}
          </button>

          {/* Mute/Unmute */}
          <button
            onClick={toggleMute}
            className="p-3 bg-black/50 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 transition-all duration-300"
            aria-label={isMuted ? "Unmute video" : "Mute video"}
          >
            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>
        </motion.div>
      )}

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white z-20"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 3, duration: 1 }}
      >
        <div className="flex flex-col items-center">
          <span className="text-sm tracking-widest uppercase mb-4">Scroll to Explore</span>
          <motion.div
            className="w-px h-16 bg-white/50"
            animate={{ scaleY: [1, 0.5, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
      </motion.div>

      {/* Loading State */}
      {!isLoaded && !showFallback && (
        <div className="absolute inset-0 bg-black flex items-center justify-center z-30">
          <div className="text-white text-center">
            <div className="w-12 h-12 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm tracking-widest uppercase">Loading Experience</p>
          </div>
        </div>
      )}
    </section>
  );
}