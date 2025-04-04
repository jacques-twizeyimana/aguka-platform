import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/lib/auth";
import HomePage from "./pages/HomePage";
import Login from "./pages/Login";
import EmployerSignup from "./pages/EmployerSignup";
import CompanyDetails from "./pages/CompanyDetails";
import SuccessPage from "./pages/SuccessPage";
import CandidateSignup from "./pages/CandidateSignup";
import EmployerDashboard from "./pages/employer/Dashboard";
import EmployerJobs from "./pages/employer/Jobs";
import JobDetails from "./pages/employer/JobDetails";
import NewJob from "./pages/employer/NewJob";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminCompanies from "./pages/admin/Companies";
import AdminJobSeekers from "./pages/admin/JobSeekers";
import AdminCategories from "./pages/admin/Categories";
import AdminQuestions from "./pages/admin/Questions";
import TestPrep from "./pages/candidate/TestPrep";
import Test from "./pages/candidate/Test";
import { Toaster } from "@/components/ui/toaster";

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/employer-signup" element={<EmployerSignup />} />
        <Route path="/company-details" element={<CompanyDetails />} />
        <Route path="/success" element={<SuccessPage />} />
        <Route path="/candidate-signup" element={<CandidateSignup />} />
        <Route path="/employer/dashboard" element={<EmployerDashboard />} />
        <Route path="/employer/jobs" element={<EmployerJobs />} />
        <Route path="/employer/jobs/:id" element={<JobDetails />} />
        <Route path="/employer/jobs/new" element={<NewJob />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/companies" element={<AdminCompanies />} />
        <Route path="/admin/job-seekers" element={<AdminJobSeekers />} />
        <Route path="/admin/categories" element={<AdminCategories />} />
        <Route path="/admin/questions" element={<AdminQuestions />} />
        <Route path="/test-prep" element={<TestPrep />} />
        <Route path="/test" element={<Test />} />
      </Routes>
      <Toaster />
    </AuthProvider>
  );
}

export default App;
