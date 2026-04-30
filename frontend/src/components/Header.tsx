import { useLogout } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/auth-store";

export function Header() {
  const logout = useLogout();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const role = useAuthStore((state) => state.role);

  const handleLogout = () => {
    logout.mutate();
  };

  return (
    <header className="fixed top-0 p-5 w-full bg-primary mb-15 h-20 z-50">
      <div className="flex items-center justify-between px-6">
        {/* Logo/App Name */}
        <div className="flex items-center">
          <h1
            className="text-2xl font-bold hover:cursor-pointer"
            onClick={() => navigate("/")}
          >
            RoomMate
          </h1>
        </div>

        {/* User Info and Logout Button */}
        <div className="flex items-center gap-4">
          {user && (
            <div className="text-right text-sm">
              <p className="font-medium text-white">{user.nome}</p>
              <p className="text-xs text-gray-300">
                {role === "admin" ? "👑 Administrador" : "👤 Utilizador"}
              </p>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="gap-2"
          >
            <LogOut className="size-4" />
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
}
