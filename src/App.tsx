import { Route, Routes, useLocation } from "react-router-dom"
import { AuthScreen } from "./components/AuthScreen"
import { ErrorBoundary } from "./components/ErrorBoundary"
import { AuthProvider, useAuth } from "./lib/auth"
import { InformationLayout } from "./layouts/InformationLayout"
import { useDocumentMeta } from "./lib/meta"
import About from "./pages/About"
import Home from "./pages/Home"
import NotFound from "./pages/NotFound"
import ProfilePage from "./pages/Profile"
import Privacy from "./pages/Privacy"
import Terms from "./pages/Terms"

function AppRoutes() {
  const location = useLocation()
  const { ready, user } = useAuth()
  useDocumentMeta(location.pathname)

  if (!ready) return null
  // Everything downstream needs a signed-in user: the timer writes rows, the
  // heatmap reads them, rooms are keyed to a member.
  if (!user && location.pathname === "/") return <AuthScreen />

  return (
      <Routes>
        <Route path="/" element={<Home />} />
        <Route element={<InformationLayout />}>
          <Route path="/about" element={<About />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
        </Route>
        <Route path="/p/:username" element={<ProfilePage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
  )
}

export function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </ErrorBoundary>
  )
}
