"use client";

import { Renderer, Program, Mesh, Color, Triangle } from 'ogl';
import { useEffect, useRef } from 'react';

const vertexShader = `
attribute vec2 uv;
attribute vec2 position;

varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = vec4(position, 0, 1);
}
`;

const fragmentShader = `
precision highp float;

uniform float uTime;
uniform vec3 uResolution;
uniform vec2 uFocal;
uniform vec2 uRotation;
uniform float uStarSpeed;
uniform float uDensity;
uniform float uHueShift;
uniform float uSpeed;
uniform vec2 uMouse;
uniform float uGlowIntensity;
uniform float uSaturation;
uniform bool uMouseRepulsion;
uniform float uTwinkleIntensity;
uniform float uRotationSpeed;
uniform float uRepulsionStrength;
uniform float uMouseActiveFactor;
uniform float uAutoCenterRepulsion;
uniform bool uTransparent;

varying vec2 vUv;

#define NUM_LAYER 4.0
#define PERIOD 10.0
#define STAR_COLOR_CUTOFF 0.5
#define MAT45 mat2(0.707, -0.707, 0.707, 0.707)

float Hash21(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
}

float tri(float x) {
    float t = fract(x);
    return 2.0 * (1.0 - smoothstep(0.0, 1.0, abs(2.0 * t - 1.0))) - 1.0;
}

vec3 hsv2rgb(vec3 c) {
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

float Star(vec2 uv, float flare) {
    float d = length(uv);
    float m = (0.05 * uGlowIntensity) / d;
    float rays = smoothstep(0.0, 1.0, 1.0 - abs(uv.x * uv.y * 1000.0));
    m += rays * flare * uGlowIntensity;
    uv *= MAT45;
    rays = smoothstep(0.0, 1.0, 1.0 - abs(uv.x * uv.y * 1000.0));
    m += rays * 0.3 * flare * uGlowIntensity;
    m *= smoothstep(1.0, 0.2, d);
    return m;
}

vec3 StarLayer(vec2 uv, float uHueShift, float uSaturation, float uGlowIntensity, float uStarSpeed) {
    vec3 col = vec3(0.0);
    
    vec2 gv = fract(uv) - 0.5;
    vec2 id = floor(uv);
    
    for (int y = -1; y <= 1; y++) {
        for (int x = -1; x <= 1; x++) {
            vec2 offset = vec2(float(x), float(y));
            vec2 si = id + vec2(float(x), float(y));
            float seed = Hash21(si);
            float size = fract(seed * 345.32);
            float glossLocal = tri(uStarSpeed / (PERIOD * seed + 1.0));
            float flareSize = smoothstep(0.9, 1.0, size) * glossLocal;
            
            float red = smoothstep(STAR_COLOR_CUTOFF, 1.0, Hash21(si + 1.0)) + STAR_COLOR_CUTOFF;
            float blu = smoothstep(STAR_COLOR_CUTOFF, 1.0, Hash21(si + 3.0)) + STAR_COLOR_CUTOFF;
            float grn = min(red, blu) * seed;
            vec3 base = vec3(red, grn, blu);
            
            float hue = atan(base.g - base.r, base.b - base.r) / (2.0 * 3.14159) + 0.5;
            hue = fract(hue + uHueShift / 360.0);
            base = hsv2rgb(vec3(hue, uSaturation, 1.0));
            
            vec2 p = gv - offset - vec2(fract(seed * 123.4), fract(seed * 456.7)) + 0.5;
            
            float star = Star(p, flareSize * uGlowIntensity);
            col += star * size * base;
        }
    }
    return col;
}

void main() {
    vec2 uv = (vUv - 0.5) * (uResolution.xy / min(uResolution.x, uResolution.y));
    float time = uTime * uSpeed;
    
    vec2 mouse = uMouse;
    float mouseActive = uMouseActiveFactor;
    
    vec3 col = vec3(0.0);
    
    mat2 rot = mat2(cos(uRotation.x), sin(uRotation.x), -sin(uRotation.x), cos(uRotation.x));
    uv *= rot;
    
    for (float i = 0.0; i < 1.0; i += 1.0 / NUM_LAYER) {
        float depth = fract(i + time * 0.1);
        float scale = mix(20.0, 0.5, depth);
        float fade = depth * smoothstep(1.0, 0.9, depth);
        
        vec2 layerUv = uv * scale + i * 453.2;
        
        if (uMouseRepulsion) {
            vec2 repulsionCenter = mouse * scale;
            vec2 dir = layerUv - repulsionCenter;
            float dist = length(dir);
            float repulsion = exp(-dist * uRepulsionStrength) * mouseActive;
            layerUv += normalize(dir) * repulsion;
        }
        
        col += StarLayer(layerUv, uHueShift, uSaturation, uGlowIntensity, uStarSpeed) * fade;
    }
    
    if (uTransparent) {
        gl_FragColor = vec4(col, mix(0.0, 1.0, length(col)));
    } else {
        gl_FragColor = vec4(col, 1.0);
    }
}
`;

