"use client";

import { useTranslations } from "next-intl";
import { User } from "@/types/client";
import {
  Table,
  TableHead,
  TableBody,
  TableHeader,
  TableRow,
  TableCell,
} from "@/components/ui/Table";
import { Button } from "@/components/ui/Button";
import { getRoleBadgeVariant } from "@/types/roles";
import { Spinner } from "@/components/ui/Spinner";
import { PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";
import { DateDisplay } from "../ui/DateDisplay";
import { Badge } from "../ui/Badge";

interface UsersListProps {
  users: User[];
  isLoading: boolean;
  error: string | null;
  onEditUser: (user: User) => void;
  onDeleteUser: (user: User) => void;
}

export function UsersList({
  users,
  isLoading,
  error,
  onEditUser,
  onDeleteUser,
}: Readonly<UsersListProps>) {
  const t = useTranslations("admin.users");

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner className="h-8 w-8 text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md bg-red-50 p-4 my-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-red-400"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm  text-red-800">{t("error")}</h3>
            <div className="mt-2 text-sm text-red-700">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="text-center py-10 border rounded-md">
        <p className="text-gray-500">{t("noUsers")}</p>
      </div>
    );
  }

  return (
    <div className="mt-8 flow-root">
      <Table className="min-w-full divide-y divide-gray-300">
        <TableHead>
          <TableRow>
            <TableHeader scope="col">{t("name")}</TableHeader>
            <TableHeader scope="col">{t("email")}</TableHeader>
            <TableHeader scope="col">{t("role")}</TableHeader>
            <TableHeader scope="col">{t("created")}</TableHeader>
            <TableHeader scope="col" className="relative">
              <span className="sr-only">{t("actions")}</span>
            </TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {users.map((user) => {
            const roleBadgeColor = getRoleBadgeVariant(user.role);

            return (
              <TableRow key={user.userId}>
                <TableCell className=" text-gray-900">{user.name}</TableCell>
                <TableCell className="text-gray-500">{user.email}</TableCell>
                <TableCell>
                  <Badge className="mt-2" variant={roleBadgeColor}>
                    {t(`roles.${user.role}`)}
                  </Badge>
                </TableCell>
                <TableCell className="text-gray-500">
                  <DateDisplay date={user.createdAt.toString()} />
                </TableCell>
                <TableCell className="text-right text-sm ">
                  <div className="flex gap-2 justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEditUser(user)}
                      className="text-primary-600 hover:text-primary-900"
                    >
                      <PencilSquareIcon className="w-4 h-4 mr-1" />
                      {t("edit")}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDeleteUser(user)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <TrashIcon className="w-4 h-4 mr-1" />
                      {t("delete")}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
