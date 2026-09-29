import { Route, Routes, useLocation } from "react-router-dom"
import { ErrorBoundary } from "./components/ErrorBoundary"
import { InformationLayout } from "./layouts/InformationLayout"
import { useDocumentMeta } from "./lib/meta"
import About from "./pages/About"
import Home from "./pages/Home"
import NotFound from "./pages/NotFound"
import Privacy from "./pages/Privacy"
import Terms from "./pages/Terms"

export function App() {
  const location = useLocation()
  useDocumentMeta(location.pathname)

  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route element={<InformationLayout />}>
          <Route path="/about" element={<About />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </ErrorBoundary>
  )
}
