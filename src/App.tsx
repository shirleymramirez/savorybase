import {
  ChangeEvent,
  DragEvent,
  Suspense,
  lazy,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import FooterSection from "./components/FooterSection";
import HeaderSection from "./components/HeaderSection";
import ItemBuilderSection from "./components/ItemBuilderSection";
import MenuEntriesSection from "./components/MenuEntriesSection";
import useLocation from "./hooks/useLocation";
import { Category, DraftFoodItem, FoodItem } from "./types";

const AUTH_API_URL = "/api/auth/login";
const FOODS_API_URL = "/api/foods";
const SESSION_STORAGE_KEY = "savorybase-session";
const LOGIN_ROUTE = "/login";
const DASHBOARD_ROUTE = "/dashboard";
const DEFAULT_MENU_IMAGE_URL = "/Menus-672.jpg";
const LoginPage = lazy(() => import("./components/LoginPage"));
type FoodApiPayload = Omit<FoodItem, "id"> & {
  category: Category;
  categories: Category[];
  inventory?: number;
  inventoryAvailable?: number;
  originalInventory?: number;
  remainingInventory?: number;
};
type FoodApiItem = Partial<FoodItem> & {
  category?: Category;
  _id?: string;
  inventory?: number;
  inventoryAvailable?: number;
  originalInventory?: number;
  remainingInventory?: number;
};
type FoodApiEnvelope = {
  data?: FoodApiItem;
  message?: string;
  success?: boolean;
};
type FoodApiListResponse =
  | FoodApiItem[]
  | {
      data?: FoodApiItem[];
      foods?: FoodApiItem[];
      items?: FoodApiItem[];
    };
type AuthSession = {
  token: string;
  username: string;
};
type AuthResponse = {
  token?: string;
  accessToken?: string;
  username?: string;
  user?: {
    username?: string;
  };
  data?: {
    token?: string;
    accessToken?: string;
    username?: string;
    user?: {
      username?: string;
    };
  };
  message?: string;
  success?: boolean;
};

const categories: Category[] = [
  "Appetizer",
  "Main Course",
  "Dessert",
  "Vegan",
  "Seasonal",
  "Chef Special",
];

const emptyDraft: DraftFoodItem = {
  name: "",
  description: "",
  price: "18.00",
  categories: ["Main Course"],
  active: true,
  inventoryAvailable: "24",
  originalInventory: "24",
  remainingInventory: "24",
  imageUrl: DEFAULT_MENU_IMAGE_URL,
  imageFile: null,
};

function toTitleCase(value: string) {
  return value
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function readImageFile(file: File, onLoad: (result: string) => void) {
  const reader = new FileReader();
  reader.onload = () => {
    onLoad(String(reader.result));
  };
  reader.readAsDataURL(file);
}

function buildFoodPayload(draft: DraftFoodItem) {
  const name = draft.name.trim() ? toTitleCase(draft.name.trim()) : "Untitled Dish";
  const description = draft.description.trim() || "No description added yet.";
  const price = Number(draft.price) || 0;
  const active = draft.active;
  const category = draft.categories[0] ?? "Main Course";
  const categoriesForPayload = draft.categories.length > 0 ? draft.categories : [category];
  const inventoryAvailable = Math.max(0, Number.parseInt(String(draft.inventoryAvailable), 10) || 0);
  const originalInventory = Math.max(
    0,
    Number.parseInt(String(draft.originalInventory ?? draft.inventoryAvailable), 10) || 0,
  );
  const remainingInventory = Math.max(
    0,
    Number.parseInt(String(draft.remainingInventory ?? draft.inventoryAvailable), 10) || 0,
  );
  const stock: FoodItem["stock"] = !active
    ? "Sold Out"
    : remainingInventory === 0
      ? "Sold Out"
      : remainingInventory <= 5
        ? "Low Stock"
        : "In Stock";

  return {
    name,
    description,
    price,
    category,
    categories: categoriesForPayload,
    active,
    inventory: inventoryAvailable,
    inventoryAvailable,
    originalInventory,
    remainingInventory,
    stock,
    imageUrl: draft.imageUrl,
  } satisfies FoodApiPayload;
}

function buildFoodFormData(draft: DraftFoodItem) {
  const payload = buildFoodPayload(draft);
  const formData = new FormData();

  formData.append("name", payload.name);
  formData.append("description", payload.description);
  formData.append("price", String(payload.price));
  formData.append("category", payload.category);
  formData.append("categories", JSON.stringify(payload.categories));
  formData.append("inventory", String(payload.inventory ?? payload.inventoryAvailable));
  formData.append("inventoryAvailable", String(payload.inventoryAvailable));
  formData.append("originalInventory", String(payload.originalInventory ?? payload.inventoryAvailable));
  formData.append("remainingInventory", String(payload.remainingInventory ?? payload.inventoryAvailable));

  if (draft.imageFile) {
    formData.append("image", draft.imageFile);
  } else {
    formData.append("imageUrl", payload.imageUrl);
  }

  return formData;
}

function normalizeFoodItem(
  food: FoodApiItem,
  fallback: FoodApiPayload,
): FoodItem {
  const inventoryAvailable =
    typeof food.inventory === "number"
      ? food.inventory
      : typeof food.inventoryAvailable === "number"
        ? food.inventoryAvailable
        : fallback.inventoryAvailable;
  const originalInventory =
    typeof food.originalInventory === "number"
      ? food.originalInventory
      : inventoryAvailable;
  const remainingInventory =
    typeof food.remainingInventory === "number"
      ? food.remainingInventory
      : inventoryAvailable;
  const normalizedCategories =
    Array.isArray(food.categories) && food.categories.length > 0
      ? (food.categories as Category[])
      : food.category
        ? [food.category]
        : fallback.category
          ? [fallback.category]
          : (["Main Course"] as Category[]);

  return {
    id:
      typeof food.id === "string" || typeof food.id === "number"
        ? food.id
        : typeof food._id === "string"
          ? food._id
          : Date.now(),
    name: typeof food.name === "string" && food.name.trim() ? food.name : fallback.name,
    description:
      typeof food.description === "string" && food.description.trim()
        ? food.description
        : fallback.description,
    price: typeof food.price === "number" ? food.price : fallback.price,
    categories: normalizedCategories,
    active: typeof food.active === "boolean" ? food.active : fallback.active,
    inventoryAvailable,
    originalInventory,
    remainingInventory,
    stock:
      food.stock === "In Stock" || food.stock === "Low Stock" || food.stock === "Sold Out"
        ? food.stock
        : fallback.stock,
    imageUrl: typeof food.imageUrl === "string" && food.imageUrl ? food.imageUrl : fallback.imageUrl,
  };
}

function normalizeFetchedFoodItem(food: FoodApiItem, fallbackId: string | number): FoodItem {
  const categories =
    Array.isArray(food.categories) && food.categories.length > 0
      ? (food.categories as Category[])
      : food.category
        ? [food.category]
        : (["Main Course"] as Category[]);
  const active = typeof food.active === "boolean" ? food.active : true;
  const inventoryAvailable =
    typeof food.inventory === "number"
      ? food.inventory
      : typeof food.inventoryAvailable === "number"
        ? food.inventoryAvailable
        : 0;
  const originalInventory =
    typeof food.originalInventory === "number" ? food.originalInventory : inventoryAvailable;
  const remainingInventory =
    typeof food.remainingInventory === "number" ? food.remainingInventory : inventoryAvailable;

  return {
    id:
      typeof food.id === "string" || typeof food.id === "number"
        ? food.id
        : typeof food._id === "string"
          ? food._id
          : fallbackId,
    name: typeof food.name === "string" && food.name.trim() ? food.name : "Untitled Dish",
    description:
      typeof food.description === "string" && food.description.trim()
        ? food.description
        : "No description added yet.",
    price: typeof food.price === "number" ? food.price : 0,
    categories,
    active,
    inventoryAvailable,
    originalInventory,
    remainingInventory,
    stock:
      food.stock === "In Stock" || food.stock === "Low Stock" || food.stock === "Sold Out"
        ? food.stock
        : active
          ? inventoryAvailable === 0
            ? "Sold Out"
            : inventoryAvailable <= 5
              ? "Low Stock"
              : "In Stock"
          : "Sold Out",
    imageUrl:
      typeof food.imageUrl === "string" && food.imageUrl ? food.imageUrl : DEFAULT_MENU_IMAGE_URL,
  };
}

function extractFoodItems(payload: FoodApiListResponse) {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload.data)) {
    return payload.data;
  }

  if (Array.isArray(payload.foods)) {
    return payload.foods;
  }

  if (Array.isArray(payload.items)) {
    return payload.items;
  }

  return [];
}

