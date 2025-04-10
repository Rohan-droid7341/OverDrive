// next.config.js

/** @type {import('next').NextConfig} */
const nextConfig = {
  // ... other configurations like reactStrictMode ...
  images: {
    remotePatterns: [
      // --- Your existing entries ---
      { protocol: 'https', hostname: 'avatars.githubusercontent.com', pathname: '/u/**' },
      { protocol: 'https', hostname: 'userpic.codeforces.org', pathname: '/**' },

      // --- Common News Media Hostnames ---
      // Major Networks / Outlets
      { protocol: 'https', hostname: 'media.cnn.com', pathname: '/**' },
      { protocol: 'https', hostname: 'ichef.bbci.co.uk', pathname: '/**' }, // BBC
      { protocol: 'https', hostname: 'static.foxnews.com', pathname: '/**' },
      { protocol: 'https', hostname: 'media.breitbart.com', pathname: '/**' },
      { protocol: 'https', hostname: 's.abcnews.com', pathname: '/**' }, // ABC News
      { protocol: 'https', hostname: 'media.npr.org', pathname: '/**' }, // NPR
      { protocol: 'https', hostname: 'image.cnbcfm.com', pathname: '/**' }, // CNBC
      { protocol: 'https', hostname: 'dims.apnews.com', pathname: '/**' }, // Associated Press
      { protocol: 'https', hostname: 'media.zenfs.com', pathname: '/**' }, // Yahoo / AOL / HuffPost often use this
      { protocol: 'https', hostname: 'img.huffingtonpost.com', pathname: '/**' }, // Huffington Post
      { protocol: 'https', hostname: 's.yimg.com', pathname: '/**' }, // Yahoo

      // Newspapers / Magazines
      { protocol: 'https', hostname: 'static01.nyt.com', pathname: '/**' }, // New York Times
      { protocol: 'https', hostname: 'www.washingtonpost.com', pathname: '/**' }, // WashPo (might use other CDNs too)
      { protocol: 'https', hostname: 'images.wsj.net', pathname: '/**' }, // Wall Street Journal
      { protocol: 'https', hostname: 'www.usatoday.com', pathname: '/**' },
      { protocol: 'https', hostname: 'www.politico.com', pathname: '/**' },
      { protocol: 'https', hostname: 'static.politico.com', pathname: '/**' },
      { protocol: 'https', hostname: 'images.theguardian.com', pathname: '/**' }, // The Guardian
      { protocol: 'https', hostname: 'cdn.vox-cdn.com', pathname: '/**' }, // Vox, The Verge etc.
      { protocol: 'https', hostname: 'techcrunch.com', pathname: '/**' }, // TechCrunch often hosts directly
      { protocol: 'https', hostname: 'mondrian.mashable.com', pathname: '/**' }, // Mashable
      { protocol: 'https', hostname: 'i.insider.com', pathname: '/**' }, // Business Insider
      { protocol: 'https', hostname: 'www.denverpost.com', pathname: '/**' }, // Business Insider

      // Wires / Tech / Other
      { protocol: 'https', hostname: 'c.biztoc.com', pathname: '/**' }, // BizToc
      { protocol: 'https', hostname: 'www.reuters.com', pathname: '/**' }, // Reuters (images might be elsewhere too)
      { protocol: 'https', hostname: 'images.unsplash.com', pathname: '/**' }, // Sometimes used
      { protocol: 'https', hostname: 'images.axios.com', pathname: '/**' }, // Axios
      { protocol: 'https', hostname: 'cdn.arstechnica.net', pathname: '/**' }, // Ars Technica
      { protocol: 'https', hostname: '*.google.com', pathname: '/**' }, // For google news images etc. Use with caution or be more specific.
      { protocol: 'https', hostname: 'imageio.forbes.com', pathname: '/**' }, // Forbes

      // Add more specific domains if you encounter errors...
    ],
  },
};

module.exports = nextConfig;