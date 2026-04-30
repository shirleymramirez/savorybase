import { useCallback, useEffect, useState } from "react";

function getCurrentRoute() {
  return window.location.pathname;
}

function useLocation() {
  const [route, setRoute] = useState(getCurrentRoute);

  useEffect(() => {
    const handleLocationChange = () => {
      setRoute(getCurrentRoute());
    };

    window.addEventListener("popstate", handleLocationChange);

    return () => {
      window.removeEventListener("popstate", handleLocationChange);
    };
  }, []);

  const navigateTo = useCallback((nextRoute, mode = "push") => {
    if (window.location.pathname === nextRoute) {
      setRoute(nextRoute);
      return;
    }

    if (mode === "replace") {
      window.history.replaceState({}, "", nextRoute);
    } else {
      window.history.pushState({}, "", nextRoute);
    }

    setRoute(nextRoute);
  }, []);

  return {
    route,
    navigateTo,
  };
}

export default useLocation;
