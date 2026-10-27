import React from 'react';
import Hero from '../components/Hero';
import Categories from '../components/Categories';
import FeaturedProducts from '../components/FeaturedProducts';
import ValueProps from '../components/ValueProps';

const Home = () => {
  return (
    <div>
      <Hero />
      <FeaturedProducts /> 
      <Categories />
      <ValueProps />
    </div>
  );
};

export default Home;