import { useRef, useState, useEffect } from "react";
import Button from "./Button";
import Section from "./Section";

const Auth = () => {
  const [isSignUpMode, setIsSignUpMode] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationComplete, setAnimationComplete] = useState(false);

  const toggleMode = () => {
    setIsAnimating(true);
    
    // Allow animation to start before changing mode
    setTimeout(() => {
      setIsSignUpMode(!isSignUpMode);
    }, 300);
    
    // Reset animation state after completion
    setTimeout(() => {
      setAnimationComplete(true);
      setTimeout(() => {
        setIsAnimating(false);
        setAnimationComplete(false);
      }, 1000);
    }, 1000);
  };

  return (
    <Section
      className="min-h-screen overflow-hidden"
      id="auth"
    >
      <div className={`auth-container relative w-full min-h-screen bg-black transition-all duration-1000 ease-in-out ${isSignUpMode ? 'sign-up-mode' : ''}`}>
        {/* Curved Background Element */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-purple-400 transition-all duration-1000 ease-in-out" style={{
          clipPath: isSignUpMode ? 
            'polygon(0 0, 0% 100%, 100% 100%)' : 
            'polygon(0 0, 100% 0, 100% 100%, 35% 100%, 0 0)'
        }}></div>
        
        {/* Flying Animation Circle */}
        <div 
          className={`absolute rounded-full bg-purple-600 transition-all duration-1000 ease-in-out ${isAnimating ? 'opacity-100 scale-150' : 'opacity-0 scale-0'}`}
          style={{
            width: '300px',
            height: '300px',
            top: '50%',
            left: isSignUpMode ? '25%' : '75%',
            transform: `translate(-50%, -50%) ${animationComplete ? 'scale(50)' : ''}`,
            zIndex: 5
          }}
        ></div>
        
        {/* Content Container */}
        <div className="container mx-auto relative z-10 h-full flex">
          {/* Left Side - Sign Up Form / Information */}
          <div className={`w-1/2 h-full flex flex-col justify-center items-center text-center transition-all duration-700 ease-in-out ${isSignUpMode ? 'opacity-100' : 'opacity-100'}`}>
            {isSignUpMode ? (
              // Sign Up Form
              <div className="w-full max-w-md px-8 py-12 transition-all duration-500 relative z-20">
                <h1 className="text-3xl font-bold text-white mb-2">
                  StyleAura
                  <div className="h-1 w-32 bg-white mx-auto mt-1"></div>
                </h1>
                <p className="text-white/80 mb-8">Create your account</p>
                
                <div className="space-y-4 mb-6">
                  <input 
                    type="text" 
                    className="w-full px-4 py-3 rounded-full bg-white/90 text-black placeholder:text-gray-500 focus:outline-none"
                    placeholder="Username"
                  />
                  <input 
                    type="email" 
                    className="w-full px-4 py-3 rounded-full bg-white/90 text-black placeholder:text-gray-500 focus:outline-none"
                    placeholder="Email"
                  />
                  <input 
                    type="password" 
                    className="w-full px-4 py-3 rounded-full bg-white/90 text-black placeholder:text-gray-500 focus:outline-none"
                    placeholder="Password"
                  />
                </div>
                
                <button className="bg-white text-purple-600 font-bold uppercase text-sm px-8 py-2 rounded-full hover:bg-opacity-90 transition-colors duration-300 mb-6">
                  Sign Up
                </button>
                
                <p className="text-white/80 mb-4">OR sign up with social channels</p>
                
                <div className="flex justify-center space-x-4">
                  <a href="#" className="w-10 h-10 rounded-full border border-white/50 flex items-center justify-center text-white hover:bg-white/10 transition-colors duration-300">
                    <i className="fab fa-facebook-f"></i>
                  </a>
                  <a href="#" className="w-10 h-10 rounded-full border border-white/50 flex items-center justify-center text-white hover:bg-white/10 transition-colors duration-300">
                    <i className="fab fa-twitter"></i>
                  </a>
                  <a href="#" className="w-10 h-10 rounded-full border border-white/50 flex items-center justify-center text-white hover:bg-white/10 transition-colors duration-300">
                    <i className="fab fa-google"></i>
                  </a>
                </div>
              </div>
            ) : (
              // Left Side Information (when in login mode)
              <div className="w-full max-w-lg px-8 py-12 transition-all duration-500 relative z-20">
                <h2 className="text-3xl font-bold text-white mb-6">New user?</h2>
                <p className="text-white text-lg mb-8 max-w-md mx-auto">
                  Join our growing community of style enthusiasts and discover a world of beauty and fashion at your fingertips.
                </p>
                <button 
                  onClick={toggleMode}
                  className="border-2 border-white text-white font-semibold py-2 px-8 rounded-full hover:bg-white/10 transition-colors duration-300"
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>
          
          {/* Right Side - Login Form / Information */}
          <div className={`w-1/2 h-full flex flex-col justify-center items-center text-center transition-all duration-700 ease-in-out ${isSignUpMode ? 'opacity-100' : 'opacity-100'}`}>
            {!isSignUpMode ? (
              // Login Form
              <div className="w-full max-w-md px-8 py-12 transition-all duration-500 relative z-20">
                <h1 className="text-3xl font-bold text-white mb-2">
                  StyleAura
                  <div className="h-1 w-32 bg-white mx-auto mt-1"></div>
                </h1>
                <p className="text-white/80 mb-8">Welcome back</p>
                
                <div className="space-y-4 mb-6">
                  <input 
                    type="text" 
                    className="w-full px-4 py-3 rounded-full bg-white/90 text-black placeholder:text-gray-500 focus:outline-none"
                    placeholder="Username"
                  />
                  <input 
                    type="password" 
                    className="w-full px-4 py-3 rounded-full bg-white/90 text-black placeholder:text-gray-500 focus:outline-none"
                    placeholder="Password"
                  />
                </div>
                
                <button className="bg-white text-purple-600 font-bold uppercase text-sm px-8 py-2 rounded-full hover:bg-opacity-90 transition-colors duration-300 mb-6">
                  Login
                </button>
                
                <p className="text-white/80 mb-4">OR login with social channels</p>
                
                <div className="flex justify-center space-x-4">
                  <a href="#" className="w-10 h-10 rounded-full border border-white/50 flex items-center justify-center text-white hover:bg-white/10 transition-colors duration-300">
                    <i className="fab fa-facebook-f"></i>
                  </a>
                  <a href="#" className="w-10 h-10 rounded-full border border-white/50 flex items-center justify-center text-white hover:bg-white/10 transition-colors duration-300">
                    <i className="fab fa-twitter"></i>
                  </a>
                  <a href="#" className="w-10 h-10 rounded-full border border-white/50 flex items-center justify-center text-white hover:bg-white/10 transition-colors duration-300">
                    <i className="fab fa-google"></i>
                  </a>
                </div>
              </div>
            ) : (
              // Right Side Information (when in signup mode)
              <div className="w-full max-w-lg px-8 py-12 transition-all duration-500 relative z-20">
                <h2 className="text-3xl font-bold text-white mb-6">One of us?</h2>
                <p className="text-white text-lg mb-8 max-w-md mx-auto">
                  Already part of our StyleAura family? Sign in to access your personalized recommendations and continue your journey.
                </p>
                <button 
                  onClick={toggleMode}
                  className="border-2 border-white text-white font-semibold py-2 px-8 rounded-full hover:bg-white/10 transition-colors duration-300"
                >
                  Sign In
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Section>
  );
};

export default Auth;