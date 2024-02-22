import { CgMouse } from 'react-icons/cg'

import './Home.css'

function Home() {
  return (
    <>
      <div className="banner">
        <p>Welcome to MERN Ecommerce</p>
        <h1>FIND AMAZING PRODUCTS BELOW</h1>

        <a href="#container">
          <button>
            Scroll <CgMouse />
          </button>
        </a>
      </div>
    </>
  )
}

export default Home
