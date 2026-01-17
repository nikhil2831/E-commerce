import React from 'react'
import './Footer.css'
import footer_logo from '../Assets/logo_big.png'
import instagram_icon from '../Assets/instagram_icon.png'
import pintester_icon from '../Assets/pintester_icon.png'
import whatsapp_icon from '../Assets/whatsapp_icon.png'

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <div className='footer'>
      <div className='footer-logo'>
        <img src={footer_logo} alt="Footer Logo" />
        <p>INDRAMART</p>
      </div>
      <p className="footer-tagline">Your one-stop destination for trendy fashion. Quality products at unbeatable prices.</p>
      
      <ul className='footer_links'>
        <li>Company</li>
        <li>Products</li>
        <li>About Us</li>
        <li>Contact</li>
        <li>Privacy Policy</li>
      </ul>
      
      <div className="footer-socials-icon">
        <div className="footer-icons-container">
            <img src={instagram_icon} alt="Instagram" />
        </div>
        <div className="footer-icons-container">
            <img src={pintester_icon} alt="Pinterest" />
        </div>
        <div className="footer-icons-container">
            <img src={whatsapp_icon} alt="WhatsApp" />
        </div>
      </div>
      
      <div className="footer-contact-info">
        <div className="contact-detail">
          <span>📧 indramart@gmail.com</span>
        </div>
        <div className="contact-detail">
          <span>📞 +91 1234567890</span>
        </div>
      </div>
      
      <div className="footer-bottom">
        <div className="footer-copyright">
          <p>© {currentYear} INDRAMART. All rights reserved.</p>
        </div>
        <div className="footer-payment">
          <span>We accept all major payment methods</span>
        </div>
      </div>
    </div>
  )
}

