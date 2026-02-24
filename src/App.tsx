import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import Dashboard from "@/pages/Dashboard";
import Patients from "@/pages/Patients";
import PatientDetail from "@/pages/PatientDetail";
import PatientPipeline from "@/pages/PatientPipeline";
import BudgetPipeline from "@/pages/BudgetPipeline";
import Budgets from "@/pages/Budgets";
import Procedures from "@/pages/Procedures";
import SettingsPage from "@/pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/patients" element={<Patients />} />
            <Route path="/patients/:id" element={<PatientDetail />} />
            <Route path="/pipeline/patients" element={<PatientPipeline />} />
            <Route path="/pipeline/budgets" element={<BudgetPipeline />} />
            <Route path="/budgets" element={<Budgets />} />
            <Route path="/procedures" element={<Procedures />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
