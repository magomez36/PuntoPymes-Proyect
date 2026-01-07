import React from 'react';
import Hero from '../../components/Hero';
import Features from '../../components/Features';
import CTA from '../../components/CTA';
import '../../assets/css/home.css';

const Home = () => {
  return (
    <div className="landing-page bg-white min-h-screen">
      {/* El Navbar ya viene del PublicLayout en App.js, no lo pongas aquí */}
      
      <Hero />
      <Features />
      <CTA />
      
      {/* El Footer también viene del PublicLayout en App.js */}
    </div>
  );
};

export default Home;