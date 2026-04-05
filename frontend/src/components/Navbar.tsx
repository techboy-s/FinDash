import { useAuth } from "@/context/AuthContext";

interface NavbarProps {
  title: string;
  onToggleSidebar: () => void;
}

export default function Navbar({ title, onToggleSidebar }: NavbarProps) {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 shadow-sm lg:px-6">
      {/* Left: hamburger + title */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 lg:hidden"
          aria-label="Toggle sidebar"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
      </div>

      {/* Right: user info */}
      {user && (
        <div className="flex items-center gap-3">
          <span className="hidden text-sm font-medium text-gray-700 sm:block">
            {user.name}
          </span>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold text-white">
            {user.name.charAt(0).toUpperCase()}
          </div>
        </div>
      )}
    </header>
  );
}
