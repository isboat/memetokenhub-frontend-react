import { Route, Routes } from "react-router-dom";
import { AppHeader } from "./components/AppHeader";
import { Footer } from "./components/Footer";
import { DiscoverPage } from "./pages/DiscoverPage";
import {
  CommunityPage,
  DashboardPage,
  LearnPage,
  NotFoundPage,
  TokenDetailsPage,
} from "./pages/SupportingPages";

export default function App() {
  return (
    <div className="app">
      <AppHeader />
      <Routes>
        <Route path="/" element={<DiscoverPage />} />
        <Route path="/community" element={<CommunityPage />} />
        <Route path="/learn" element={<LearnPage />} />
        <Route path="/about" element={<LearnPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/token/:tokenId" element={<TokenDetailsPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <Footer />
    </div>
  );
}
