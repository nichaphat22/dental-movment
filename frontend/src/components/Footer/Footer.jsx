import React from 'react'
import { motion } from 'framer-motion'
import { HiOutlineEnvelope, HiOutlinePhone } from "react-icons/hi2";
const Footer = () => {
  return (
    <footer className='py-20 px-5 bg-violet-500 text-white'>
        <div className="container">
            <div className="grid grid-cols-1 md:grid-cols-2
            lg:grid-cols-3 gap-8 md:gap-4">
            {/* first section */}
            <div className='space-y-4 max-w-[300px]'>
                <img src="https://upload.wikimedia.org/wikipedia/th/thumb/1/19/DENTISTRY_KKU.svg/800px-DENTISTRY_KKU.svg.png" alt="logo" 
                    width="50"
                    height="50"/>
                    <p>
                        สื่อการเรียนการสอนออนไลน์ เรื่องการเคลื่อนที่ของฟันเทียม ให้ความรู้และสอนด้วยอาจารย์
                        หรือแพทย์ผู้เชี่ยวชาญ จากประสบการณ์จริง 
                    </p>
            </div>
            {/* second section */}
            <div className='grid grid-cols-2 gap-10'>
                <div className='space-y-4'>
                    <h1 className='text-white text-2xl font-medium'>บทเรียน</h1>
                    <div>
                        <ul className='space-y-2 text-lg'>
                            <li className='cursor-pointer hover:text-secondary duration-200'>Biomechanical consideration</li>
                            <li className='cursor-pointer hover:text-secondary duration-200'>Possible movement of RPD</li>
                            <li className='cursor-pointer hover:text-secondary duration-200'>การเคลื่อนที่ของฟันเทียม</li>
                            <li className='cursor-pointer hover:text-secondary duration-200'>RPD sample case</li>
                        </ul>
                    </div>
                </div>
                <div className='space-y-4'>
                    <h1 className='text-white text-2xl font-medium'>สื่อการสอน</h1>
                    <div>
                        <ul className='space-y-2 text-lg'>
                            <li className='cursor-pointer hover:text-secondary duration-200'>3d animatiom</li>
                            <li className='cursor-pointer hover:text-secondary duration-200'>3d model</li>
                            <li className='cursor-pointer hover:text-secondary duration-200'>2d animate</li>
                            <li className='cursor-pointer hover:text-secondary duration-200'>AR</li>
                        </ul>
                    </div>
                </div>
            </div>
            {/* third section */}
            <div>
                <h1 className='text-white text-2xl font-medium'>Contact</h1>
                <div className='flex space-x-6 py-3'>
                    <a href="#">
                        <HiOutlinePhone className='cursor-pointer hover:text-purple-400 hover:scale-105
                        duration-200' />
                    </a>
                    <a href="#">
                        <HiOutlineEnvelope className='cursor-pointer hover:text-purple-400 hover:scale-105
                        duration-200' />
                    </a>
                </div>
            </div>

                 
            </div>
        </div>
      
    </footer>
  )
}

export default Footer
