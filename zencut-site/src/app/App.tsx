import { lazy, Suspense } from "react";
import Landing from "@/pages/Landing/Landing";
const StoreGo = lazy(() => import("@/pages/Landing/StoreGo"));
const Home = lazy(() => import("@/pages/Home/Home"));

export default function App() {
  const isCamera = /\/camera\/?$/.test(window.location.pathname);
  const isStoreGo = /^\/apps\/zencut\/go\/?$/.test(window.location.pathname);
  if (isStoreGo) return <Suspense fallback={null}><StoreGo /></Suspense>;
  return isCamera ? <Suspense fallback={<p>카메라를 준비하고 있어요.</p>}><Home /></Suspense> : <Landing />;
}
