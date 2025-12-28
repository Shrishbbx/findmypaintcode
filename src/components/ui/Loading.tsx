'use client';

export function Loading() {
  // VIBGYOR colors: Violet, Indigo, Blue, Green, Yellow, Orange, Red
  const vibgyorColors = [
    { name: 'Violet', color: 'from-violet-500 to-violet-600', bg: 'bg-gradient-to-br from-violet-500 to-violet-600' },
    { name: 'Indigo', color: 'from-indigo-500 to-indigo-600', bg: 'bg-gradient-to-br from-indigo-500 to-indigo-600' },
    { name: 'Blue', color: 'from-blue-500 to-blue-600', bg: 'bg-gradient-to-br from-blue-500 to-blue-600' },
    { name: 'Green', color: 'from-green-500 to-green-600', bg: 'bg-gradient-to-br from-green-500 to-green-600' },
    { name: 'Yellow', color: 'from-yellow-400 to-yellow-500', bg: 'bg-gradient-to-br from-yellow-400 to-yellow-500' },
    { name: 'Orange', color: 'from-orange-500 to-orange-600', bg: 'bg-gradient-to-br from-orange-500 to-orange-600' },
    { name: 'Red', color: 'from-red-500 to-red-600', bg: 'bg-gradient-to-br from-red-500 to-red-600' },
  ];

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center z-50">
      <div className="relative">
        {/* VIBGYOR Paint droplets animation */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 flex gap-2">
          {vibgyorColors.map((color, i) => (
            <div
              key={i}
              className={`w-3 h-3 ${color.bg} rounded-full animate-drip shadow-lg`}
              style={{
                animationDelay: `${i * 0.45}s`,
                animationDuration: '1.8s',
              }}
            />
          ))}
        </div>

        {/* Acura Integra SVG - Centered with Speed Effect */}
        <div className="relative flex justify-center items-center">
          {/* Speed lines - motion effect */}
          <div className="absolute left-0 right-0 flex justify-between items-center px-8">
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-0.5 bg-gradient-to-r from-transparent via-blue-400 to-transparent animate-speed-line"
                style={{
                  width: `${40 - i * 5}px`,
                  animationDelay: `${i * 0.1}s`,
                  opacity: 0.6 - i * 0.1,
                }}
              />
            ))}
          </div>

          {/* Clean Sports Car Icon - Minimalistic Style */}
          <svg
            width="200"
            height="100"
            viewBox="0 0 200 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="drop-shadow-lg relative z-10"
          >
            {/* Simple Sports Car Body */}
            <g>
              {/* Main car body - single rounded shape */}
              <path
                d="M 30 65 Q 30 55 40 50 L 60 45 Q 70 42 85 42 L 110 42 Q 120 42 130 45 L 150 50 Q 160 55 160 65 L 160 70 L 30 70 Z"
                className="fill-gray-200 stroke-none transition-all duration-1000 animate-paint-fill"
              />

              {/* Roof/Cabin area */}
              <path
                d="M 70 42 Q 75 35 85 32 L 110 32 Q 120 35 125 42 Z"
                className="fill-gray-200 stroke-none transition-all duration-1000 animate-paint-fill"
              />

              {/* Windshield */}
              <path
                d="M 75 38 L 80 33 L 95 33 L 98 38 Z"
                className="fill-gray-700 fill-opacity-20"
              />

              {/* Side window */}
              <path
                d="M 105 38 L 108 33 L 118 33 L 120 38 Z"
                className="fill-gray-700 fill-opacity-20"
              />

              {/* Bottom shadow/ground line */}
              <ellipse
                cx="95"
                cy="72"
                rx="70"
                ry="4"
                className="fill-gray-900 fill-opacity-10"
              />
            </g>

            {/* Wheels - Simple circles */}
            <g>
              {/* Front wheel */}
              <circle
                cx="60"
                cy="70"
                r="12"
                className="fill-gray-900"
              />
              <circle
                cx="60"
                cy="70"
                r="8"
                className="fill-gray-700"
              />
              <circle
                cx="60"
                cy="70"
                r="3"
                className="fill-gray-900"
              />

              {/* Rear wheel */}
              <circle
                cx="130"
                cy="70"
                r="12"
                className="fill-gray-900"
              />
              <circle
                cx="130"
                cy="70"
                r="8"
                className="fill-gray-700"
              />
              <circle
                cx="130"
                cy="70"
                r="3"
                className="fill-gray-900"
              />
            </g>

            {/* Paint brush stroke effect */}
            <path
              d="M 15 60 L 180 60"
              className="stroke-blue-500 stroke-2 opacity-0 animate-brush-stroke"
              strokeLinecap="round"
            />
          </svg>

          {/* Sparkle effects */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-blue-400 rounded-full animate-sparkle"
                style={{
                  left: `${Math.cos((i * Math.PI) / 2) * 60}px`,
                  top: `${Math.sin((i * Math.PI) / 2) * 40}px`,
                  animationDelay: `${i * 0.2}s`,
                }}
              />
            ))}
          </div>
        </div>

        {/* Loading text */}
        <div className="text-center mt-10 space-y-3">
          <p className="text-gray-800 font-semibold text-xl">
            Let's find your Paint Code!
          </p>
          <div className="flex justify-center gap-1.5">
            {vibgyorColors.slice(0, 3).map((color, i) => (
              <div
                key={i}
                className={`w-2.5 h-2.5 ${color.bg} rounded-full animate-bounce`}
                style={{
                  animationDelay: `${i * 0.15}s`,
                  animationDuration: '0.6s',
                }}
              />
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes drip {
          0% {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
          50% {
            transform: translateY(40px) scale(0.8);
            opacity: 0.8;
          }
          100% {
            transform: translateY(80px) scale(0.5);
            opacity: 0;
          }
        }

        @keyframes speed-line {
          0% {
            transform: translateX(0);
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
          100% {
            transform: translateX(-100px);
            opacity: 0;
          }
        }

        @keyframes paint-fill {
          0% {
            fill: rgb(229, 231, 235); /* gray-200 - start */
          }
          14% {
            fill: rgb(139, 92, 246); /* violet-500 */
          }
          28% {
            fill: rgb(99, 102, 241); /* indigo-500 */
          }
          42% {
            fill: rgb(59, 130, 246); /* blue-500 */
          }
          57% {
            fill: rgb(34, 197, 94); /* green-500 */
          }
          71% {
            fill: rgb(234, 179, 8); /* yellow-500 */
          }
          85% {
            fill: rgb(249, 115, 22); /* orange-500 */
          }
          100% {
            fill: rgb(239, 68, 68); /* red-500 - end */
          }
        }

        @keyframes brush-stroke {
          0% {
            opacity: 0;
            stroke-dasharray: 0 140;
          }
          50% {
            opacity: 0.6;
          }
          100% {
            opacity: 0;
            stroke-dasharray: 140 0;
          }
        }

        @keyframes sparkle {
          0%, 100% {
            transform: scale(0);
            opacity: 0;
          }
          50% {
            transform: scale(1);
            opacity: 1;
          }
        }

        .animate-drip {
          animation: drip infinite;
        }

        .animate-paint-fill {
          animation: paint-fill 3.5s ease-in-out infinite;
        }

        .animate-brush-stroke {
          animation: brush-stroke 3.5s ease-in-out infinite;
        }

        .animate-sparkle {
          animation: sparkle 1.5s ease-in-out infinite;
        }

        .animate-speed-line {
          animation: speed-line 0.8s ease-out infinite;
        }
      `}</style>
    </div>
  );
}
