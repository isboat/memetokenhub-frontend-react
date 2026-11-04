import { HubHomePage } from "./features/hub/HubLayout";
import {
  NetworksPage,
  ExchangesPage,
  LaunchpadsPage,
} from "./features/hub/DirectoryPages";
import {
  UpcomingPage,
  UpcomingDetailsPage,
  UpcomingEditor,
} from "./features/hub/UpcomingPages";
import { EventsPage, EventEditor } from "./features/hub/EventPages";
import { ActivityPage } from "./features/hub/ActivityPage";
import { Route, Routes } from "react-router-dom";
import { AppHeader } from "./components/AppHeader";
import { Footer } from "./components/Footer";
import { ScrollToTop } from "./components/ScrollToTop";
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
import {
  ClaimCenterPage,
  ModeratorClaimsPage,
  PublicClaimStatusPage,
} from "./pages/ClaimPages";
import { CreatorEarningsPage, PaymentsPage } from "./pages/PaymentPages";
import { NotificationPage } from "./pages/NotificationPage";
import {
  AboutPage,
  FaqPage,
  PrivacyPolicyPage,
  TermsOfUsePage,
} from "./pages/InformationPages";

export default function App() {
  return (
    <div className="app">
      <AppHeader />
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<DiscoverPage />} />
        <Route path="/hub" element={<HubHomePage />} />
        <Route path="/upcoming" element={<UpcomingPage />} />
        <Route path="/upcoming/new" element={<UpcomingEditor />} />
        <Route path="/upcoming/:id" element={<UpcomingDetailsPage />} />
        <Route path="/upcoming/:id/edit" element={<UpcomingEditor />} />
        <Route path="/launchpads" element={<LaunchpadsPage />} />
        <Route path="/networks" element={<NetworksPage />} />
        <Route path="/exchanges" element={<ExchangesPage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/events/new" element={<EventEditor />} />
        <Route path="/events/:id/edit" element={<EventEditor />} />
        <Route path="/hub/activity" element={<ActivityPage />} />
        <Route path="/community" element={<CommunityNetworkPage />} />
        <Route path="/network" element={<MySocialPage />} />
        <Route path="/insights" element={<InsightsPage />} />
        <Route path="/learn" element={<LearnPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/faq" element={<FaqPage />} />
        <Route path="/privacy" element={<PrivacyPolicyPage />} />
        <Route path="/terms" element={<TermsOfUsePage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/people" element={<PeopleDirectoryPage />} />
        <Route path="/profile" element={<AccountSettingsPage />} />
        <Route path="/profile/:userId" element={<PublicUserProfilePage />} />
        <Route path="/admin/users" element={<RoleAdministrationPage />} />
        <Route path="/projects/manage" element={<ProjectManagementPage />} />
        <Route path="/claims" element={<ClaimCenterPage />} />
        <Route
          path="/claims/:claimId/status"
          element={<PublicClaimStatusPage />}
        />
        <Route path="/moderation/claims" element={<ModeratorClaimsPage />} />
        <Route path="/payments" element={<PaymentsPage />} />
        <Route path="/creator/earnings" element={<CreatorEarningsPage />} />
        <Route path="/notifications" element={<NotificationPage />} />
        <Route path="/token/:tokenId" element={<TokenDetailsPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <Footer />
    </div>
  );
}
