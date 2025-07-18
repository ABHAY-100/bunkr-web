"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { removeToken } from "@/utils/auth";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/users/user";
import {
  useInstitutions,
  useDefaultInstitutionUser,
  useUpdateDefaultInstitutionUser,
} from "@/hooks/users/institutions";
import Image from "next/image";
import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import {
  Building2,
  Layers2,
  LogOut,
  UserRound,
  Percent,
  SquareAsterisk,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { useAttendanceSettings } from "@/providers/attendance-settings";

import User from "@/assets/user.png";

export const Navbar = () => {
  const router = useRouter();
  const { data: user } = useUser();
  const { data: institutions, isLoading: institutionsLoading } =
    useInstitutions();
  const { data: defaultInstitutionUser } = useDefaultInstitutionUser();
  const updateDefaultInstitutionUser = useUpdateDefaultInstitutionUser();
  const queryClient = useQueryClient();

  const [selectedInstitution, setSelectedInstitution] = useState<string>("");
  const { targetPercentage, setTargetPercentage } = useAttendanceSettings();

  const pathname = usePathname();

  useEffect(() => {
    if (defaultInstitutionUser) {
      setSelectedInstitution(defaultInstitutionUser.toString());
    }
  }, [defaultInstitutionUser]);

  const handleLogout = () => {
    removeToken();
    router.push("/");
  };

  const navigateTo = (path: string) => {
    router.push(path);
  };

  const handleInstitutionChange = (value: string) => {
    setSelectedInstitution(value);
    updateDefaultInstitutionUser.mutate(Number.parseInt(value), {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["defaultInstitutionUser"] });
        queryClient.invalidateQueries({ queryKey: ["institutions"] });
        toast("Institution updated", {
          description: "Your default institution has been updated.",
        });
      },
      onError: () => {
        setSelectedInstitution(defaultInstitutionUser?.toString() || "");
        toast("Error", {
          description: "Failed to update institution. Please try again.",
        });
      },
    });
  };

  const truncateText = (text: string, limit: number) => {
    return text.length > limit ? text.substring(0, limit) + "..." : text;
  };

  return (
    <header className="sticky top-0 z-10 flex h-17 items-center justify-between gap-4 border-b-2 bg-background px-4 md:px-6 text-white mr-0.5 border-white/5">
      <div className="flex items-center gap-2">
        <Link
          href="/"
          className="text-[2.50rem] font-semibold gradient-logo font-klick tracking-wide"
        >
          Bunkr
        </Link>
      </div>

      <div className="flex items-center justify-between gap-4 md:gap-6">
        <div className="gap-3 flex items-center">
          {pathname !== "/dashboard" && (
            <div className="max-lg:hidden text-white/85">
              <Button
                variant={"outline"}
                className="custom-button cursor-pointer"
                onClick={() => navigateTo("/dashboard")}
              >
                Dashboard
              </Button>
            </div>
          )}

          {pathname !== "/tracking" && (
            <div className="max-lg:hidden text-white/85">
              <Button
                variant={"outline"}
                className="custom-button cursor-pointer"
                onClick={() => navigateTo("/tracking")}
              >
                Tracking
              </Button>
            </div>
          )}

          {/* Attendance Target Percentage Selector */}
          <div className="flex">
            <Select
              value={targetPercentage.toString()}
              onValueChange={(value) => {
                setTargetPercentage(Number(value));
                toast("Attendance Target Updated", {
                  description: (
                  <span style={{ color: "#ffffffa6" }}>
                    Your attendance target is now set to {value}%.
                  </span>
                  ),
                  style: {
                  backgroundColor: "rgba(34,197,94,0.08)",
                  color: "#22c55e",
                  border: "1px solid #22c55e33",
                  backdropFilter: "blur(4px)",
                  }
                });
              }}
            >
              <SelectTrigger className="w-[110px] custom-input cursor-pointer">
                <SelectValue>
                  <div className="flex items-center font-medium">
                    <Percent className="mr-2 h-4 w-4" />
                    <span>{targetPercentage}%</span>
                  </div>
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="custom-dropdown mt-1">
                {[75, 80, 85, 90, 95].map((percentage) => (
                  <SelectItem key={percentage} value={percentage.toString()}>
                    <div className="flex items-center cursor-pointer">
                      <Percent className="mr-2 h-4 w-4 flex-shrink-0" />
                      <span className="font-medium">{percentage}%</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {!institutionsLoading && institutions && institutions.length > 0 && (
            <div className="flex max-md:hidden">
              <Select
                value={selectedInstitution}
                onValueChange={handleInstitutionChange}
              >
                <SelectTrigger className="w-[140px] md:w-[220px] custom-input cursor-pointer">
                  <SelectValue>
                    {selectedInstitution &&
                      institutions?.find(
                        (i) => i.id.toString() === selectedInstitution
                      ) && (
                        <div className="flex items-center font-medium">
                          <Building2 className="mr-2 h-4 w-4" />
                          <span className="truncate">
                            {truncateText(
                              institutions.find(
                                (i) => i.id.toString() === selectedInstitution
                              )?.institution.name || "",
                              window.innerWidth < 768 ? 10 : 16
                            )}
                          </span>
                        </div>
                      )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="custom-dropdown mt-1">
                  {institutions.map((inst) => (
                    <SelectItem key={inst.id} value={inst.id.toString()}>
                      <div className="flex items-center cursor-pointer">
                        <Building2 className="mr-2 h-4 w-4 flex-shrink-0" />
                        <span className="truncate font-medium">
                          {inst.institution.name}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                <Avatar className="h-9 w-9 outline-2">
                  <AvatarFallback>
                    <Image src={User} alt="Avatar" width={40} height={40} />
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="min-w-56 z-50 mt-1 custom-dropdown pr-1 mr-[-4px]"
              align="end"
            >
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium lowercase">
                    {user?.username}
                  </p>
                  <p className="text-xs text-muted-foreground lowercase">
                    {user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => navigateTo("/dashboard")}
                className="cursor-pointer"
              >
                <Layers2 className="mr-2 h-4 w-4" />
                <span>Dashboard</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => navigateTo("/tracking")}
                className="cursor-pointer"
              >
                <SquareAsterisk className="mr-2 h-4 w-4" />
                <span>Tracking</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => navigateTo("/profile")}
                className="cursor-pointer"
              >
                <UserRound className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>

              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                className="cursor-pointer"
                variant="destructive"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};
