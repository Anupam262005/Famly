import { useState } from 'react'
import { Outlet } from "react-router-dom";


import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Footer from './components/Common/Footer.jsx';
import Header from './components/Common/Header.jsx';

function App() {
  return (<>
    <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    <div className="flex flex-col min-h-screen">
      <Header />

      {/* Make sure main expands to fill space */}
      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>

      <Footer />
    </div>
    </>
  );
}




export default App