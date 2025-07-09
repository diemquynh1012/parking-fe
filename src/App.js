import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import { ModalProvider } from './context/ModalContext';
import { BasketProvider } from './context/BasketContext';

import ParkingFinding from './pages/ParkingFindingPage';
import ParkingDesign from './pages/ParkingDesignPage';
import ParkingSubscription from './pages/ParkingSubscriptionPage';

function App() {
  return (
    <BrowserRouter>
      <BasketProvider>
        <ModalProvider>
          <div className="font-sans">
            <Routes>
              <Route path="/" element={<ParkingFinding />} />
              {/* <Route path="/homepage" element={<ParkingFinding />} /> */}
              <Route path="/design" element={<ParkingDesign />} />
              <Route path="/parking-finding" element={<ParkingFinding />} />
              <Route path="/subscription" element={<ParkingSubscription />} />
              <Route path='/login' element={<LoginForm />} />
              <Route path='/register' element={<RegisterForm />} />
            </Routes>
            <ToastContainer
              position="bottom-right" />
          </div>
        </ModalProvider>
      </BasketProvider>
    </BrowserRouter>
  );
}

export default App;