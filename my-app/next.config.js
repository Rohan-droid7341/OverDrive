// next.config.js

/** @type {import('next').NextConfig} */
const nextConfig = {
    // Keep any other existing configurations you have here
    reactStrictMode: true, // Example existing config
  
    images: {
      remotePatterns: [
        {
          protocol: 'https', // Usually 'https'
          hostname: 'avatars.githubusercontent.com', // The hostname from the error
          port: '', // Optional: Defaults to all ports if empty
          pathname: '/u/**', // Optional: Allow only paths starting with /u/ (where avatars are)
        },
        // Add any other domains you need for next/image here
        // For example, if you were still using the weather widget:
        // {
        //   protocol: 'https',
        //   hostname: 'openweathermap.org',
        //   pathname: '/img/wn/**',
        // },
      ],
    },
  };
  
  module.exports = nextConfig;