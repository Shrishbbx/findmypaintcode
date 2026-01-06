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

interface HeroAnimationProps {
  onScanningChange?: (isScanning: boolean) => void;
}

// Real customer emotions - authentic journey from confusion to confidence
const PAINT_CODE_MESSAGES = [
  // Relief & Ease
  { message: "So easy! My code is 040", emoji: "✨" },
  { message: "Way easier than I thought: NH-883P", emoji: "🚗" },
  { message: "Finally found it: 218", emoji: "💯" },
  { message: "That was simple! Code: 1F7", emoji: "⚡" },
  { message: "Easier than searching! GAZ", emoji: "✓" },

  // Confusion Resolved
  { message: "I was so lost before: 3T3", emoji: "🎨" },
  { message: "No more guessing: YZ", emoji: "🔥" },
  { message: "Door jamb made sense: E1", emoji: "✨" },
  { message: "Finally understand: NH-731P", emoji: "💯" },
  { message: "All the numbers made sense: 8X8", emoji: "🚗" },

  // Confidence to Order
  { message: "Ready to order: B-593M", emoji: "⚡" },
  { message: "I can order now! D4", emoji: "🔥" },
  { message: "Perfect match: R-569M", emoji: "✨" },
  { message: "Exactly what I needed: GBA", emoji: "✓" },
  { message: "Ordering with confidence: 3U5", emoji: "💯" },

  // Discovery & Excitement
  { message: "There it is: UM", emoji: "🎨" },
  { message: "My exact color: GAN", emoji: "🚗" },
  { message: "Found my code: B5", emoji: "⚡" },
  { message: "This is it: 6X3", emoji: "✨" },
  { message: "Right paint: NH-830M", emoji: "💯" },

  // Pain Point Acknowledgment
  { message: "Saved me so much time: G9K", emoji: "🔥" },
  { message: "No more door jamb confusion: B-588P", emoji: "✓" },
  { message: "Wish I found this sooner: YR506M", emoji: "🎨" },
  { message: "Finally the right info: G7Q", emoji: "🚗" },
  { message: "This beats guessing: 040", emoji: "⚡" },
];

const CAR_SPEED = 0.15; // pixels per ms
const STOP_DURATION = 1500; // 1.5 seconds - reduced for faster flow
const SCAN_DURATION = 1500; // 1.5 seconds - glow proceeds gradually
const MESSAGE_DURATION = 2000; // 2 seconds
const MIN_DISTANCE_BETWEEN_CARS = 250; // pixels - spacing between cars
const SPAWN_ON_SCAN = true; // Spawn new car when car reaches center
const MIN_SPAWN_INTERVAL = 300; // Minimum 300ms between spawns (safety check)
const CAR_WIDTH = 96; // pixels (w-24 = 96px)
const CAR_HORIZONTAL_OFFSET = 0; // No offset needed
const DECELERATION_DISTANCE = 50; // Start slowing down 50px before button
const ACCELERATION_DISTANCE = 80; // Gradually accelerate over 80px when leaving

