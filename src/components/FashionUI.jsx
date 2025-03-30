import React, { useState } from "react";
import { BackgroundCircles, Gradient } from "./design/Hero";
import FashionStyles from "./design/FashionStyles";
import { ScrollParallax } from "react-just-parallax";
import { useRef } from "react";
import Section from "./Section";

const FashionUI = () => {
  const [image, setImage] = useState(null);
  const [measurements, setMeasurements] = useState({ shoulder: "", bust: "", waist: "", hips: "" });
  const [bodyShape, setBodyShape] = useState("");
  const [colorAnalysis, setColorAnalysis] = useState({ eye: "", hair: "", skin: "" });
  const [season, setSeason] = useState("");
  const [occasion, setOccasion] = useState("");
  const parallaxRef = useRef(null);

  const handleImageUpload = (event) => setImage(event.target.files[0]);
  const handleMeasurementChange = (e) => setMeasurements({ ...measurements, [e.target.name]: e.target.value });
  const handleColorChange = (e) => setColorAnalysis({ ...colorAnalysis, [e.target.name]: e.target.value });

  const handleRecommend = (type) => {
    console.log(`Running recommendation for ${type}`);
    // Call backend API here
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                {/* Body Shape Analysis */}
                <div className="p-6 border border-purple-500 rounded-lg shadow-lg hover:scale-105 transform transition duration-300 flex flex-col justify-between h-[600px] backdrop-blur-sm bg-n-8/40">
                  <h2 className="text-2xl mb-4">Body Shape Analysis</h2>
                  <input type="file" onChange={handleImageUpload} className="mb-2 cursor-pointer" />
                  <input type="number" name="shoulder" placeholder="Shoulder" onChange={handleMeasurementChange} className="input-style bg-n-9/40 backdrop-blur border border-n-1/10 p-3 rounded-xl text-white" />
                  <input type="number" name="bust" placeholder="Bust" onChange={handleMeasurementChange} className="input-style bg-n-9/40 backdrop-blur border border-n-1/10 p-3 rounded-xl text-white" />
                  <input type="number" name="waist" placeholder="Waist" onChange={handleMeasurementChange} className="input-style bg-n-9/40 backdrop-blur border border-n-1/10 p-3 rounded-xl text-white" />
                  <input type="number" name="hips" placeholder="Hips" onChange={handleMeasurementChange} className="input-style bg-n-9/40 backdrop-blur border border-n-1/10 p-3 rounded-xl text-white" />
                  <select onChange={(e) => setBodyShape(e.target.value)} className="input-style bg-n-9/40 backdrop-blur border border-n-1/10 p-3 rounded-xl text-white">
                    <option value="">Select Body Shape</option>
                    <option value="hourglass">Hourglass</option>
                    <option value="pear">Pear</option>
                    <option value="apple">Apple</option>
                    <option value="inverted">Inverted Triangle</option>
                    <option value="rectangle">Rectangle</option>
                  </select>
                  <button className="btn-style bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 p-3 rounded-xl font-bold" onClick={() => handleRecommend("body shape")}>Recommend</button>
                </div>
                
                {/* Seasonal Colour Analysis */}
                <div className="p-6 border border-purple-500 rounded-lg shadow-lg hover:scale-105 transform transition duration-300 flex flex-col justify-between h-[600px] backdrop-blur-sm bg-n-8/40">
                  <h2 className="text-2xl mb-4">Seasonal Colour Analysis</h2>
                  <input type="file" onChange={handleImageUpload} className="mb-2 cursor-pointer" />
                  <input type="text" name="eye" placeholder="Eye Color" onChange={handleColorChange} className="input-style bg-n-9/40 backdrop-blur border border-n-1/10 p-3 rounded-xl text-white" />
                  <input type="text" name="hair" placeholder="Hair Color" onChange={handleColorChange} className="input-style bg-n-9/40 backdrop-blur border border-n-1/10 p-3 rounded-xl text-white" />
                  <input type="text" name="skin" placeholder="Skin Color" onChange={handleColorChange} className="input-style bg-n-9/40 backdrop-blur border border-n-1/10 p-3 rounded-xl text-white" />
                  <select onChange={(e) => setSeason(e.target.value)} className="input-style bg-n-9/40 backdrop-blur border border-n-1/10 p-3 rounded-xl text-white">
                    <option value="">Select Season</option>
                    <option value="spring">Spring</option>
                    <option value="summer">Summer</option>
                    <option value="autumn">Autumn</option>
                    <option value="winter">Winter</option>
                  </select>
                  <button className="btn-style bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 p-3 rounded-xl font-bold" onClick={() => handleRecommend("seasonal color")}>Recommend</button>
                </div>
              </div>
              
              {/* Occasion Based Recommendation */}
              <div className="mt-6 p-6 border border-purple-500 rounded-lg shadow-lg hover:scale-105 transform transition duration-300 flex flex-col justify-between w-full h-[500px] backdrop-blur-sm bg-n-8/40">
                <h2 className="text-2xl mb-4">Occasion Based Recommendation</h2>
                <select onChange={(e) => setOccasion(e.target.value)} className="input-style bg-n-9/40 backdrop-blur border border-n-1/10 p-3 rounded-xl text-white">
                  <option value="">Select Occasion</option>
                  <option value="formal">Formal</option>
                  <option value="casual">Casual</option>
                  <option value="party">Party</option>
                  <option value="workwear">Workwear</option>
                  <option value="streetwear">Streetwear</option>
                  <option value="ethnicwear">Ethnicwear</option>
                </select>
                <button className="btn-style bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 p-3 rounded-xl font-bold" onClick={() => handleRecommend("occasion")}>Recommend</button>
              </div>
              
              {/* Overall Recommendation */}
              <button className="btn-style w-full mt-6 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 p-3 rounded-xl font-bold" onClick={() => handleRecommend("all")}>Get Full Recommendation</button>
            </div>

            <Gradient />
          </div>

          <BackgroundCircles />
          
          <ScrollParallax isAbsolutelyPositioned>
            <div className="hidden absolute -left-[5.5rem] bottom-[7.5rem] px-1 py-1 bg-n-9/40 backdrop-blur border border-n-1/10 rounded-2xl xl:flex">
              {/* Icons can be added here similar to heroIcons */}
            </div>
          </ScrollParallax>
        </div>
      </div>
    </Section>
  );
};

export default FashionUI;