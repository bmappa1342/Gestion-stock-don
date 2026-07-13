import React from 'react'
import { ToastContainer } from 'react-toastify'
import NavBar from './NavBar'

type WrapperPros = {
    children : React.ReactNode
}

const Wrapper = ({children} : WrapperPros) => {
  return (
    <div>
        
       <NavBar />
       <ToastContainer position='top-center'  autoClose={10000} hideProgressBar={false} newestOnTop={false}
       closeOnClick draggable pauseOnHover/>
       <div className='px-5 md:px-[10%] mt-8 mb-10'>
        {children}
       </div>
    </div>
  )
}

export default Wrapper