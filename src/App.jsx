import { Routes, Route } from 'react-router-dom'
import Header from './Component/Header'
import Footer from './Component/Footer'
import ScrollToTop from './Component/ScrollToTop'
import Home from './pages/Home'
import ResumeMaker from './pages/ResumeMaker'
import PassportPhoto from './pages/PassportPhoto'
import PDFTools from './pages/PDFTools'
import PrivacyPolicy from './pages/PrivacyPolicy'
import TermsOfService from './pages/TermsOfService'
import ContactUs from './pages/ContactUs'

export default function App() {
  return (
    <div className="min-h-screen flex flex-col items-center">
      <ScrollToTop />
      <Header />
      <main className="flex-1 w-full flex flex-col items-center">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/resume-maker" element={<ResumeMaker />} />
          <Route path="/passport-maker" element={<PassportPhoto />} />
          <Route path="/pdf-tools" element={<PDFTools />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/contact" element={<ContactUs />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}