function extractAuthSession(payload: AuthResponse, fallbackUsername: string) {
  const token =
    payload.token ||
    payload.accessToken ||
    payload.data?.token ||
    payload.data?.accessToken ||
    "";
  const username =
    payload.username ||
    payload.user?.username ||
    payload.data?.username ||
    payload.data?.user?.username ||
    fallbackUsername;

  if (!token) {
    throw new Error("Login succeeded but no session token was returned.");
  }

  return {
    token,
    username,
  } satisfies AuthSession;
}

function readStoredSession() {
  try {
    const storedSession = sessionStorage.getItem(SESSION_STORAGE_KEY);
    return storedSession ? (JSON.parse(storedSession) as AuthSession) : null;
  } catch {
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
    return null;
  }
}

function App() {
  const [session, setSession] = useState<AuthSession | null>(() => readStoredSession());
  const { route, navigateTo } = useLocation();
  const [items, setItems] = useState<FoodItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<Array<string | number>>([]);
  const [draft, setDraft] = useState<DraftFoodItem>(emptyDraft);
  const [isDraggingImage, setIsDraggingImage] = useState(false);
  const [isSavingItem, setIsSavingItem] = useState(false);
  const [saveItemError, setSaveItemError] = useState<string | null>(null);
  const [isLoadingItems, setIsLoadingItems] = useState(false);
  const [fetchItemsError, setFetchItemsError] = useState<string | null>(null);

  const activeCount = items.filter((item) => item.active).length;
  const averagePrice = useMemo(() => {
    if (items.length === 0) {
      return 0;
    }

    const total = items.reduce((sum, item) => sum + item.price, 0);
    return total / items.length;
  }, [items]);

  useEffect(() => {
    setSelectedIds((current) => current.filter((id) => items.some((item) => item.id === id)));
  }, [items]);

  useEffect(() => {
    const isAuthRoute = route === LOGIN_ROUTE;
    const isDashboardRoute = route === DASHBOARD_ROUTE;

    if (!session && !isAuthRoute) {
      navigateTo(LOGIN_ROUTE, "replace");
      return;
    }

    if (session && !isDashboardRoute) {
      navigateTo(DASHBOARD_ROUTE, "replace");
    }
  }, [navigateTo, route, session]);

  const handleLogin = async (credentials: { username: string; password: string }) => {
    const response = await fetch(AUTH_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(credentials),
    });

    const payload = (await response.json()) as AuthResponse;

    if (!response.ok) {
      throw new Error(payload.message || "Unable to sign in with those credentials.");
    }

    const nextSession = extractAuthSession(payload, credentials.username);
    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(nextSession));
    setSession(nextSession);
    navigateTo(DASHBOARD_ROUTE, "replace");
  };

  const clearLocalSession = useCallback(() => {
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
    setSession(null);
    setItems([]);
    setSelectedIds([]);
    setDraft(emptyDraft);
    setSaveItemError(null);
    setFetchItemsError(null);
    setIsLoadingItems(false);
    navigateTo(LOGIN_ROUTE, "replace");
  }, [navigateTo]);

  const handleLogout = () => {
    clearLocalSession();
  };

  const handleSessionExpired = useCallback(() => {
    clearLocalSession();
  }, [clearLocalSession]);

  const fetchMenuItems = useCallback(
    async (signal?: AbortSignal) => {
      if (!session || route !== DASHBOARD_ROUTE) {
        return [] as FoodItem[];
      }

      setIsLoadingItems(true);
      setFetchItemsError(null);

      try {
        const response = await fetch(FOODS_API_URL, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${session.token}`,
          },
          credentials: "include",
          signal,
        });

        if (!response.ok) {
          if (response.status === 401) {
            handleSessionExpired();
            return [] as FoodItem[];
          }

          throw new Error(`Request failed with status ${response.status}`);
        }

        const payload = (await response.json()) as FoodApiListResponse;
        const normalizedItems = extractFoodItems(payload).map((item, index) =>
          normalizeFetchedFoodItem(item, `fallback-${index + 1}`),
        );

        setItems(normalizedItems);
        return normalizedItems;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return [] as FoodItem[];
        }

        setFetchItemsError(
          error instanceof Error ? error.message : "Unable to load menu entries right now.",
        );
        return [] as FoodItem[];
      } finally {
        if (!signal || !signal.aborted) {
          setIsLoadingItems(false);
        }
      }
    },
    [handleSessionExpired, route, session],
  );

  useEffect(() => {
    if (!session || route !== DASHBOARD_ROUTE) {
      return;
    }

    const abortController = new AbortController();

    void fetchMenuItems(abortController.signal);

    const syncInterval = window.setInterval(() => {
      void fetchMenuItems();
    }, 3600000);

    return () => {
      abortController.abort();
      window.clearInterval(syncInterval);
    };
  }, [fetchMenuItems, route, session]);

  const handleImageSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    readImageFile(file, (result) => {
      setDraft((current) => ({
        ...current,
        imageUrl: result,
        imageFile: file,
      }));
    });
  };

  const handleImageDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDraggingImage(false);

    const file = event.dataTransfer.files?.[0];

    if (!file || !file.type.startsWith("image/")) {
      return;
    }

    readImageFile(file, (result) => {
      setDraft((current) => ({
        ...current,
        imageUrl: result,
        imageFile: file,
      }));
    });
  };

  const toggleCategory = (category: Category) => {
    setDraft((current) => {
      const exists = current.categories.includes(category);
      return {
        ...current,
        categories: exists
          ? current.categories.filter((entry) => entry !== category)
          : [...current.categories, category],
      };
    });
  };

  const handleSave = async () => {
    if (!session) {
      setSaveItemError("Your session has expired. Please sign in again.");
      return;
    }

    const payload = buildFoodPayload(draft);

    setIsSavingItem(true);
    setSaveItemError(null);

    try {
      const requestInit = draft.imageFile
        ? {
            method: "POST",
            body: buildFoodFormData(draft),
          }
        : {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          };

      const authorizedRequestInit = {
        ...requestInit,
        headers: {
          ...(requestInit.headers || {}),
          Authorization: `Bearer ${session.token}`,
        },
        credentials: "include" as const,
      };
      const response = await fetch(FOODS_API_URL, authorizedRequestInit);
      if (!response.ok) {
        if (response.status === 401) {
          handleSessionExpired();
          return;
        }

        if (response.status === 400) {
          const errorPayload = (await response.json()) as {
            message?: string;
            error?: Array<{ field?: string; message?: string }>;
          };
          const validationMessage = errorPayload.error?.[0]?.message || errorPayload.message;

          throw new Error(validationMessage || "Validation failed.");
        }

        throw new Error(`Request failed with status ${response.status}`);
      }

      const createdFoodResponse = (await response.json()) as FoodApiEnvelope;
      const nextItem = normalizeFoodItem(createdFoodResponse.data ?? {}, payload);

      setItems((current) => [nextItem, ...current]);
      setDraft(emptyDraft);
    } catch (error) {
      setSaveItemError(
        error instanceof Error ? error.message : "Unable to save this food item right now.",
      );
    } finally {
      setIsSavingItem(false);
    }
  };

  const toggleSelection = (id: string | number) => {
    setSelectedIds((current) =>
      current.includes(id) ? current.filter((entry) => entry !== id) : [...current, id],
    );
  };

  if (!session) {
    return (
      <Suspense
        fallback={
          <div className="min-h-screen bg-mist-50 px-4 py-10 text-sm text-mist-600">
            Loading...
          </div>
        }
      >
        <LoginPage onLogin={handleLogin} />
      </Suspense>
    );
  }

  if (route !== DASHBOARD_ROUTE) {
    return null;
  }

  return (
    <div className="min-h-screen bg-mist-50 text-mist-900">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <HeaderSection
          itemCount={items.length}
          activeCount={activeCount}
          averagePrice={averagePrice}
          username={session.username}
          onLogout={handleLogout}
        />

        <main className="mt-6 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <ItemBuilderSection
            draft={draft}
            categories={categories}
            isDraggingImage={isDraggingImage}
            isSaving={isSavingItem}
            saveError={saveItemError}
            onReset={() => setDraft(emptyDraft)}
            onSave={handleSave}
            onImageSelect={handleImageSelect}
            onImageDrop={handleImageDrop}
            onImageDragOver={(event) => {
              event.preventDefault();
              setIsDraggingImage((current) => (current ? current : true));
            }}
            onImageDragLeave={() => setIsDraggingImage((current) => (current ? false : current))}
            onNameChange={(value) =>
              setDraft((current) => ({
                ...current,
                name: toTitleCase(value),
              }))
            }
            onDescriptionChange={(value) =>
              setDraft((current) => ({ ...current, description: value }))
            }
            onPriceChange={(value) => setDraft((current) => ({ ...current, price: value }))}
            onInventoryAvailableChange={(value) =>
              setDraft((current) => {
                const parsedValue = Math.max(0, Number.parseInt(value, 10) || 0);

                return {
                  ...current,
                  inventoryAvailable: value,
                  originalInventory: String(parsedValue),
                  remainingInventory: String(parsedValue),
                };
              })
            }
            onToggleCategory={toggleCategory}
            onToggleActive={() =>
              setDraft((current) => ({
                ...current,
                active: !current.active,
              }))
            }
          />

          <aside className="space-y-6">
            <MenuEntriesSection
              authToken={session.token}
              categories={categories}
              items={items}
              isLoading={isLoadingItems}
              fetchError={fetchItemsError}
              onItemsChange={setItems}
              selectedIds={selectedIds}
              onSelectAll={() => setSelectedIds(items.map((item) => item.id))}
              onDeselectAll={() => setSelectedIds([])}
              onToggleSelection={toggleSelection}
              onSessionExpired={handleSessionExpired}
            />
          </aside>
        </main>

        <FooterSection />
      </div>
    </div>
  );
}

export default App;
