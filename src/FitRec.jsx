import React from 'react';
import Footer from "./components/Footer";
import Header from "./components/Header";
import FashionUI from './components/FashionUI';

const FitRec = () => {
    return (
    
        <>
          <div className="pt-[4.75rem] lg:pt-[5.25rem] overflow-hidden">
            <Header />
            <FashionUI />
            <Footer />
          </div>
        </>
      );
    };

export default FitRec;
