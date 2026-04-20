import { useLogout } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function Header() {
  const logout = useLogout();
  const navigate = useNavigate();
  const handleLogout = () => {
    logout();
  };

  return (
    <header className="fixed top-0 p-5 w-full bg-primary mb-15 h-20">
      <div className="flex items-center justify-between px-6">
        {/* Logo/App Name */}
        <div className="flex items-center">
          <h1 className="text-2xl font-bold hover:cursor-pointer" onClick={() => navigate("/") }>RoomMate</h1>
        </div>
        <nav className="flex space-x-4 list-none">
          <li onClick={() => navigate("/rooms")}>
            Rooms
          </li>
          <li onClick={() => navigate("/reservas")}>
            Reservas
          </li>
        </nav>

        {/* Logout Button */}
        <div>
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
