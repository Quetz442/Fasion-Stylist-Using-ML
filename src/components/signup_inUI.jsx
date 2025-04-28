import { useRef, useState } from "react";
import axios from "axios";
import Button from "./Button";
import Section from "./Section";
import { BackgroundCircles, Gradient } from "./design/Hero";
import { curve } from "../assets";
import { useAuth } from "./AuthContext";
import { useNavigate } from "react-router-dom";
import API, { setAccessToken } from "../api"; // Import the Axios instance and setAccessToken

axios.defaults.withCredentials = true;

const Auth = () => {
  const [isSignUpMode, setIsSignUpMode] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const parallaxRef = useRef(null);
  const { setIsAuthenticated } = useAuth();
  const navigate = useNavigate(); // Initialize navigate

  const toggleMode = () => {
    setIsSignUpMode(!isSignUpMode);
    setError("");
    setSuccess("");
  };

  const handleSignup = async (e) => {
    e.preventDefault(); // Prevent default form submission behavior
    try {
      console.log("Sending signup request:", { username, email, password }); // Debugging
      const response = await API.post("signup/", { username, email, password });
      console.log("Signup response:", response.data); // Debugging
      setSuccess(response.data.message);
      setError("");
    } catch (err) {
      console.error("Signup error:", err.response?.data || err.message); // Debugging
      setError(err.response?.data?.error || "Signup failed.");
      setSuccess("");
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault(); // Prevent default form submission behavior
    try {
      const response = await API.post("login/", { username, password });
      console.log("Login response:", response.data); // Debugging
      setSuccess(response.data.message);
      setError("");
      // Set the access token for authenticated requests
      setAccessToken(response.data.access);
      localStorage.setItem("access_token", response.data.access); // Store token in localStorage
      setIsAuthenticated(true); // Update global authentication state
      navigate("/FitRec"); // Navigate to FitRec after login
    } catch (err) {
      console.error("Login error:", err.response?.data || err.message); // Debugging
      setError(err.response?.data?.error || "Login failed.");
      setSuccess("");
    }
  };

  const validateUser = async () => {
    try {
      console.log("Validating user session..."); // Debugging
      const response = await API.get("validate-user/");
      console.log("Validation response:", response.data); // Debugging
      if (response.data.authenticated) {
        setIsAuthenticated(true);
      } else {
        navigate("/Sign"); // Redirect to the login/signup page if not authenticated
      }
    } catch (err) {
      console.error("Validation error:", err.response?.data || err.message); // Debugging
      navigate("/Sign"); // Redirect to the login/signup page if an error occurs
    }
  };

  return (
    <Section
      className="pt-[12rem] -mt-[5.25rem]"
      crosses
      crossesOffset="lg:translate-y-[5.25rem]"
      customPaddings
      id="auth"
    >
      <div className="container relative" ref={parallaxRef}>
        <div className="relative z-1 max-w-[62rem] mx-auto text-center mb-[3.875rem] md:mb-20 lg:mb-[6.25rem]">
          <h1 className="h1 mb-6">
            Welcome to {` `}
            <span className="inline-block relative">
              StyleAura{" "}
              <img
                src={curve}
                className="absolute top-full left-0 w-full xl:-mt-2"
                width={624}
                height={28}
                alt="Curve"
              />
            </span>
          </h1>
          <p className="body-1 max-w-3xl mx-auto mb-6 text-n-2 lg:mb-8">
            {isSignUpMode
              ? "Create an account to unlock your style journey"
              : "Sign in to continue your style journey"}
          </p>
        </div>

        <div className="relative max-w-[62rem] mx-auto md:max-w-5xl xl:mb-24">
          <div className="relative z-1 p-0.5 rounded-2xl bg-conic-gradient overflow-hidden">
            <div className="relative bg-n-8 rounded-[1rem] min-h-[30rem]">
              <div className="h-[1.4rem] bg-n-10 rounded-t-[0.9rem]" />

              {/* Content Container */}
              <div className="flex flex-col md:flex-row w-full h-full">
                {/* Left Side - Sign Up Form / Information */}
                <div
                  className={`w-full md:w-1/2 h-full flex flex-col justify-center items-center text-center py-8 px-4 md:px-8 transition-all duration-300 ease-in-out`}
                >
                  {isSignUpMode ? (
                    // Sign Up Form
                    <form onSubmit={handleSignup} className="w-full max-w-md transition-all duration-500 relative z-20">
                      <h2 className="text-2xl font-bold text-white mb-6">
                        Create Account
                      </h2>
                      {error && <p className="text-red-500">{error}</p>}
                      {success && <p className="text-green-500">{success}</p>}
                      <div className="space-y-4 mb-6">
                        {/* Username Input */}
                        <input
                          type="text"
                          className="w-full px-4 py-3 rounded-full bg-n-6 text-white placeholder:text-n-3 focus:outline-none border border-n-5 focus:border-color-1"
                          placeholder="Username"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          required
                          autoComplete="username" // Add autocomplete attribute
                        />

                        {/* Email Input (for Signup) */}
                        {isSignUpMode && (
                          <input
                            type="email"
                            className="w-full px-4 py-3 rounded-full bg-n-6 text-white placeholder:text-n-3 focus:outline-none border border-n-5 focus:border-color-1"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            autoComplete="email" // Add autocomplete attribute
                          />
                        )}

                        {/* Password Input */}
                        <input
                          type="password"
                          className="w-full px-4 py-3 rounded-full bg-n-6 text-white placeholder:text-n-3 focus:outline-none border border-n-5 focus:border-color-1"
                          placeholder="Password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          autoComplete={isSignUpMode ? "new-password" : "current-password"} // Add autocomplete attribute
                        />
                      </div>

                      <Button white className="mb-2" type="submit">
                        Sign Up
                      </Button>
                    </form>
                  ) : (
                    // Left Side Information (when in login mode)
                    <div className="w-full max-w-lg transition-all duration-500 relative z-20">
                      <h2 className="text-2xl font-bold text-white mb-6">
                        New to StyleAura?
                      </h2>
                      <p className="text-n-3 text-lg mb-8 max-w-md mx-auto">
                        Join our growing community of style enthusiasts and
                        discover a world of beauty and fashion at your
                        fingertips.
                      </p>
                      <Button
                        onClick={toggleMode}
                        className="bg-transparent border border-n-1"
                      >
                        Sign Up
                      </Button>
                    </div>
                  )}
                </div>

                {/* Right Side - Login Form / Information */}
                <div
                  className={`w-full md:w-1/2 h-full flex flex-col justify-center items-center text-center py-8 px-4 md:px-8 transition-all duration-300 ease-in-out`}
                >
                  {!isSignUpMode ? (
                    // Login Form
                    <form onSubmit={handleLogin} className="w-full max-w-md transition-all duration-500 relative z-20">
                      <h2 className="text-2xl font-bold text-white mb-6">
                        Welcome Back
                      </h2>
                      {error && <p className="text-red-500">{error}</p>}
                      {success && <p className="text-green-500">{success}</p>}
                      <div className="space-y-4 mb-6">
                        {/* Username Input */}
                        <input
                          type="text"
                          className="w-full px-4 py-3 rounded-full bg-n-6 text-white placeholder:text-n-3 focus:outline-none border border-n-5 focus:border-color-1"
                          placeholder="Username"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          required
                          autoComplete="username" // Add autocomplete attribute
                        />

                        {/* Password Input */}
                        <input
                          type="password"
                          className="w-full px-4 py-3 rounded-full bg-n-6 text-white placeholder:text-n-3 focus:outline-none border border-n-5 focus:border-color-1"
                          placeholder="Password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          autoComplete={isSignUpMode ? "new-password" : "current-password"} // Add autocomplete attribute
                        />
                      </div>

                      <Button white className="mb-2" type="submit">
                        Sign In
                      </Button>
                    </form>
                  ) : (
                    // Right Side Information (when in signup mode)
                    <div className="w-full max-w-lg transition-all duration-500 relative z-20">
                      <h2 className="text-2xl font-bold text-white mb-6">
                        Already a Member?
                      </h2>
                      <p className="text-n-3 text-lg mb-8 max-w-md mx-auto">
                        Already part of our StyleAura family? Sign in to access
                        your personalized recommendations and continue your
                        journey.
                      </p>
                      <Button
                        onClick={toggleMode}
                        className="bg-transparent border border-n-1"
                      >
                        Sign In
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Background Gradient effect */}
            <Gradient />
          </div>

          {/* Background circles effect from Hero component */}
          <BackgroundCircles />
        </div>
      </div>
    </Section>
  );
};

export default Auth;