export function HeroAnimation({ onScanningChange }: HeroAnimationProps = {}) {
  const [cars, setCars] = useState<Car[]>([]);
  const [isPaused, setIsPaused] = useState(false);
  const [buttonPosition, setButtonPosition] = useState(0);
  const [screenWidth, setScreenWidth] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const lastTimeRef = useRef<number>(0);
  const lastSpawnTimeRef = useRef<number>(0); // Track when last car spawned

  // Notify parent when scanning state changes - glow appears when car stops at center
  useEffect(() => {
    const isScanning = cars.some(car =>
      car.state === 'at-button-stopped' || car.state === 'at-button-scanning'
    );
    onScanningChange?.(isScanning);
  }, [cars, onScanningChange]);

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
    const randomPaintCode = PAINT_CODE_MESSAGES[Math.floor(Math.random() * PAINT_CODE_MESSAGES.length)];
    const fullMessage = `${randomPaintCode.message} ${randomPaintCode.emoji}`;

    const now = Date.now();
    lastSpawnTimeRef.current = now;

    setCars([{
      id: now,
      image: randomCar,
      position: -CAR_WIDTH,
      state: 'driving',
      stateStartTime: now,
      message: fullMessage,
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
              // Target position: center of car aligned with button center
              const targetStopPosition = buttonPosition - CAR_WIDTH / 2;
              const distanceToTarget = targetStopPosition - car.position;

              // Check if we're approaching the button and there's a car there
              if (distanceToTarget <= MIN_DISTANCE_BETWEEN_CARS && carAheadAtButton) {
                // Stop here and wait - don't jump, just hold position
                newState = 'waiting';
                newPosition = car.position; // Keep current position
              } else if (distanceToTarget <= DECELERATION_DISTANCE && !carAheadAtButton) {
                // Start decelerating as we approach the button
                if (distanceToTarget <= 2) {
                  // Close enough - snap to exact position and stop
                  newPosition = targetStopPosition;
                  newState = 'at-button-stopped';
                  newStateStartTime = now;
                } else {
                  // Smoothly decelerate - move fraction of remaining distance
                  const slowdownFactor = Math.max(0.1, distanceToTarget / DECELERATION_DISTANCE);
                  newPosition = car.position + (CAR_SPEED * deltaTime * slowdownFactor);
                }
              } else {
                // Keep driving normally at full speed
                newPosition = car.position + CAR_SPEED * deltaTime;
              }
              break;

            case 'waiting':
              // Keep current position, check if button is free
              newPosition = car.position; // Hold position while waiting
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
              // Gradual acceleration when leaving (opposite of deceleration)
              // Calculate distance from the stop position (center of car at button center)
              const stopPosition = buttonPosition - CAR_WIDTH / 2;
              const distanceTraveled = newPosition - stopPosition;

              if (distanceTraveled < ACCELERATION_DISTANCE) {
                // Accelerate from ~10% to 100% speed over ACCELERATION_DISTANCE
                const accelerationProgress = Math.max(0, distanceTraveled / ACCELERATION_DISTANCE);
                const accelerationFactor = 0.1 + (0.9 * accelerationProgress);
                newPosition += CAR_SPEED * deltaTime * accelerationFactor;
              } else {
                // Full speed after acceleration phase
                newPosition += CAR_SPEED * deltaTime;
              }

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

        // Trigger spawn when a car reaches center (for continuous flow)
        const carJustReachedCenter = updatedCars.some((car, idx) => {
          const prevCar = prevCars[idx];
          return prevCar &&
                 prevCar.state === 'driving' &&
                 car.state === 'at-button-stopped';
        });

        // Safety check: ensure minimum time between spawns (only for fallback spawning)
        const timeSinceLastSpawn = now - lastSpawnTimeRef.current;
        const canSpawnBasedOnTime = timeSinceLastSpawn >= MIN_SPAWN_INTERVAL;

        // Spawn conditions: immediate trigger when car reaches center, no position checks
        const lastCar = visibleCars[visibleCars.length - 1];
        const hasPositionSpace = !lastCar || lastCar.position > MIN_DISTANCE_BETWEEN_CARS;

        // Primary: spawn immediately when car reaches center (simultaneous flow)
        // Fallback: spawn based on position if no cars at center yet
        const shouldSpawn = carJustReachedCenter || (hasPositionSpace && canSpawnBasedOnTime);

        if (shouldSpawn && visibleCars.length < 3) {
          const carImages = ['/cars/car-1.svg', '/cars/car-2.svg', '/cars/car-3.svg'];
          const randomCar = carImages[Math.floor(Math.random() * carImages.length)];
          const randomPaintCode = PAINT_CODE_MESSAGES[Math.floor(Math.random() * PAINT_CODE_MESSAGES.length)];
          const fullMessage = `${randomPaintCode.message} ${randomPaintCode.emoji}`;

          lastSpawnTimeRef.current = now;

          visibleCars.push({
            id: now,
            image: randomCar,
            position: -CAR_WIDTH,
            state: 'driving',
            stateStartTime: now,
            message: fullMessage,
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

          return (
            <div
              key={car.id}
              className="absolute bottom-9"
              style={{
                left: `${car.position + CAR_HORIZONTAL_OFFSET}px`,
              }}
            >
              {/* Exhaust Puffs - positioned to touch the back of the car */}
              {showExhaust && (
                <>
                  <div className="absolute -left-4 bottom-2 animate-exhaust-puff">
                    <div className="w-6 h-6 rounded-full bg-gray-400/40 blur-sm" />
                  </div>
                  <div className="absolute -left-8 bottom-1 animate-exhaust-puff" style={{ animationDelay: '0.3s' }}>
                    <div className="w-5 h-5 rounded-full bg-gray-400/30 blur-sm" />
                  </div>
                  <div className="absolute -left-12 bottom-0 animate-exhaust-puff" style={{ animationDelay: '0.6s' }}>
                    <div className="w-4 h-4 rounded-full bg-gray-400/20 blur-md" />
                  </div>
                </>
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
