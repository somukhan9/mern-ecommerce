import playStoreImg from '../../../assets/images/playstore.png'
import appleStoreImg from '../../../assets/images/Appstore.png'

import './Footer.css'

function Footer() {
  return (
    <footer id="footer">
      <div className="leftFooter">
        <h4>DOWNLOAD OUT APP</h4>
        <p>Download App for Android and IOS mobile phone</p>
        <img src={playStoreImg} alt="PlayStore" />
        <img src={appleStoreImg} alt="AppleStore" />
      </div>

      <div className="midFooter">
        <h1>Ecommerce.</h1>
        <p>Hight Quality is our first priority</p>
        <p>Copyright 2022 &copy; SaM</p>
      </div>

      <div className="rightFooter">
        <h4>Follow Us</h4>
        <a href="#">Instragram</a>
        <a href="#">Youtube</a>
        <a href="#">Facebook</a>
      </div>
    </footer>
  )
}

export default Footer
