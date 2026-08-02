import { Route, Routes } from "react-router-dom";
import { AppHeader } from "./components/AppHeader";
import { Footer } from "./components/Footer";
import { DiscoverPage } from "./pages/DiscoverPage";
import {
  DashboardPage,
  LearnPage,
  NotFoundPage,
  TokenDetailsPage,
} from "./pages/SupportingPages";
import {
  AccountSettingsPage,
  PeopleDirectoryPage,
  PublicUserProfilePage,
  RoleAdministrationPage,
} from "./pages/UserPages";
import { ProjectManagementPage } from "./pages/ProjectManagementPage";
import {
  CommunityNetworkPage,
  InsightsPage,
  MySocialPage,
} from "./pages/SocialPages";

export default function App() {
  return (
    <div className="app">
      <AppHeader />
      <Routes>
        <Route path="/" element={<DiscoverPage />} />
        <Route path="/community" element={<CommunityNetworkPage />} />
        <Route path="/network" element={<MySocialPage />} />
        <Route path="/insights" element={<InsightsPage />} />
        <Route path="/learn" element={<LearnPage />} />
        <Route path="/about" element={<LearnPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/people" element={<PeopleDirectoryPage />} />
        <Route path="/profile" element={<AccountSettingsPage />} />
        <Route path="/profile/:userId" element={<PublicUserProfilePage />} />
        <Route path="/admin/users" element={<RoleAdministrationPage />} />
        <Route path="/projects/manage" element={<ProjectManagementPage />} />
        <Route path="/token/:tokenId" element={<TokenDetailsPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <Footer />
    </div>
  );
}
