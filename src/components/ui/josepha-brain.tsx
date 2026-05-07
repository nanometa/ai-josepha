"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";

interface JosephaBrainProps {
  size?: number;
  color?: string;
  className?: string;
  isTyping?: boolean;
}

export function JosephaBrain({
  size = 300,
  color = "rgba(255, 255, 255, 0.8)",
  className = "",
  isTyping = false,
}: JosephaBrainProps) {
  // Generate some random paths for the "neural network" look
  const neuralPaths = useMemo(() => {
    return Array.from({ length: 12 }).map((_, i) => {
      const angle = (i / 12) * Math.PI * 2;
      const x1 = Math.cos(angle) * 40 + 50;
      const y1 = Math.sin(angle) * 40 + 50;
      const x2 = Math.cos(angle + 0.5) * 80 + 50;
      const y2 = Math.sin(angle + 0.5) * 80 + 50;
      return { x1, y1, x2, y2, delay: i * 0.1 };
    });
  }, []);

  return (
    <div 
      className={`relative flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Background Glow */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          background: `radial-gradient(circle, ${color.replace('0.8', '0.15')} 0%, transparent 70%)`,
        }}
        animate={{
          scale: isTyping ? [1, 1.2, 1] : [1, 1.1, 1],
          opacity: isTyping ? [0.5, 0.8, 0.5] : [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: isTyping ? 1.5 : 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <svg
        viewBox="0 0 100 100"
        className="w-full h-full relative z-10"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Core */}
        <motion.circle
          cx="50"
          cy="50"
          r="15"
          fill={color}
          initial={{ scale: 0.8 }}
          animate={{
            scale: isTyping ? [0.8, 1.1, 0.8] : [0.9, 1, 0.9],
            filter: isTyping ? "blur(2px)" : "blur(0px)",
          }}
          transition={{
            duration: isTyping ? 1 : 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Orbitals */}
        <motion.circle
          cx="50"
          cy="50"
          r="25"
          stroke={color}
          strokeWidth="0.5"
          strokeDasharray="4 4"
          animate={{ rotate: 360 }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        />
        <motion.circle
          cx="50"
          cy="50"
          r="35"
          stroke={color}
          strokeWidth="0.3"
          opacity="0.5"
          animate={{ rotate: -360 }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        />

        {/* Neural Connections */}
        {neuralPaths.map((path, i) => (
          <motion.path
            key={i}
            d={`M ${path.x1} ${path.y1} L ${path.x2} ${path.y2}`}
            stroke={color}
            strokeWidth="0.2"
            opacity="0.3"
            initial={{ pathLength: 0 }}
            animate={{ 
              pathLength: [0, 1, 0],
              opacity: isTyping ? [0.2, 0.6, 0.2] : [0.1, 0.3, 0.1]
            }}
            transition={{
              duration: isTyping ? 2 : 4,
              delay: path.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}

        {/* Floating Nodes */}
        {Array.from({ length: 6 }).map((_, i) => {
          const angle = (i / 6) * Math.PI * 2;
          const r = 42;
          return (
            <motion.circle
              key={i}
              cx={50 + Math.cos(angle) * r}
              cy={50 + Math.sin(angle) * r}
              r="1"
              fill={color}
              animate={{
                opacity: [0.2, 1, 0.2],
                scale: [1, 1.5, 1],
              }}
              transition={{
                duration: 2,
                delay: i * 0.3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          );
        })}
        
      </svg>
      
      {/* Interactive Aura */}
      <motion.div
        className="absolute inset-0 rounded-full border border-white/5"
        animate={{
          rotate: [0, 360],
          scale: [0.95, 1.05, 0.95],
        }}
        transition={{
          rotate: { duration: 30, repeat: Infinity, ease: "linear" },
          scale: { duration: 8, repeat: Infinity, ease: "easeInOut" }
        }}
      />
    </div>
  );
}
