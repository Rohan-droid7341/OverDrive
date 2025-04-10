import React from 'react';
import Link from 'next/link';

export default function AppItem({ label, href, IconComponent }) {
  if (!IconComponent) {
    console.warn(`IconComponent is missing for label: ${label}`);
  }

  return (
    <Link href={href || '#'} legacyBehavior>
      <a className="
          relative {/* Needed for absolute positioning of background */}
          block {/* Ensure it takes up grid space */}
          p-4 md:p-6
          rounded-xl
          overflow-hidden {/* Clip corners for background */}
          shadow-lg hover:shadow-xl
          transition-all duration-200 ease-in-out
          transform hover:scale-[1.03]
          group
          aspect-square
          text-center
      ">

        <div className="
            absolute inset-0
            w-full h-full
             bg-opacity-30 {/* Translucent Background */}
            backdrop-blur-sm {/* Apply blur HERE */}
            border border-white border-opacity-20 {/* Apply border HERE */}
            rounded-xl {/* Match parent rounding */}
            group-hover:bg-opacity-40 {/* Hover effect on background */}
            transition-colors duration-200
            z-0 {/* Ensure it's behind the content */}
        "></div>


        <div className="
            relative z-10
            hAh-full {/* Take full height of parent */}
            flex flex-col items-center justify-center
        ">
          {IconComponent && (
            <IconComponent className="
                text-3xl sm:text-4xl md:text-5xl
                mb-2 md:mb-3
                text-white {/* Solid white color */}
                group-hover:text-gray-100 {/* Optional subtle hover */}
                transition-colors duration-200
            " />
          )}
          {!IconComponent && <div className="w-10 h-10 mb-2 bg-gray-400 rounded"></div>}

          <span className="
              text-xs sm:text-sm
              font-medium
              text-white {/* Solid white color */}
              group-hover:text-gray-100 {/* Optional subtle hover */}
              transition-colors duration-200
              line-clamp-1
          ">
            {label}
          </span>
        </div>
      </a>
    </Link>
  );
}