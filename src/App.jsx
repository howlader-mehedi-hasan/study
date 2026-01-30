import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Courses from "./pages/Courses";
import AdminDashboard from "./pages/AdminDashboard";
import CourseView from "./pages/CourseView";
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";

// Placeholder Pages
import Syllabus from "./pages/Syllabus";
import Notices from "./pages/Notices";
import Schedule from "./pages/Schedule";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Complaints from "./pages/Complaints";
import Opinions from "./pages/Opinions";

function App() {
  return (
    <Router>
      <AuthProvider>
        <ThemeProvider>
          <div className="min-h-screen bg-slate-50 dark:bg-slate-900 font-sans text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-200">
            <Navbar />
            <div className="flex-grow">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/courses" element={<Courses />} />
                <Route path="/course/:courseId" element={<CourseView />} />
                <Route path="/login" element={<Login />} />
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />

                {/* New Routes */}
                <Route path="/syllabus" element={<Syllabus />} />
                <Route path="/notices" element={<Notices />} />
                <Route path="/schedule" element={<Schedule />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/complaints" element={<Complaints />} />
                <Route path="/opinions" element={<Opinions />} />
              </Routes>
            </div>
            <Footer />
          </div>
        </ThemeProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
