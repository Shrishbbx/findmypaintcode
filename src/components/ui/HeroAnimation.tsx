'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';

type CarState = 'driving' | 'waiting' | 'at-button-stopped' | 'at-button-scanning' | 'leaving';

interface Car {
  id: number;
  image: string;
  position: number; // pixels from left
  state: CarState;
  stateStartTime: number;
  message: string;
  showMessage: boolean;
}

const SPEECH_BUBBLES = [
  "Oh! My code is 7XZ 🎨",
  "That was so easy! ✨",
  "Found it! Code: ABC123 🚗",
  "Perfect match! 💯",
  "Wow, instant results! ⚡"
];

const CAR_SPEED = 0.15; // pixels per ms
const STOP_DURATION = 2000; // 2 seconds
const SCAN_DURATION = 1000; // 1 second
const MESSAGE_DURATION = 2000; // 2 seconds
const MIN_DISTANCE_BETWEEN_CARS = 200; // pixels
const CAR_WIDTH = 96; // pixels (w-24 = 96px)

export function HeroAnimation() {
  const [cars, setCars] = useState<Car[]>([]);
  const [isPaused, setIsPaused] = useState(false);
  const [buttonPosition, setButtonPosition] = useState(0);
  const [screenWidth, setScreenWidth] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const lastTimeRef = useRef<number>(0);

  // Get button position and screen width
  useEffect(() => {
    const updateDimensions = () => {
      if (buttonRef.current && containerRef.current) {
        const containerRect = containerRef.current.getBoundingClientRect();
        const buttonRect = buttonRef.current.getBoundingClientRect();
        setButtonPosition(buttonRect.left + buttonRect.width / 2 - containerRect.left);
        setScreenWidth(containerRect.width);
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Initialize first car
  useEffect(() => {
    if (screenWidth === 0) return;

    const carImages = ['/cars/car-1.svg', '/cars/car-2.svg', '/cars/car-3.svg'];
    const randomCar = carImages[Math.floor(Math.random() * carImages.length)];
    const randomMessage = SPEECH_BUBBLES[Math.floor(Math.random() * SPEECH_BUBBLES.length)];

    setCars([{
      id: Date.now(),
      image: randomCar,
      position: -CAR_WIDTH,
      state: 'driving',
      stateStartTime: Date.now(),
      message: randomMessage,
      showMessage: false
    }]);
  }, [screenWidth]);

  // Animation loop
  useEffect(() => {
    if (isPaused || screenWidth === 0) return;

    const animate = (timestamp: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = timestamp;
      const deltaTime = timestamp - lastTimeRef.current;
      lastTimeRef.current = timestamp;

      setCars(prevCars => {
        const now = Date.now();

        const updatedCars = prevCars.map((car, index) => {
          const timeSinceStateStart = now - car.stateStartTime;
          let newPosition = car.position;
          let newState = car.state;
          let newStateStartTime = car.stateStartTime;
          let newShowMessage = car.showMessage;

          // Check if there's a car ahead at the button
          const carAheadAtButton = prevCars.some((otherCar, otherIndex) =>
            otherIndex < index &&
            (otherCar.state === 'at-button-stopped' || otherCar.state === 'at-button-scanning') &&
            Math.abs(otherCar.position - buttonPosition) < CAR_WIDTH
          );

          switch (car.state) {
            case 'driving':
              newPosition += CAR_SPEED * deltaTime;

              // Check if reached button position
              if (newPosition >= buttonPosition - CAR_WIDTH / 2) {
                if (carAheadAtButton) {
                  // Wait behind
                  newState = 'waiting';
                  newPosition = buttonPosition - CAR_WIDTH / 2 - MIN_DISTANCE_BETWEEN_CARS;
                } else {
                  // Stop at button
                  newPosition = buttonPosition;
                  newState = 'at-button-stopped';
                  newStateStartTime = now;
                }
              }
              break;

            case 'waiting':
              // Check if button is free
              if (!carAheadAtButton) {
                newState = 'driving';
              }
              break;

            case 'at-button-stopped':
              // Stay stopped for 2 seconds
              if (timeSinceStateStart >= STOP_DURATION) {
                newState = 'at-button-scanning';
                newStateStartTime = now;
              }
              break;

            case 'at-button-scanning':
              // Scan for 1 second, then leave
              if (timeSinceStateStart >= SCAN_DURATION) {
                newState = 'leaving';
                newStateStartTime = now;
              }
              break;

            case 'leaving':
              newPosition += CAR_SPEED * deltaTime;

              // Show message shortly after leaving
              if (!car.showMessage && newPosition > buttonPosition + 80) {
                newShowMessage = true;
                newStateStartTime = now;
              }

              // Hide message after duration
              if (car.showMessage && timeSinceStateStart >= MESSAGE_DURATION) {
                newShowMessage = false;
              }
              break;
          }

          return {
            ...car,
            position: newPosition,
            state: newState,
            stateStartTime: newStateStartTime,
            showMessage: newShowMessage
          };
        });

        // Remove cars that have driven off-screen
        const visibleCars = updatedCars.filter(car => car.position < screenWidth + CAR_WIDTH);

        // Add new car if there's space
        const lastCar = visibleCars[visibleCars.length - 1];
        const canSpawnNewCar = !lastCar || lastCar.position > MIN_DISTANCE_BETWEEN_CARS;

        if (canSpawnNewCar && visibleCars.length < 3) {
          const carImages = ['/cars/car-1.svg', '/cars/car-2.svg', '/cars/car-3.svg'];
          const randomCar = carImages[Math.floor(Math.random() * carImages.length)];
          const randomMessage = SPEECH_BUBBLES[Math.floor(Math.random() * SPEECH_BUBBLES.length)];

          visibleCars.push({
            id: Date.now(),
            image: randomCar,
            position: -CAR_WIDTH,
            state: 'driving',
            stateStartTime: now,
            message: randomMessage,
            showMessage: false
          });
        }

        return visibleCars;
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPaused, screenWidth, buttonPosition]);

  // IntersectionObserver to pause when out of view
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          setIsPaused(!entry.isIntersecting);
        });
      },
      { threshold: 0.1 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
    };
  }, []);

  return (
    <div style={{ marginTop: '5px' }}>
      {/* Dev Toggle Button */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="fixed right-4 top-20 z-50 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg shadow-lg hover:bg-gray-700 transition-colors"
        title={isVisible ? 'Hide Animation' : 'Show Animation'}
      >
        {isVisible ? '👁️ Hide' : '👁️‍🗨️ Show'}
      </button>

      {/* Animation container - FULL WIDTH */}
      {isVisible && (
        <div
          ref={containerRef}
          className="relative w-screen -mx-6 md:-mx-0 h-56 overflow-visible motion-reduce:hidden"
          style={{ marginLeft: 'calc(-50vw + 50%)' }}
          aria-hidden="true"
        >
        {/* Hidden button reference - positioned in center */}
        <div
          ref={buttonRef}
          className="absolute left-1/2 top-20 -translate-x-1/2 opacity-0 pointer-events-none"
        >
          <div className="w-1 h-1" />
        </div>

        {/* Minimalistic Road - Narrower and Lighter */}
        <div className="absolute bottom-12 left-0 right-0 h-10">
          {/* Road surface - lighter gray */}
          <div className="absolute inset-0 bg-gradient-to-b from-gray-50 to-gray-100" />

          {/* Center dashed line - deep gray instead of yellow */}
          <div className="absolute top-1/2 left-0 right-0 h-0.5 -translate-y-1/2">
            <div className="h-full"
                 style={{
                   backgroundImage: 'repeating-linear-gradient(90deg, #6B7280 0px, #6B7280 30px, transparent 30px, transparent 60px)',
                   backgroundSize: '60px 100%',
                   opacity: 0.4
                 }} />
          </div>

          {/* Road edges */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gray-200" />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gray-200" />
        </div>

        {/* Cars */}
        {cars.map(car => {
          const showExhaust = car.state === 'driving' || car.state === 'leaving';
          const showScanBeam = car.state === 'at-button-scanning';

          return (
            <div
              key={car.id}
              className="absolute bottom-16"
              style={{
                left: `${car.position + 20}px`,
              }}
            >
              {/* Exhaust Puffs */}
              {showExhaust && (
                <>
                  <div className="absolute -left-20 bottom-2 animate-exhaust-puff">
                    <div className="w-6 h-6 rounded-full bg-gray-400/40 blur-sm" />
                  </div>
                  <div className="absolute -left-24 bottom-1 animate-exhaust-puff" style={{ animationDelay: '0.3s' }}>
                    <div className="w-5 h-5 rounded-full bg-gray-400/30 blur-sm" />
                  </div>
                  <div className="absolute -left-28 bottom-0 animate-exhaust-puff" style={{ animationDelay: '0.6s' }}>
                    <div className="w-4 h-4 rounded-full bg-gray-400/20 blur-md" />
                  </div>
                </>
              )}

              {/* Scanning Beam */}
              {showScanBeam && (
                <div className="absolute -top-44 -translate-x-1/2 w-24 h-44 animate-scan-beam pointer-events-none" style={{ left: '18px' }}>
                  <div className="w-full h-full bg-gradient-to-b from-blue-500/0 via-blue-400/60 to-purple-500/40 blur-sm" />
                </div>
              )}

              {/* Car Image */}
              <div className="relative w-24 h-16 z-10">
                <Image
                  src={car.image}
                  alt="Car"
                  fill
                  className="object-contain"
                />
              </div>

              {/* Speech Bubble - positioned directly above car center */}
              {car.showMessage && (
                <div className="absolute -top-16 left-32 -translate-x-1/2 animate-bubble-pop whitespace-nowrap z-20">
                  <div className="relative bg-white px-4 py-2.5 rounded-2xl shadow-lg border-2 border-gray-200">
                    <p className="text-sm font-semibold text-gray-800">
                      {car.message}
                    </p>
                    {/* Speech bubble tail pointing down to car */}
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-r-2 border-b-2 border-gray-200 rotate-45" />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      )}
    </div>
  );
}
