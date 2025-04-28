import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { ScrollParallax } from "react-just-parallax";
import { curve } from "../assets";
import Section from "./Section";
import Button from "./Button";
import { BackgroundCircles, Gradient } from "./design/Hero";
import Notification from "./Notification";

const StyledUserProfile = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const parallaxRef = useRef(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const response = await axios.get('http://localhost:8000/api/recommendations/', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setRecommendations(response.data.recommendations);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching recommendations:', error);
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, []);

  return (
    <Section
      className="pt-[12rem] -mt-[5.25rem]"
      crosses
      crossesOffset="lg:translate-y-[5.25rem]"
      customPaddings
      id="user-profile"
    >
      <div className="container relative" ref={parallaxRef}>
        <div className="relative z-1 max-w-[62rem] mx-auto text-center mb-[3.875rem] md:mb-20 lg:mb-[6.25rem]">
          <h1 className="h1 mb-6">
            Your Personal Style&nbsp;Recommendations&nbsp;With {` `}
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
            Discover outfits tailored just for you
          </p>
          <Button href="/explore" white>
            Explore more styles
          </Button>
        </div>

        <div className="relative max-w-[23rem] mx-auto md:max-w-5xl xl:mb-24">
          <div className="relative z-1 p-0.5 rounded-2xl bg-conic-gradient">
            <div className="relative bg-n-8 rounded-[1rem]">
              <div className="h-[1.4rem] bg-n-10 rounded-t-[0.9rem]" />

              <div className="rounded-b-[0.9rem] overflow-hidden p-8">
                {loading ? (
                  <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
                  </div>
                ) : (
                  <>
                    {recommendations.length === 0 ? (
                      <div className="text-center py-16">
                        <h3 className="text-2xl font-bold mb-4 text-white">No recommendations yet</h3>
                        <p className="text-n-2 mb-8">Complete your style profile to get personalized recommendations</p>
                        <Button href="/style-profile" white>Create style profile</Button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {recommendations.map((rec, index) => (
                          <div key={index} className="bg-n-7 rounded-xl overflow-hidden">
                            <div className="aspect-square relative overflow-hidden">
                              {rec.images && Object.values(rec.images)[0] && Object.values(rec.images)[0] !== 'No image found' ? (
                                <img
                                  src={Object.values(rec.images)[0]}
                                  alt={rec.title}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full bg-n-6 flex items-center justify-center">
                                  <span className="text-n-3">No image</span>
                                </div>
                              )}
                            </div>
                            <div className="p-6">
                              <h3 className="text-xl font-bold mb-2 text-white">{rec.title}</h3>
                              <p className="text-n-3 mb-4">{rec.description}</p>
                              
                              {rec.images && Object.keys(rec.images).length > 1 && (
                                <div className="flex flex-wrap gap-2 mt-4">
                                  {Object.entries(rec.images).slice(1).map(([key, url]) => (
                                    url && url !== 'No image found' ? (
                                      <img
                                        key={key}
                                        src={url}
                                        alt={key}
                                        className="w-12 h-12 object-cover rounded-md"
                                      />
                                    ) : null
                                  ))}
                                </div>
                              )}
                              
                              <Button className="mt-4 w-full" white>View details</Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}

                <ScrollParallax isAbsolutelyPositioned>
                  <Notification
                    className="hidden absolute -right-[5.5rem] bottom-[5rem] w-[18rem] xl:flex"
                    title="New style recommendation"
                  />
                </ScrollParallax>
              </div>
            </div>

            <Gradient />
          </div>

          <BackgroundCircles />
        </div>
      </div>
    </Section>
  );
};

export default StyledUserProfile;