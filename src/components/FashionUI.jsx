import React, { useState } from "react";
import FashionStyles from "./design/FashionStyles";

const FashionUI = () => {
  const [image, setImage] = useState(null);
  const [measurements, setMeasurements] = useState({ shoulder: "", bust: "", waist: "", hips: "" });
  const [bodyShape, setBodyShape] = useState("");
  const [colorAnalysis, setColorAnalysis] = useState({ eye: "", hair: "", skin: "" });
  const [season, setSeason] = useState("");
  const [occasion, setOccasion] = useState("");

  const handleImageUpload = (event) => setImage(event.target.files[0]);
  const handleMeasurementChange = (e) => setMeasurements({ ...measurements, [e.target.name]: e.target.value });
  const handleColorChange = (e) => setColorAnalysis({ ...colorAnalysis, [e.target.name]: e.target.value });

  const handleRecommend = (type) => {
    console.log(`Running recommendation for ${type}`);
    // Call backend API here
  };

  return (
    <div className="bg-black text-white p-6 min-h-screen">
      <h1 className="text-center text-purple-400 text-3xl font-bold mb-6">Fashion Recommendation</h1>
      
      {/* Body Shape Analysis */}
      <div className="mb-6 p-4 border border-purple-500 rounded-lg">
        <h2 className="text-xl mb-4">Body Shape Analysis</h2>
        <input type="file" onChange={handleImageUpload} className="mb-2" />
        <input type="number" name="shoulder" placeholder="Shoulder" onChange={handleMeasurementChange} className="input-style" />
        <input type="number" name="bust" placeholder="Bust" onChange={handleMeasurementChange} className="input-style" />
        <input type="number" name="waist" placeholder="Waist" onChange={handleMeasurementChange} className="input-style" />
        <input type="number" name="hips" placeholder="Hips" onChange={handleMeasurementChange} className="input-style" />
        <select onChange={(e) => setBodyShape(e.target.value)} className="input-style">
          <option value="">Select Body Shape</option>
          <option value="hourglass">Hourglass</option>
          <option value="pear">Pear</option>
          <option value="apple">Apple</option>
          <option value="inverted">Inverted Triangle</option>
          <option value="rectangle">Rectangle</option>
        </select>
        <button className="btn-style" onClick={() => handleRecommend("body shape")}>Recommend</button>
      </div>
      
      {/* Seasonal Colour Analysis */}
      <div className="mb-6 p-4 border border-purple-500 rounded-lg">
        <h2 className="text-xl mb-4">Seasonal Colour Analysis</h2>
        <input type="file" onChange={handleImageUpload} className="mb-2" />
        <input type="text" name="eye" placeholder="Eye Color" onChange={handleColorChange} className="input-style" />
        <input type="text" name="hair" placeholder="Hair Color" onChange={handleColorChange} className="input-style" />
        <input type="text" name="skin" placeholder="Skin Color" onChange={handleColorChange} className="input-style" />
        <select onChange={(e) => setSeason(e.target.value)} className="input-style">
          <option value="">Select Season</option>
          <option value="spring">Spring</option>
          <option value="summer">Summer</option>
          <option value="autumn">Autumn</option>
          <option value="winter">Winter</option>
        </select>
        <button className="btn-style" onClick={() => handleRecommend("seasonal color")}>Recommend</button>
      </div>
      
      {/* Occasion Based Recommendation */}
      <div className="mb-6 p-4 border border-purple-500 rounded-lg">
        <h2 className="text-xl mb-4">Occasion Based Recommendation</h2>
        <select onChange={(e) => setOccasion(e.target.value)} className="input-style">
          <option value="">Select Occasion</option>
          <option value="formal">Formal</option>
          <option value="casual">Casual</option>
          <option value="party">Party</option>
          <option value="workwear">Workwear</option>
          <option value="streetwear">Streetwear</option>
          <option value="ethnicwear">Ethnicwear</option>
        </select>
        <button className="btn-style" onClick={() => handleRecommend("occasion")}>Recommend</button>
      </div>
      
      {/* Overall Recommendation */}
      <button className="btn-style w-full mt-4" onClick={() => handleRecommend("all")}>Get Full Recommendation</button>
    </div>
  );
};

export default FashionUI;
