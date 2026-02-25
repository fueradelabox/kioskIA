import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import StudentLogin from './pages/student/StudentLogin'
import StudentLayout from './pages/student/StudentLayout'
import StudentDashboard from './pages/student/StudentDashboard'
import CreateSavingsGoal from './pages/student/CreateSavingsGoal'
import TransferToSavings from './pages/student/TransferToSavings'
import TransactionHistory from './pages/student/TransactionHistory'
import StudentProfile from './pages/student/StudentProfile'
import FinancialEducation from './pages/student/FinancialEducation'
import WisdomTest from './pages/student/WisdomTest'
import Achievements from './pages/student/Achievements'
import HealthyPlanner from './pages/student/HealthyPlanner'
import YearlySummary from './pages/student/YearlySummary'
import ParentLogin from './pages/parent/ParentLogin'
import ParentLayout from './pages/parent/ParentLayout'
import ParentDashboard from './pages/parent/ParentDashboard'
import ParentLimits from './pages/parent/ParentLimits'
import ParentDeposit from './pages/parent/ParentDeposit'
import GoalApproval from './pages/parent/GoalApproval'
import IncentivesConfig from './pages/parent/IncentivesConfig'
import MonthlyAnalysis from './pages/parent/MonthlyAnalysis'
import NotificationCenter from './pages/parent/NotificationCenter'
import SnackSubscription from './pages/parent/SnackSubscription'
import VendorLogin from './pages/vendor/VendorLogin'
import VendorLayout from './pages/vendor/VendorLayout'
import VendorPOS from './pages/vendor/VendorPOS'
import VendorDashboard from './pages/vendor/VendorDashboard'
import VendorSuccess from './pages/vendor/VendorSuccess'
import VendorError from './pages/vendor/VendorError'
import LandingPage from './pages/LandingPage'

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<LandingPage />} />

        {/* Student */}
        <Route path="/estudiante/login" element={<StudentLogin />} />
        <Route path="/estudiante" element={<StudentLayout />}>
          <Route index element={<StudentDashboard />} />
          <Route path="ahorro/crear" element={<CreateSavingsGoal />} />
          <Route path="ahorro/transferir" element={<TransferToSavings />} />
          <Route path="historial" element={<TransactionHistory />} />
          <Route path="perfil" element={<StudentProfile />} />
          {/* Phase 3: Student Flow Additions */}
          <Route path="educacion" element={<FinancialEducation />} />
          <Route path="test" element={<WisdomTest />} />
          <Route path="logros" element={<Achievements />} />
          <Route path="planificador" element={<HealthyPlanner />} />
          <Route path="resumen" element={<YearlySummary />} />
        </Route>

        {/* Parent */}
        <Route path="/padre/login" element={<ParentLogin />} />
        <Route path="/padre" element={<ParentLayout />}>
          <Route index element={<ParentDashboard />} />
          <Route path="depositos" element={<ParentDeposit />} />
          <Route path="limites" element={<ParentLimits />} />
          <Route path="metas" element={<GoalApproval />} />
          <Route path="incentivos" element={<IncentivesConfig />} />
          <Route path="analisis" element={<MonthlyAnalysis />} />
          <Route path="notificaciones" element={<NotificationCenter />} />
          <Route path="suscripciones" element={<SnackSubscription />} />
        </Route>

        {/* Vendor */}
        <Route path="/vendedor/login" element={<VendorLogin />} />
        <Route path="/vendedor" element={<VendorLayout />}>
          <Route index element={<VendorPOS />} />
          <Route path="dashboard" element={<VendorDashboard />} />
        </Route>
        <Route path="/vendedor/exito" element={<VendorSuccess />} />
        <Route path="/vendedor/error" element={<VendorError />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  )
}
