import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/auth/PrivateRoute';
import Header from './components/common/Header';
import Sidebar from './components/common/Sidebar';
import Footer from './components/common/Footer';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import StudentsPage from './pages/StudentsPage';
import TeachersPage from './pages/TeachersPage';
import ClassesPage from './pages/ClassesPage';
import SubjectsPage from './pages/SubjectsPage';
import MarksPage from './pages/MarksPage';
import ReportsPage from './pages/ReportsPage';
import './styles/App.css';

function App() {
    return (
        <Router>
            <AuthProvider>
                <div className="App">
                    <Routes>
                        <Route path="/login" element={<LoginPage />} />
                        <Route
                            path="/*"
                            element={
                                <PrivateRoute>
                                    <Header />
                                    <div className="main-container">
                                        <Sidebar />
                                        <main className="content">
                                            <Routes>
                                                <Route path="/" element={<DashboardPage />} />
                                                <Route path="/dashboard" element={<DashboardPage />} />
                                                <Route path="/students" element={<StudentsPage />} />
                                                <Route path="/teachers" element={<TeachersPage section="list" />} />
                                                <Route path="/teachers/assign" element={<TeachersPage section="assign" />} />
                                                <Route path="/teachers/homeroom" element={<TeachersPage section="homeroom" />} />
                                                <Route path="/classes" element={<ClassesPage />} />
                                                <Route path="/subjects" element={<SubjectsPage />} />
                                                <Route path="/marks" element={<MarksPage />} />
                                                <Route path="/reports" element={<ReportsPage />} />
                                            </Routes>
                                        </main>
                                    </div>
                                    <Footer />
                                </PrivateRoute>
                            }
                        />
                    </Routes>
                </div>
            </AuthProvider>
        </Router>
    );
}

export default App;
