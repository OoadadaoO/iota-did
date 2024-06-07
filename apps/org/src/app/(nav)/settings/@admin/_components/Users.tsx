"use client";

import React, { useState } from "react";

import axios from "axios";
import { BriefcaseBusiness, Handshake, Users2 } from "lucide-react";

import type { PatchUserResponse } from "@/app/api/users/[userId]/type";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import type { UserType } from "@/lib/db/type";
import {
  decodePermission,
  encodePermission,
  type PermissionType,
} from "@/lib/utils/parsePermission";
import type { CheckedState } from "@radix-ui/react-checkbox";

type Props = {
  users: Omit<UserType, "hashedPassword">[];
};

type UserState = (Omit<UserType, "hashedPassword" | "permission"> & {
  permission: Record<PermissionType, boolean>;
})[];

export function Users({ users: dbUsers }: Props) {
  const [filter, setFilter] = useState<string>("");
  const [users, setUsers] = useState<UserState>(
    sortUsers(
      dbUsers.map((u) => ({
        ...u,
        permission: decodePermission(u.permission),
      })),
    ),
  );

  // useEffect(() => {
  //   setUsers(
  //     sortUsers(
  //       dbUsers
  //         .filter(
  //           (u) => u.username.includes(filter) || u.email.includes(filter),
  //         )
  //         .map((u) => ({
  //           ...u,
  //           permission: decodePermission(u.permission),
  //         })),
  //     ),
  //   );
  // }, [filter, dbUsers]);

  const handlePermissionChange =
    (userId: string, permissionType: PermissionType) =>
    async (e: CheckedState) => {
      const user = users.find((u) => u.id === userId);
      if (!user) return;
      const permission = {
        ...user.permission,
        [permissionType]: e || false,
      };
      try {
        const res = await axios.patch<PatchUserResponse>(
          `/api/users/${userId}`,
          {
            permission: encodePermission(permission),
          },
        );
        // fetch error
        if (res.data.error) {
          console.error(res.data.error);
          return;
        }
        // success => update state
        const resUser = {
          ...res.data.data.user,
          permission: decodePermission(res.data.data.user.permission),
        };
        setUsers((prev) => prev.map((u) => (u.id === userId ? resUser : u)));
      } catch (error) {
        console.error(error);
      }
    };
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-base font-medium">Total Users</CardTitle>
          <Users2 className="text-muted-foreground h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{getNumOfUser(users)}</div>
          <p className="text-muted-foreground text-sm">users are signed up.</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-base font-medium">Partners</CardTitle>
          <Handshake className="text-muted-foreground h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{getNumOfPartners(users)}</div>
          <p className="text-muted-foreground text-sm">
            instances register their DID successfully.
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-base font-medium">Members</CardTitle>
          <BriefcaseBusiness className="text-muted-foreground h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{getNumOfMembers(users)}</div>
          <p className="text-muted-foreground text-sm">
            instances are our members.
          </p>
        </CardContent>
      </Card>
      <Card className="md:col-span-2 lg:col-span-3">
        <CardHeader className="flex flex-col items-start justify-between gap-y-6 space-y-0 pb-6 md:flex-row md:items-center md:gap-y-0">
          <CardTitle className="text-2xl font-semibold">
            Manage Permissions
          </CardTitle>
          <Input
            type="text"
            placeholder="Search"
            className="w-full md:w-96"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </CardHeader>
        <CardContent className="w-full">
          <ScrollArea className="w-[calc(100vw-82px)] md:w-[calc(100vw-98px)]">
            <table className="min-w-full table-auto border-collapse">
              <thead>
                <tr className="border-border text-muted-foreground border-b">
                  <th className="p-2 pb-1 text-left text-sm font-normal">
                    User
                  </th>
                  <th className="bg-primary/10 p-2 pb-1 text-center text-sm font-normal">
                    Admin
                  </th>
                  <th className="p-2 pb-1 text-center text-sm font-normal">
                    Member
                  </th>
                  <th className="p-2 pb-1 text-center text-sm font-normal">
                    Partner
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortUsers(filterUsers(users, filter)).map((user) => {
                  return (
                    <tr key={user.id} className="border-border border-b">
                      <td className="p-2">
                        <h3 className="text-base font-semibold">
                          {user.username}
                        </h3>
                        <p className="text-muted-foreground text-sm">
                          {user.email}
                        </p>
                      </td>
                      <td className="bg-primary/10 p-2 text-center">
                        <Checkbox
                          checked={user.permission.admin}
                          onCheckedChange={handlePermissionChange(
                            user.id,
                            "admin",
                          )}
                        />
                      </td>
                      <td className="p-2 text-center">
                        <Checkbox
                          checked={user.permission.member}
                          onCheckedChange={handlePermissionChange(
                            user.id,
                            "member",
                          )}
                        />
                      </td>
                      <td className="p-2 text-center">
                        <Checkbox checked={user.permission.partner} disabled />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}

function getNumOfUser(users: UserState) {
  return users.length;
}
function getNumOfMembers(users: UserState) {
  return users.filter((u) => u.permission.member || u.permission.admin).length;
}
function getNumOfPartners(users: UserState) {
  return users.filter((u) => u.permission.partner).length;
}

function sortUsers(users: UserState) {
  return users
    .sort((a, b) => a.username.localeCompare(b.username))
    .sort((a, b) =>
      a.permission.partner === b.permission.partner
        ? 0
        : a.permission.partner
          ? -1
          : 1,
    )
    .sort((a, b) =>
      a.permission.member === b.permission.member
        ? 0
        : a.permission.member
          ? -1
          : 1,
    )
    .sort((a, b) =>
      a.permission.admin === b.permission.admin
        ? 0
        : a.permission.admin
          ? -1
          : 1,
    );
}

function filterUsers(users: UserState, filter: string) {
  return users.filter(
    (u) => u.username.includes(filter) || u.email.includes(filter),
  );
}
