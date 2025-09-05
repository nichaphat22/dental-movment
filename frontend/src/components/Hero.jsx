// import Carousel from "./Carousel";
import React from "react";
import { HiOutlineArrowLongRight } from "react-icons/hi2";
// import imgHome from '../../public/GroupHome.svg'

import imgHome from "../assets/GroupHome.svg";

import {animate, motion} from "framer-motion";
import { Link } from "react-router-dom";
// import '../tailwind.css'
export const FadeUp = (delay) => {
    return {
        initial: {
            opacity: 0,
            y:50,
        }
        ,
        animate: {
            opacity: 1,
            y: 0,
            transition: {
                type: "spring",
                stiffness: 100,
                duration: 0.5,
                delay: delay,
                ease: "easeInOut"
            }
        }
    }
}

const Hero = () => {
    return <section className='border-none bg-white overflow-hidden relative'>
        <div className="container grid grid-cols-1 md:grid-cols-2 min-h-[650px]">
            {/* Brand Info */}
            <div className="flex flex-col justify-center
                py-14 md:py-0 relative z-20">
                <div className="pl-2 w-70% text-center md:text-left space-y-10 lg:text-left lg:max-w-[600px]">
                   <motion.h1
                    variants={FadeUp(0.6)}
                    initial="initial"
                    animate="animate"
                    className=' text-purple-600 text-3xl lg:text-5xl font-bold
                        !leading-snug md:text-left'>
                            BIOMECHANICS & POSSIBLE MOVEMENT
                    </motion.h1>

                    <motion.div
                    variants={FadeUp(0.8)}
                    initial="initial"
                    animate="animate"
                    
                    className="flex justify-center md:justify-start
                        ">
                        <Link to="/login" className="primary-btn flex items-center gap-2
                        group">
                        Get Started
                        <HiOutlineArrowLongRight className="text-xl group-hover:translate-x-2
                        group-hover:-rotate-45 duration-300"/>
                        </Link>
                    </motion.div> 
                </div>
                
            </div>
            
            {/* Hero Image */}
            <div className="hidden md:flex justify-center items-center ">
                <motion.img 
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.4, ease: "easeInOut" }}
                src={imgHome} alt="imgDental" className="w-[300px] xl:w-[450px] relative z-10 drop-shadow"/>
            </div>
        </div>
    </section>
}

export default Hero;