type NavigateMode = "push" | "replace";

type UseLocationResult = {
  route: string;
  navigateTo: (nextRoute: string, mode?: NavigateMode) => void;
};

export default function useLocation(): UseLocationResult;
