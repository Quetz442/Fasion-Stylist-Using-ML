import React, { useState, useEffect, useRef } from "react";
import { BackgroundCircles, Gradient } from "./design/Hero";
import FashionStyles from "./design/FashionStyles";
import { ScrollParallax } from "react-just-parallax";
import Section from "./Section";
import axios from "axios";

const FashionUI = () => {
  const [image, setImage] = useState(null);
  const [measurements, setMeasurements] = useState({ shoulder: "", bust: "", waist: "", hips: "" });
  const [bodyShape, setBodyShape] = useState("");
  const [colorAnalysis, setColorAnalysis] = useState({ eye: "", hair: "", skin: "" });
  const [season, setSeason] = useState("");
  const [occasion, setOccasion] = useState("");
  const [availableBodyShapes, setAvailableBodyShapes] = useState([]);
  const [availableOccasions, setAvailableOccasions] = useState([]);
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const parallaxRef = useRef(null);

  // Fetch available body shapes and occasions on component mount
  useEffect(() => {
    fetchOptions();
  }, []);

  const fetchOptions = async () => {
    try {
      const bodyShapesResponse = await axios.get("http://127.0.0.1:8000/api/body-shapes/");
      const occasionsResponse = await axios.get("http://127.0.0.1:8000/api/occasions/");
      
      setAvailableBodyShapes(bodyShapesResponse.data || []);
      setAvailableOccasions(occasionsResponse.data || []);
    } catch (error) {
      console.error("Error fetching options:", error);
      // Fall back to default values if API fails
      setAvailableBodyShapes(["Hourglass", "Pear", "Apple", "Inverted Triangle", "Rectangle"]);
      setAvailableOccasions(["Formal", "Casual", "Party", "Workwear", "Streetwear", "Ethnicwear"]);
    }
  };

  const handleImageUpload = (event) => setImage(event.target.files[0]);
  const handleMeasurementChange = (e) => setMeasurements({ ...measurements, [e.target.name]: e.target.value });
  const handleColorChange = (e) => setColorAnalysis({ ...colorAnalysis, [e.target.name]: e.target.value });

  const detectBodyShape = async () => {
    if (!measurements.shoulder || !measurements.bust || !measurements.waist || !measurements.hips) {
      alert("Please fill in all measurement fields");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      if (image) {
        formData.append("image", image);
      }
      formData.append("shoulder", measurements.shoulder);
      formData.append("bust", measurements.bust);
      formData.append("waist", measurements.waist);
      formData.append("hips", measurements.hips);

      const response = await axios.post("http://127.0.0.1:8000/api/detect-body-shape/", formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data && response.data.body_shape) {
        setBodyShape(response.data.body_shape);
        alert(`Detected body shape: ${response.data.body_shape}`);
      }
    } catch (error) {
      console.error("Error detecting body shape:", error);
      setError("Failed to detect body shape. Please try again or select manually.");
    } finally {
      setLoading(false);
    }
  };

  const detectSeason = async () => {
    if (!colorAnalysis.eye || !colorAnalysis.hair || !colorAnalysis.skin) {
      alert("Please fill in all color fields");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      if (image) {
        formData.append("image", image);
      }
      formData.append("eye_color", colorAnalysis.eye);
      formData.append("hair_color", colorAnalysis.hair);
      formData.append("skin_tone", colorAnalysis.skin);

      const response = await axios.post("http://127.0.0.1:8000/api/detect-season/", formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data && response.data.season) {
        setSeason(response.data.season);
        alert(`Detected season: ${response.data.season}`);
      }
    } catch (error) {
      console.error("Error detecting season:", error);
      setError("Failed to detect season. Please try again or select manually.");
    } finally {
      setLoading(false);
    }
  };

  const handleRecommend = async (type) => {
    if (!bodyShape) {
      alert("Please select or detect a body shape first");
      return;
    }
    
    setLoading(true);
    setError(null);
    setRecommendations(null); // Clear previous recommendations
    
    try {
      // Create payload
      const payload = {
        body_shape: bodyShape
      };
      
      // Only add occasion if it's selected and we're doing occasion-based recommendation
      if ((type === "occasion" || type === "all") && occasion) {
        payload.occasion = occasion;
      }
      
      // For debugging only
      console.log("Sending request to backend:", payload);
      
      // Make API request
      const response = await axios.post("http://127.0.0.1:8000/api/recommend/", payload);
      
      // For debugging only
      console.log("Received response from backend:", response.data);
      
      // Process response
      if (response.data && response.data.recommendations) {
        // The response may come in different formats depending on your backend
        // Make sure it matches what your component expects
        setRecommendations(response.data.recommendations);
        
        // Log the data that will be rendered
        console.log("Setting recommendations:", response.data.recommendations);
      } else if (response.data && response.data.error) {
        setError(`Error: ${response.data.error}`);
        alert(`Error: ${response.data.error}`);
      } else if (!response.data || Object.keys(response.data).length === 0) {
        // Handle empty response
        setError("Received empty response from server");
        console.error("Empty response received");
      } else {
        // Fallback for unexpected response format
        setError("Unknown response format");
        console.error("Unexpected response format:", response.data);
      }
    } catch (error) {
      // Handle errors
      console.error("Error fetching recommendations:", error);
      
      let errorMessage = "Failed to get recommendations";
      
      if (error.response) {
        // The request was made and the server responded with an error status
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
        errorMessage = `Server error: ${error.response.status}`;
        
        if (error.response.data && error.response.data.error) {
          errorMessage += ` - ${error.response.data.error}`;
        }
      } else if (error.request) {
        // The request was made but no response was received
        errorMessage = "No response received from server. Check if the backend is running.";
      } else {
        // Something else happened while setting up the request
        errorMessage = `Error: ${error.message}`;
      }
      
      setError(errorMessage);
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // For debugging - log when recommendations state changes
  useEffect(() => {
    console.log("Recommendations state updated:", recommendations);
  }, [recommendations]);

  return (
    <Section
      className="pt-[8rem] -mt-[5.25rem]"
      crosses
      crossesOffset="lg:translate-y-[5.25rem]"
      customPaddings
      id="fashion"
    >
      <div className="container relative" ref={parallaxRef}>
        <div className="relative z-1 max-w-[62rem] mx-auto text-center mb-[3.875rem] md:mb-20 lg:mb-[6.25rem]">
          <h1 className="h1 mb-6">
            Fashion <span className="inline-block relative">Recommendation</span>
          </h1>
          <p className="body-1 max-w-3xl mx-auto mb-6 text-n-2 lg:mb-8">
            Find your perfect style with AI-powered recommendations
          </p>
        </div>

        <div className="relative max-w-[62rem] mx-auto md:max-w-6xl xl:mb-24">
          <div className="relative z-1 p-0.5 rounded-2xl bg-conic-gradient">
            <div className="relative bg-n-8 rounded-[1rem] p-6">
              <div className="h-[1.4rem] bg-n-10 rounded-t-[0.9rem] -mt-6 -mx-6 mb-6" />

              {/* Display any errors at the top */}
              {error && (
                <div className="mb-6 p-4 bg-red-500/20 border border-red-500 rounded-lg text-red-100">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                {/* Body Shape Analysis */}
                <div className="p-6 border border-purple-500 rounded-lg shadow-lg hover:scale-105 transform transition duration-300 flex flex-col justify-between h-[600px] backdrop-blur-sm bg-n-8/40">
                  <h2 className="text-2xl mb-4">Body Shape Analysis</h2>
                  <input type="file" onChange={handleImageUpload} className="mb-2 cursor-pointer" />
                  <input type="number" name="shoulder" placeholder="Shoulder" value={measurements.shoulder} onChange={handleMeasurementChange} className="input-style bg-n-9/40 backdrop-blur border border-n-1/10 p-3 rounded-xl text-white" />
                  <input type="number" name="bust" placeholder="Bust" value={measurements.bust} onChange={handleMeasurementChange} className="input-style bg-n-9/40 backdrop-blur border border-n-1/10 p-3 rounded-xl text-white" />
                  <input type="number" name="waist" placeholder="Waist" value={measurements.waist} onChange={handleMeasurementChange} className="input-style bg-n-9/40 backdrop-blur border border-n-1/10 p-3 rounded-xl text-white" />
                  <input type="number" name="hips" placeholder="Hips" value={measurements.hips} onChange={handleMeasurementChange} className="input-style bg-n-9/40 backdrop-blur border border-n-1/10 p-3 rounded-xl text-white" />
                  <div className="flex gap-2">
                    <button
                      className="btn-style flex-1 bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 p-3 rounded-xl font-bold"
                      onClick={detectBodyShape}
                      disabled={loading}
                    >
                      {loading ? "Processing..." : "Detect Shape"}
                    </button>
                    <span>OR</span>
                    <select 
                      value={bodyShape} 
                      onChange={(e) => setBodyShape(e.target.value)} 
                      className="flex-1 input-style bg-n-9/40 backdrop-blur border border-n-1/10 p-3 rounded-xl text-white"
                    >
                      <option value="">Select Body Shape</option>
                      {availableBodyShapes.length > 0 
                        ? availableBodyShapes.map((shape, idx) => (
                            <option key={idx} value={shape}>{shape}</option>
                          ))
                        : ["Hourglass", "Pear", "Apple", "Inverted Triangle", "Rectangle"].map((shape, idx) => (
                            <option key={idx} value={shape}>{shape}</option>
                          ))
                      }
                    </select>
                  </div>
                  <button
                    className="btn-style bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 p-3 rounded-xl font-bold"
                    onClick={() => handleRecommend("body shape")}
                    disabled={loading || !bodyShape}
                  >
                    Recommend for {bodyShape || "Body Shape"}
                  </button>
                </div>
                
                {/* Seasonal Colour Analysis */}
                <div className="p-6 border border-purple-500 rounded-lg shadow-lg hover:scale-105 transform transition duration-300 flex flex-col justify-between h-[600px] backdrop-blur-sm bg-n-8/40">
                  <h2 className="text-2xl mb-4">Seasonal Colour Analysis</h2>
                  <input type="file" onChange={handleImageUpload} className="mb-2 cursor-pointer" />
                  <input type="text" name="eye" placeholder="Eye Color" value={colorAnalysis.eye} onChange={handleColorChange} className="input-style bg-n-9/40 backdrop-blur border border-n-1/10 p-3 rounded-xl text-white" />
                  <input type="text" name="hair" placeholder="Hair Color" value={colorAnalysis.hair} onChange={handleColorChange} className="input-style bg-n-9/40 backdrop-blur border border-n-1/10 p-3 rounded-xl text-white" />
                  <input type="text" name="skin" placeholder="Skin Color" value={colorAnalysis.skin} onChange={handleColorChange} className="input-style bg-n-9/40 backdrop-blur border border-n-1/10 p-3 rounded-xl text-white" />
                  <div className="flex gap-2">
                    <button
                      className="btn-style flex-1 bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 p-3 rounded-xl font-bold"
                      onClick={detectSeason}
                      disabled={loading}
                    >
                      {loading ? "Processing..." : "Detect Season"}
                    </button>
                    <span>OR</span>
                    <select 
                      value={season} 
                      onChange={(e) => setSeason(e.target.value)} 
                      className="flex-1 input-style bg-n-9/40 backdrop-blur border border-n-1/10 p-3 rounded-xl text-white"
                    >
                      <option value="">Select Season</option>
                      <option value="Spring">Spring</option>
                      <option value="Summer">Summer</option>
                      <option value="Autumn">Autumn</option>
                      <option value="Winter">Winter</option>
                    </select>
                  </div>
                  <button 
                    className="btn-style bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 p-3 rounded-xl font-bold" 
                    onClick={() => handleRecommend("seasonal color")}
                    disabled={loading || !season || !bodyShape}
                  >
                    Recommend for {season || "Season"}
                  </button>
                </div>
              </div>
              
              {/* Occasion Based Recommendation */}
              <div className="mt-6 p-6 border border-purple-500 rounded-lg shadow-lg hover:scale-105 transform transition duration-300 flex flex-col justify-between w-full h-[250px] backdrop-blur-sm bg-n-8/40">
                <h2 className="text-2xl mb-4">Occasion Based Recommendation</h2>
                <select 
                  value={occasion} 
                  onChange={(e) => setOccasion(e.target.value)} 
                  className="input-style bg-n-9/40 backdrop-blur border border-n-1/10 p-3 rounded-xl text-white"
                >
                  <option value="">Select Occasion</option>
                  {availableOccasions.length > 0 
                    ? availableOccasions.map((occ, idx) => (
                        <option key={idx} value={occ}>{occ}</option>
                      ))
                    : ["Formal", "Casual", "Party", "Workwear", "Streetwear", "Ethnicwear"].map((occ, idx) => (
                        <option key={idx} value={occ}>{occ}</option>
                      ))
                  }
                </select>
                <button 
                  className="btn-style bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 p-3 rounded-xl font-bold" 
                  onClick={() => handleRecommend("occasion")}
                  disabled={loading || !occasion || !bodyShape}
                >
                  Recommend for {occasion || "Occasion"}
                </button>
              </div>
              
              {/* Overall Recommendation */}
              <button 
                className="btn-style w-full mt-6 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 p-3 rounded-xl font-bold" 
                onClick={() => handleRecommend("all")}
                disabled={loading || !bodyShape}
              >
                {loading ? "Processing..." : "Get Full Recommendation"}
              </button>

              {/* Recommendations Display - Debug state visible */}
              {recommendations === null ? (
                <div className="mt-6 p-4 bg-blue-500/20 border border-blue-500 rounded-lg">
                  No recommendations yet. Select options and click a recommend button.
                </div>
              ) : Object.keys(recommendations).length === 0 ? (
                <div className="mt-6 p-4 bg-yellow-500/20 border border-yellow-500 rounded-lg">
                  Recommendations received but empty. Try different options.
                </div>
              ) : (
                <div className="mt-6 p-6 border border-green-500 rounded-lg shadow-lg backdrop-blur-sm bg-n-8/40">
                  <h2 className="text-2xl mb-4">Your Personalized Recommendations</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Object.entries(recommendations).map(([category, item], idx) => (
                      <div key={idx} className="p-4 border border-purple-300 rounded-lg">
                        <h3 className="text-xl font-semibold mb-2">{category}</h3>
                        <p>{item}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Debug info for development only */}
              {process.env.NODE_ENV === 'development' && (
                <div className="mt-6 p-4 bg-gray-800 border border-gray-700 rounded-lg text-xs overflow-auto max-h-64">
                  <h3 className="text-gray-400 mb-2">Debug Info:</h3>
                  <div>
                    <p>Body Shape: {bodyShape || 'None'}</p>
                    <p>Occasion: {occasion || 'None'}</p>
                    <p>Season: {season || 'None'}</p>
                    <p>Has Recommendations: {recommendations ? 'Yes' : 'No'}</p>
                    {recommendations && (
                      <pre>{JSON.stringify(recommendations, null, 2)}</pre>
                    )}
                  </div>
                </div>
              )}
            </div>

            <Gradient />
          </div>

          <BackgroundCircles />
        </div>
      </div>
    </Section>
  );
};

export default FashionUI;