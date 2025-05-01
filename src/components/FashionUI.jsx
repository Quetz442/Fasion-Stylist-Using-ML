import React, { useState, useEffect, useRef } from "react";
import { BackgroundCircles, Gradient } from "./design/Hero";
import FashionStyles from "./design/FashionStyles";
import { ScrollParallax } from "react-just-parallax";
import Section from "./Section";
import axios from "axios";

const FashionUI = () => {
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [measurements, setMeasurements] = useState({ shoulder: "", bust: "", waist: "", hips: "" });
  const [bodyShape, setBodyShape] = useState("");
  const [colorAnalysis, setColorAnalysis] = useState({ eye: "", hair: "", skin: "" });
  const [season, setSeason] = useState("");
  const [availableSeasons, setAvailableSeasons] = useState([]);
  const [occasion, setOccasion] = useState("");
  const [availableBodyShapes, setAvailableBodyShapes] = useState([]);
  const [availableOccasions, setAvailableOccasions] = useState([]);
  const [recommendations, setRecommendations] = useState(null);
  const [seasonalRecommendations, setSeasonalRecommendations] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [colorAnalysisImage, setColorAnalysisImage] = useState(null);
  const [colorAnalysisImagePreview, setColorAnalysisImagePreview] = useState(null);
  const parallaxRef = useRef(null);
  const [recommendationImages, setRecommendationImages] = useState({});

  // Fetch available body shapes, occasions, and seasons on component mount
  useEffect(() => {
    fetchOptions();
  }, []);

  const fetchOptions = async () => {
    try {
        const bodyShapesResponse = await axios.get("http://127.0.0.1:8000/api/body-shapes/");
        setAvailableBodyShapes(bodyShapesResponse.data || []);
        // Set available seasons
        setAvailableSeasons(["Spring", "Summer", "Autumn", "Winter"]);
        // Set available occasions
        setAvailableOccasions(["Formal", "Casual", "Party", "Workwear", "Streetwear", "Ethnicwear"]);
    } catch (error) {
        console.error("Error fetching options:", error);
        setAvailableBodyShapes(["Hourglass", "Pear", "Apple", "Inverted Triangle", "Rectangle"]);
        // Set available seasons as fallback
        setAvailableSeasons(["Spring", "Summer", "Autumn", "Winter"]);
        // Set available occasions as fallback
        setAvailableOccasions(["Formal", "Casual", "Party", "Workwear", "Streetwear", "Ethnicwear"]);
    }
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImage(file);
      
      // Create image preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleColorAnalysisImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setColorAnalysisImage(file);
      
      // Create image preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setColorAnalysisImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleMeasurementChange = (e) => setMeasurements({ ...measurements, [e.target.name]: e.target.value });
  const handleColorChange = (e) => setColorAnalysis({ ...colorAnalysis, [e.target.name]: e.target.value });

  const detectBodyShape = async () => {
    setLoading(true);
    setError(null);
    
    try {
      if (!image) {
        throw new Error("Please upload an image for body shape detection");
      }
      
      const formData = new FormData();
      formData.append("image", image);
      
      // Add measurements if they are available
      if (measurements.shoulder) formData.append("shoulder", measurements.shoulder);
      if (measurements.bust) formData.append("bust", measurements.bust);
      if (measurements.waist) formData.append("waist", measurements.waist);
      if (measurements.hips) formData.append("hips", measurements.hips);

      const response = await axios.post(
        "http://127.0.0.1:8000/api/detect-body-shape/", 
        formData, 
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.data && response.data.body_shape) {
        setBodyShape(response.data.body_shape);
        alert(`Detected body shape: ${response.data.body_shape}`);
        
        // Automatically fetch recommendations based on the detected body shape
        return response.data.body_shape;
      } else {
        throw new Error("No body shape detected in response");
      }
    } catch (error) {
      console.error("Error detecting body shape:", error);
      setError(`Failed to detect body shape: ${error.message || "Unknown error"}`);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const detectSeason = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Create form data for the API request
      const formData = new FormData();
      
      // Add the face image if available (for face-based seasonal color analysis)
      if (colorAnalysisImage) {
        formData.append("image", colorAnalysisImage);
      } else if (image) {
        // Fallback to the main image if no specific face image is provided
        formData.append("image", image);
      } else if (!colorAnalysis.eye || !colorAnalysis.hair || !colorAnalysis.skin) {
        // If no image is provided, make sure we have the color inputs
        throw new Error("Please either upload a face photo or fill in all color fields");
      }
      
      // Add manual color inputs if they are provided
      if (colorAnalysis.eye) formData.append("eye_color", colorAnalysis.eye);
      if (colorAnalysis.hair) formData.append("hair_color", colorAnalysis.hair);
      if (colorAnalysis.skin) formData.append("skin_tone", colorAnalysis.skin);

      // Call the seasonal color analysis API endpoint
      const response = await axios.post(
        "http://127.0.0.1:8000/api/analyze-seasonal-color/", 
        formData, 
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.data && response.data.season) {
        setSeason(response.data.season);
        
        // Fetch seasonal color recommendations immediately upon detection
        if (response.data.complementary_colors && response.data.color_combinations) {
          setSeasonalRecommendations({
            complementary_colors: response.data.complementary_colors,
            color_combinations: response.data.color_combinations
          });
        } else {
          // If the analyze-seasonal-color endpoint didn't return complete information, fetch it separately
          fetchSeasonalRecommendations(response.data.season);
        }
        
        alert(`Detected season: ${response.data.season}`);
      } else {
        throw new Error("No seasonal color type detected in response");
      }
    } catch (error) {
      console.error("Error detecting season:", error);
      setError(`Failed to detect season: ${error.message || "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchSeasonalRecommendations = async (season) => {
    try {
        const response = await axios.post("http://127.0.0.1:8000/api/season-recommendations/", { season });
        setSeasonalRecommendations(response.data);
    } catch (error) {
        console.error("Error fetching seasonal recommendations:", error);
    }
  };

  // When season changes manually, fetch recommendations
  useEffect(() => {
    if (season) {
      fetchSeasonalRecommendations(season);
    }
  }, [season]);

  const handleRecommend = async (type) => {
    setRecommendationImages({}); // Clear previous recommendation images
    let currentBodyShape = bodyShape;
    
    // If no body shape is selected, try to detect it from the image
    if (!currentBodyShape && image) {
      try {
        setLoading(true);
        currentBodyShape = await detectBodyShape();
        if (!currentBodyShape) {
          alert("Please select or detect a body shape first");
          setLoading(false);
          return;
        }
      } catch (error) {
        console.error("Error in body shape detection:", error);
        alert("Error detecting body shape. Please select manually.");
        setLoading(false);
        return;
      }
    } else if (!currentBodyShape) {
      alert("Please select or detect a body shape first");
      return;
    }
    
    setLoading(true);
    setError(null);
    setRecommendations(null); // Clear previous recommendations
    
    try {
      // Create payload
      const payload = {
        body_shape: currentBodyShape
      };
      
      // Only add occasion if it's selected and we're doing occasion-based recommendation
      if ((type === "occasion" || type === "all") && occasion) {
        payload.occasion = occasion;
      }

      // Add season if it's selected and we're doing seasonal or all recommendations
      if ((type === "seasonal color" || type === "all") && season) {
        payload.season = season;
      }
      
      // Add image to payload if available
      if (image) {
        const formData = new FormData();
        
        // Add all the JSON data
        for (const [key, value] of Object.entries(payload)) {
          formData.append(key, value);
        }
        
        // Add the image file
        formData.append("image", image);
        
        // Make API request with FormData
        const response = await axios.post("http://127.0.0.1:8000/api/recommend/", formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        
        // Process response
        if (response.data && response.data.recommendations) {
          // Merge seasonal recommendations if they exist
          let finalRecs = { ...response.data.recommendations };
          
          // If it's a season-specific recommendation and we have seasonal data
          if ((type === "seasonal color" || type === "all") && seasonalRecommendations) {
            if (seasonalRecommendations.complementary_colors) {
              finalRecs["Complementary Colors"] = seasonalRecommendations.complementary_colors.join(", ");
            }
            if (seasonalRecommendations.color_combinations) {
              finalRecs["Color Combinations"] = seasonalRecommendations.color_combinations.join(", ");
            }
          }
          
          setRecommendations(finalRecs);
          fetchRecommendationImages(finalRecs);
          saveRecommendations(finalRecs); // Save recommendations to the backend
        } else if (response.data && response.data.error) {
          setError(`Error: ${response.data.error}`);
          alert(`Error: ${response.data.error}`);
        } else {
          // Fallback for unexpected response format
          setError("Unknown response format");
          console.error("Unexpected response format:", response.data);
        }
      } else {
        // Make API request without image
        const response = await axios.post("http://127.0.0.1:8000/api/recommend/", payload);
        
        // Process response
        if (response.data && response.data.recommendations) {
          // Merge seasonal recommendations if they exist
          let finalRecs = { ...response.data.recommendations };
          
          // If it's a season-specific recommendation and we have seasonal data
          if ((type === "seasonal color" || type === "all") && seasonalRecommendations) {
            if (seasonalRecommendations.complementary_colors) {
              finalRecs["Complementary Colors"] = seasonalRecommendations.complementary_colors.join(", ");
            }
            if (seasonalRecommendations.color_combinations) {
              finalRecs["Color Combinations"] = seasonalRecommendations.color_combinations.join(", ");
            }
          }
          
          setRecommendations(finalRecs);
          fetchRecommendationImages(finalRecs);
          saveRecommendations(finalRecs); // Save recommendations to the backend
        } else if (response.data && response.data.error) {
          setError(`Error: ${response.data.error}`);
          alert(`Error: ${response.data.error}`);
        } else {
          // Fallback for unexpected response format
          setError("Unknown response format");
          console.error("Unexpected response format:", response.data);
        }
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

  const fetchRecommendationImages = async (recommendations) => {
    if (!recommendations) return;
    
    try {
      const formData = new FormData();
      
      // Add all recommendations to form data
      Object.values(recommendations).forEach(rec => {
        if (rec && typeof rec === 'string') {
          formData.append('recommendations[]', rec);
        }
      });
      
      const response = await axios.post(
        "http://127.0.0.1:8000/api/fetch-recommendation-images/", 
        formData
      );
      
      if (response.data && response.data.images) {
        setRecommendationImages(response.data.images);
      } else {
        console.error("No images found in response");
      }
    } catch (error) {
      console.error("Error fetching recommendation images:", error);
    }
  };

  // Function to save recommendations to the backend
  const saveRecommendations = async (recommendations) => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        console.error("No access token found. User might not be authenticated.");
        return;
      }

      const response = await fetch("http://localhost:8000/api/recommendations/save-recommendations/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Include JWT token
        },
        body: JSON.stringify({
          recommendations: recommendations,
          body_shape: bodyShape || "",
          occasion: occasion || ""
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Failed to save recommendations. Response:", errorText);
        throw new Error("Failed to save recommendations.");
      }

      console.log("Recommendations saved successfully.");
    } catch (error) {
      console.error("Error saving recommendations:", error);
    }
  };

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
              
              {/* Image Upload Section */}
              <div className="mb-6 p-6 border border-blue-500 rounded-lg shadow-lg backdrop-blur-sm bg-n-8/40">
                <h2 className="text-2xl mb-4">Upload Your Photo</h2>
                <div className="flex flex-col md:flex-row gap-6 items-center">
                  <div className="flex-1">
                    <input 
                      type="file" 
                      onChange={handleImageUpload} 
                      className="mb-4 cursor-pointer w-full"
                      accept="image/*"
                    />
                    <p className="text-sm text-gray-400 mb-4">
                      Upload a clear, full-body photo for the most accurate analysis.
                      Front-facing photos work best.
                    </p>
                    <button
                      className="btn-style w-full bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 p-3 rounded-xl font-bold"
                      onClick={detectBodyShape}
                      disabled={loading || !image}
                    >
                      {loading ? "Processing..." : "Detect Body Shape from Photo"}
                    </button>
                  </div>
                  <div className="flex-1 flex justify-center">
                    {imagePreview ? (
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        className="max-h-64 max-w-full object-contain border border-gray-500 rounded-lg"
                      />
                    ) : (
                      <div className="h-64 w-full flex items-center justify-center border border-gray-500 rounded-lg bg-gray-800/50">
                        <p className="text-gray-400">No image uploaded</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                {/* Body Shape Analysis */}
                <div className="p-6 border border-purple-500 rounded-lg shadow-lg hover:scale-105 transform transition duration-300 flex flex-col justify-between h-[600px] backdrop-blur-sm bg-n-8/40">
                  <h2 className="text-2xl mb-4">Body Shape Analysis</h2>
                  <input type="number" name="shoulder" placeholder="Shoulder" value={measurements.shoulder} onChange={handleMeasurementChange} className="input-style bg-n-9/40 backdrop-blur border border-n-1/10 p-3 rounded-xl text-white" />
                  <input type="number" name="bust" placeholder="Bust" value={measurements.bust} onChange={handleMeasurementChange} className="input-style bg-n-9/40 backdrop-blur border border-n-1/10 p-3 rounded-xl text-white" />
                  <input type="number" name="waist" placeholder="Waist" value={measurements.waist} onChange={handleMeasurementChange} className="input-style bg-n-9/40 backdrop-blur border border-n-1/10 p-3 rounded-xl text-white" />
                  <input type="number" name="hips" placeholder="Hips" value={measurements.hips} onChange={handleMeasurementChange} className="input-style bg-n-9/40 backdrop-blur border border-n-1/10 p-3 rounded-xl text-white" />
                  <div className="flex gap-2 items-center">
                    <span className="text-gray-400">Select:</span>
                    <select 
                      value={bodyShape} 
                      onChange={(e) => setBodyShape(e.target.value)} 
                      className="flex-1 input-style bg-n-9/40 backdrop-blur border border-n-1/10 p-3 rounded-xl text-white"
                    >
                      <option value="">Select Body Shape</option>
                      {availableBodyShapes.map((shape, idx) => (
                        <option key={idx} value={shape}>{shape}</option>
                      ))}
                    </select>
                  </div>
                  <div className="bg-gray-800/30 p-4 rounded-lg">
                    <h3 className="text-lg mb-2">Your Body Shape:</h3>
                    <p className="text-2xl font-bold text-purple-400">{bodyShape || "Not detected yet"}</p>
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
                  
                  {/* Face Image Upload */}
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-300 mb-1">Upload Face Photo:</label>
                    <input 
                      type="file" 
                      onChange={handleColorAnalysisImageUpload} 
                      className="cursor-pointer w-full mb-2"
                      accept="image/*"
                    />
                    {colorAnalysisImagePreview && (
                      <div className="w-full flex justify-center mb-2">
                        <img 
                          src={colorAnalysisImagePreview} 
                          alt="Face Preview" 
                          className="h-24 object-contain border border-gray-500 rounded-lg"
                        />
                      </div>
                    )}
                    <p className="text-xs text-gray-400">
                      Upload a clear face photo for accurate color analysis, or enter details manually below
                    </p>
                  </div>
                  
                  <div className="text-center text-sm mb-1">-- OR --</div>
                  
                  {/* Manual color inputs */}
                  <input type="text" name="eye" placeholder="Eye Color" value={colorAnalysis.eye} onChange={handleColorChange} className="input-style bg-n-9/40 backdrop-blur border border-n-1/10 p-3 rounded-xl text-white" />
                  <input type="text" name="hair" placeholder="Hair Color" value={colorAnalysis.hair} onChange={handleColorChange} className="input-style bg-n-9/40 backdrop-blur border border-n-1/10 p-3 rounded-xl text-white" />
                  <input type="text" name="skin" placeholder="Skin Color" value={colorAnalysis.skin} onChange={handleColorChange} className="input-style bg-n-9/40 backdrop-blur border border-n-1/10 p-3 rounded-xl text-white" />
                  
                  <div className="flex gap-2">
                    <button
                      className="btn-style flex-1 bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 p-3 rounded-xl font-bold"
                      onClick={detectSeason}
                      disabled={loading || (!colorAnalysisImage && !image && (!colorAnalysis.eye || !colorAnalysis.hair || !colorAnalysis.skin))}
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
                      {availableSeasons.map((s, idx) => (
                        <option key={idx} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                  <div className="bg-gray-800/30 p-4 rounded-lg">
                    <h3 className="text-lg mb-2">Your Season:</h3>
                    <p className="text-2xl font-bold text-purple-400">{season || "Not detected yet"}</p>
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
                  {availableOccasions.map((occ, idx) => (
                    <option key={idx} value={occ}>{occ}</option>
                  ))}
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
                disabled={loading || (!bodyShape && !image)}
              >
                {loading ? "Processing..." : "Get Full Recommendation"}
              </button>

              {/* Seasonal Color Recommendations Display */}
              {seasonalRecommendations && season && (
                <div className="mt-6 p-6 border border-blue-500 rounded-lg shadow-lg backdrop-blur-sm bg-n-8/40">
                  <h2 className="text-2xl mb-4">{season} Color Palette</h2>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Complementary Colors */}
                    <div className="p-4 border border-purple-300 rounded-lg">
                      <h3 className="text-xl font-semibold mb-2">Complementary Colors</h3>
                      <div className="flex flex-wrap gap-2">
                        {seasonalRecommendations.complementary_colors && 
                          seasonalRecommendations.complementary_colors.map((color, idx) => (
                            <div key={idx} className="flex flex-col items-center">
                              <div 
                                className="w-12 h-12 rounded-full border border-white"
                                style={{
                                  background: color.toLowerCase().replace(' ', ''),
                                  backgroundImage: `linear-gradient(45deg, ${color.toLowerCase().replace(' ', '')}, ${color.toLowerCase().replace(' ', '')}88)`
                                }}
                              ></div>
                              <span className="text-xs mt-1">{color}</span>
                            </div>
                          ))
                        }
                      </div>
                    </div>
                    
                    {/* Color Combinations */}
                    <div className="p-4 border border-purple-300 rounded-lg">
                      <h3 className="text-xl font-semibold mb-2">Color Combinations</h3>
                      <ul className="list-disc pl-5">
                        {seasonalRecommendations.color_combinations && 
                          seasonalRecommendations.color_combinations.map((combo, idx) => (
                            <li key={idx}>{combo}</li>
                          ))
                        }
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* General Recommendations Display */}
              {recommendations && (
                <div className="mt-6 p-6 border border-green-500 rounded-lg shadow-lg backdrop-blur-sm bg-n-8/40">
                  <h2 className="text-2xl mb-4">Your Personalized Recommendations</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Object.entries(recommendations).map(([category, item], idx) => (
                      // Skip if these are displayed in seasonal section
                      category !== "Complementary Colors" && category !== "Color Combinations" ? (
                        <div key={idx} className="p-4 border border-purple-300 rounded-lg">
                          <h3 className="text-xl font-semibold mb-2">{category}</h3>
                          <p>{item}</p>
                        </div>
                      ) : null
                    ))}
                  </div>
                </div>
              )}
              
              {/* Recommendation Images Display */}

{Object.keys(recommendationImages).length > 0 && (
  <div className="mt-6 p-6 border border-pink-500 rounded-lg shadow-lg backdrop-blur-sm bg-n-8/40">
    <h2 className="text-2xl mb-4">Fashion Inspiration</h2>
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {Object.entries(recommendationImages).map(([item, imageUrl], idx) => (
        imageUrl !== "No image found" ? (
          <div key={idx} className="p-2 border border-purple-300 rounded-lg">
            <p className="text-sm font-semibold mb-2 truncate">{item}</p>
            <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-lg">
              <img 
                src={imageUrl} 
                alt={item} 
                className="w-full h-48 object-cover"
                onError={(e) => {e.target.onerror = null; e.target.src = "/api/placeholder/200/200"}}
              />
            </div>
          </div>
        ) : null
      ))}
    </div>
  </div>
)}

              {/* Message when no recommendations yet */}
              {!recommendations && !seasonalRecommendations && (
                <div className="mt-6 p-4 bg-blue-500/20 border border-blue-500 rounded-lg">
                  No recommendations yet. Select options and click a recommend button.
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