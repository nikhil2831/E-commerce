import React from 'react'
import './DescriptionBox.css'

export default function DescriptionBox() {
  return (
    <div className='description-box'>
      <div className="descriptionbox-navigator">
        <div className="description-nav-box active">
          Description
        </div>
        <div className="description-nav-box fade">
          Reviews (122)
        </div>
      </div>
      <div className="description-description">
        <p>
          Indra Mart is one of the fastest-growing online shopping platforms, 
          offering a wide range of products including electronics, fashion, 
          home essentials, and groceries. It provides customers with a 
          user-friendly interface, secure payment options, and quick delivery 
          services. With exclusive deals, discounts, and a strong focus on 
          customer satisfaction, Indra Mart aims to make online shopping 
          simple, affordable, and reliable for everyone.
        </p>
      </div>
    </div>
  )
}
