import React from 'react'
import { Link } from 'react-router-dom'

export const Navbar = () => {
  return (
    <nav className="navbar bg-dark">
    <h1>
      <a href="index.html"><i className="fas fa-code"></i> DevConnector</a>
    </h1>
    <ul>
      <li><Link to='/register'>Developers</Link></li>
      <li><Link to='/register'>Register</Link></li>
      <li><Link to='/login'>Login</Link></li>
    </ul>
  </nav>
  )
}
