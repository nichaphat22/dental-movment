import React from 'react';
import Hero from '../components/Hero';
import Footer from '../components/Footer/Footer';
// import '../tailwind.css'
const Home = () => {

    return (
        <div  className="mb-2" style={{marginTop: "30px"}}>
        <Hero/>
        <Footer/>
        
        </div>
    )
}

export default Home;