import React from 'react'
import { Link } from 'react-router-dom'

const Navbar = () => {
  return (
    <nav className="bg-white shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold text-primary-600">
              PeerLearn
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            <Link 
              to="/browse-tutors" 
              className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
            >
              Browse Tutors
            </Link>
            <Link 
              to="/login" 
              className="btn-primary"
            >
              Login
            </Link>
            <Link 
              to="/register" 
              className="btn-secondary"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
