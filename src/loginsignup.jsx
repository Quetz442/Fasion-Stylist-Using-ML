import React from 'react';
import SignupInUI from "./components/signup_inUI";
import Footer from "./components/Footer";
import Header from "./components/Header";

const FitRec = () => {
    return (
    
        <>
          <div className="pt-[4.75rem] lg:pt-[5.25rem] overflow-hidden">
            <Header />
            <SignupInUI />
            <Footer />
           
          </div>
        </>
      );
    };

export default FitRec;