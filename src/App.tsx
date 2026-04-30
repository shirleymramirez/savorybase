import { ChangeEvent, DragEvent, useEffect, useMemo, useState } from "react";
import AdminPanelSection from "./components/AdminPanelSection";
import FooterSection from "./components/FooterSection";
import HeaderSection from "./components/HeaderSection";
import ItemBuilderSection from "./components/ItemBuilderSection";
import LoginPage from "./components/LoginPage";
import MenuEntriesSection from "./components/MenuEntriesSection";
import useLocation from "./hooks/useLocation";
import { Category, DraftFoodItem, FoodItem } from "./types";

const AUTH_API_URL = "/api/auth/login";
const FOODS_API_URL = "/api/foods";
const SESSION_STORAGE_KEY = "savorybase-session";
const LOGIN_ROUTE = "/login";
const DASHBOARD_ROUTE = "/dashboard";
type FoodApiPayload = Omit<FoodItem, "id" | "categories"> & { category: Category };
type FoodApiItem = Partial<FoodItem> & { category?: Category; _id?: string };
type FoodApiEnvelope = {
  data?: FoodApiItem;
  message?: string;
  success?: boolean;
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
  "Gluten-Free",
  "Seasonal",
  "Chef Special",
];

const emptyDraft: DraftFoodItem = {
  name: "",
  description: "",
  price: "18.00",
  categories: ["Main Course"],
  active: true,
  imageUrl:
    "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80",
  imageFile: null,
  cropZoom: 110,
  cropX: 50,
  cropY: 50,
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
  const stock: FoodItem["stock"] = active ? "In Stock" : "Sold Out";

  return {
    name,
    description,
    price,
    category,
    active,
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
    stock:
      food.stock === "In Stock" || food.stock === "Low Stock" || food.stock === "Sold Out"
        ? food.stock
        : fallback.stock,
    imageUrl: typeof food.imageUrl === "string" && food.imageUrl ? food.imageUrl : fallback.imageUrl,
  };
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

function App() {
  const [session, setSession] = useState<AuthSession | null>(null);
  const { route, navigateTo } = useLocation();
  const [items, setItems] = useState<FoodItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<Array<string | number>>([]);
  const [draft, setDraft] = useState<DraftFoodItem>(emptyDraft);
  const [bulkCategory, setBulkCategory] = useState<Category>("Seasonal");
  const [isDraggingImage, setIsDraggingImage] = useState(false);
  const [isSavingItem, setIsSavingItem] = useState(false);
  const [saveItemError, setSaveItemError] = useState<string | null>(null);

  const activeCount = items.filter((item) => item.active).length;
  const lowStockCount = items.filter((item) => item.stock !== "In Stock").length;
  const averagePrice = useMemo(() => {
    if (items.length === 0) {
      return 0;
    }

    const total = items.reduce((sum, item) => sum + item.price, 0);
    return total / items.length;
  }, [items]);

  useEffect(() => {
    const storedSession = sessionStorage.getItem(SESSION_STORAGE_KEY);

    if (!storedSession) {
      return;
    }

    try {
      setSession(JSON.parse(storedSession) as AuthSession);
    } catch {
      sessionStorage.removeItem(SESSION_STORAGE_KEY);
    }
  }, []);

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

  const handleLogout = () => {
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
    setSession(null);
    setItems([]);
    setSelectedIds([]);
    setDraft(emptyDraft);
    setSaveItemError(null);
    navigateTo(LOGIN_ROUTE, "replace");
  };

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
          throw new Error(
            "Unauthorized. Please sign in again.",
          );
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

  const applyBulkStatus = (active: boolean) => {
    setItems((current) =>
      current.map((item) =>
        selectedIds.includes(item.id)
          ? {
              ...item,
              active,
              stock: active ? "In Stock" : "Sold Out",
            }
          : item,
      ),
    );
  };

  const applyBulkCategory = () => {
    setItems((current) =>
      current.map((item) =>
        selectedIds.includes(item.id)
          ? {
              ...item,
              categories: item.categories.includes(bulkCategory)
                ? item.categories
                : [...item.categories, bulkCategory],
            }
          : item,
      ),
    );
  };

  const updateItem = (
    id: string | number,
    updates: Pick<FoodItem, "name" | "description" | "price" | "categories" | "active" | "imageUrl">,
  ) => {
    setItems((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              ...updates,
              stock: updates.active
                ? item.stock === "Sold Out"
                  ? "In Stock"
                  : item.stock
                : "Sold Out",
            }
          : item,
      ),
    );
  };

  const selectedItems = items.filter((item) => selectedIds.includes(item.id));

  if (!session) {
    return <LoginPage onLogin={handleLogin} />;
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
              setIsDraggingImage(true);
            }}
            onImageDragLeave={() => setIsDraggingImage(false)}
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
            onToggleCategory={toggleCategory}
            onToggleActive={() =>
              setDraft((current) => ({
                ...current,
                active: !current.active,
              }))
            }
            onCropZoomChange={(value) => setDraft((current) => ({ ...current, cropZoom: value }))}
            onCropXChange={(value) => setDraft((current) => ({ ...current, cropX: value }))}
            onCropYChange={(value) => setDraft((current) => ({ ...current, cropY: value }))}
          />

          <aside className="space-y-6">
            <MenuEntriesSection
              authToken={session.token}
              items={items}
              onItemsChange={setItems}
              selectedIds={selectedIds}
              onSelectAll={() => setSelectedIds(items.map((item) => item.id))}
              onDeselectAll={() => setSelectedIds([])}
              onToggleSelection={toggleSelection}
            />
            <AdminPanelSection
              authToken={session.token}
              bulkCategory={bulkCategory}
              categories={categories}
              lowStockCount={lowStockCount}
              selectedItems={selectedItems}
              onBulkCategoryChange={setBulkCategory}
              onApplyBulkCategory={applyBulkCategory}
              onApplyBulkStatus={applyBulkStatus}
              onUpdateItem={updateItem}
            />
          </aside>
        </main>

        <FooterSection />
      </div>
    </div>
  );
}

export default App;