interface GalaxyProps {
  starSpeed?: number;
  density?: number;
  hueShift?: number;
  speed?: number;
  glowIntensity?: number;
  saturation?: number;
  mouseRepulsion?: boolean;
  repulsionStrength?: number;
  twinkleIntensity?: number;
  rotationSpeed?: number;
  transparent?: boolean;
  className?: string;
}

export function Galaxy({
  starSpeed = 0,
  density = 1.5,
  hueShift = 125,
  speed = 1,
  glowIntensity = 0.15,
  saturation = 0.25,
  mouseRepulsion = true,
  repulsionStrength = 4.5,
  twinkleIntensity = 0,
  rotationSpeed = 0.05,
  transparent = false,
  className = "",
}: GalaxyProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef({ x: 0, y: 0, active: 0 });

  useEffect(() => {
    if (!containerRef.current) return;

    const renderer = new Renderer({ alpha: transparent, premultipliedAlpha: false });
    const gl = renderer.gl;
    containerRef.current.appendChild(gl.canvas);

    const geometry = new Triangle(gl);
    const program = new Program(gl, {
      vertex: vertexShader,
      fragment: fragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uResolution: { value: [0, 0, 0] },
        uFocal: { value: [0, 0] },
        uRotation: { value: [0, 0] },
        uStarSpeed: { value: starSpeed },
        uDensity: { value: density },
        uHueShift: { value: hueShift },
        uSpeed: { value: speed },
        uMouse: { value: [0, 0] },
        uGlowIntensity: { value: glowIntensity },
        uSaturation: { value: saturation },
        uMouseRepulsion: { value: mouseRepulsion },
        uTwinkleIntensity: { value: twinkleIntensity },
        uRotationSpeed: { value: rotationSpeed },
        uRepulsionStrength: { value: repulsionStrength },
        uMouseActiveFactor: { value: 0 },
        uAutoCenterRepulsion: { value: 0 },
        uTransparent: { value: transparent },
      },
    });

    const mesh = new Mesh(gl, { geometry, program });

    const handleResize = () => {
      if (!containerRef.current) return;
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      renderer.setSize(width, height);
      program.uniforms.uResolution.value = [width, height, 0];
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      mouseRef.current = { x, y, active: 1 };
    };

    const handleMouseLeave = () => {
      mouseRef.current.active = 0;
    };

    window.addEventListener('resize', handleResize);
    containerRef.current.addEventListener('mousemove', handleMouseMove);
    containerRef.current.addEventListener('mouseleave', handleMouseLeave);
    handleResize();

    let animationId: number;
    const update = (t: number) => {
      animationId = requestAnimationFrame(update);
      program.uniforms.uTime.value = t * 0.001;
      program.uniforms.uMouse.value = [mouseRef.current.x, mouseRef.current.y];
      
      const targetActive = mouseRef.current.active;
      program.uniforms.uMouseActiveFactor.value += (targetActive - program.uniforms.uMouseActiveFactor.value) * 0.1;
      
      renderer.render({ scene: mesh });
    };
    animationId = requestAnimationFrame(update);

    return () => {
      window.removeEventListener('resize', handleResize);
      containerRef.current?.removeEventListener('mousemove', handleMouseMove);
      containerRef.current?.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationId);
      gl.canvas.remove();
    };
  }, [
    starSpeed,
    density,
    hueShift,
    speed,
    glowIntensity,
    saturation,
    mouseRepulsion,
    repulsionStrength,
    twinkleIntensity,
    rotationSpeed,
    transparent,
  ]);

  return <div ref={containerRef} className={`w-full h-full relative ${className}`} />;
}
