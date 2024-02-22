import { useEffect } from 'react'
import WebFont from 'webfontloader'
import { Routes, Route } from 'react-router-dom'

// CSS import
import './assets/css/App.css'

// Components import
import Header from './components/layout/Header/Header.jsx'
import Footer from './components/layout/Footer/Footer'
import Home from './components/Home/Home'

function App() {
  useEffect(() => {
    WebFont.load({
      google: {
        families: ['Roboto', 'Droid Sans', 'Chilanka'],
      },
    })
  }, [])

  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
      <Footer />
    </>
  )
}

export default App
