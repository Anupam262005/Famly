import React from 'react'

const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-purple-100 via-pink-100 to-purple-100 border-t border-purple-200 py-6 mt-12">
  <div className="max-w-7xl mx-auto text-center text-purple-700 text-sm flex flex-col items-center gap-2">
    <p className="font-medium">
      © {new Date().getFullYear()} <span className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-500">FAMLY</span> — Where memories live forever 💜
    </p>
    <p className="text-xs text-purple-500">
      Built with ❤️ for families around the world.
    </p>
  </div>
</footer>

  );
};

export default Footer;