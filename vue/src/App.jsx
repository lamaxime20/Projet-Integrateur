import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, BrowserRouter } from 'react-router-dom'
import Principale from './pages/principale'
import './App.css'

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path='/' element={<Principale />} />
            </Routes>
        </BrowserRouter>
    )
}


export default App
