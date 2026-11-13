"use client";

import { UserRole, type AdminUser } from "@the-domain/types";
import { buttonClasses } from "@the-domain/ui";
import { useEffect, useState, type FormEvent } from "react";
import { operationsRequest } from "@/lib/operations";

interface Entry extends AdminUser {
  isActive: boolean;
}

const roles = [
  [UserRole.Editor, "Editor"],
  [UserRole.MediaManager, "Media manager"],
  [UserRole.Admin, "Administrator"],
  [UserRole.SuperAdmin, "Super administrator"],
] as const;
const input = "min-h-11 w-full border border-line bg-canvas px-3 text-ink";

export function UserDirectory({ currentUserId }: { currentUserId: string }) {
  const [users, setUsers] = useState<Entry[] | null>(null);
  const [offset, setOffset] = useState(0);
  const [revision, setRevision] = useState(0);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    operationsRequest<Entry[]>(`users?offset=${offset}`).then(
      (data) => {
        if (active) setUsers(data);
      },
      (failure: Error) => {
        if (active) setError(failure.message);
      },
    );
    return () => {
      active = false;
    };
  }, [offset, revision]);

  async function save(event: FormEvent<HTMLFormElement>, user?: Entry) {
    event.preventDefault();
    const form = event.currentTarget;
    const fields = new FormData(form);
    const role = Number(fields.get("role"));
    setError("");
    setStatus("");
    setBusy(true);
    try {
      if (user) {
        await operationsRequest(`users/${user.id}`, "PUT", {
          role,
          isActive: fields.get("active") === "on",
        });
      } else {
        await operationsRequest("users", "POST", {
          role,
          fullName: fields.get("fullName"),
          email: fields.get("email"),
          password: fields.get("password"),
        });
        form.reset();
      }
      setStatus(user ? "Access updated." : "User created.");
      setRevision((value) => value + 1);
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Unable to save this user.");
    } finally {
      setBusy(false);
    }
  }

  function paginate(value: number) {
    setUsers(null);
    setError("");
    setOffset(value);
  }

  return (
    <div className="grid gap-8">
      <form
        className="grid gap-4 border border-line bg-surface p-5 sm:grid-cols-2 sm:p-7"
        onSubmit={(event) => void save(event)}
      >
        <h2 className="text-xl font-semibold sm:col-span-2">Create a staff account</h2>
        <label className="grid gap-2">
          Full name
          <input name="fullName" className={input} maxLength={120} required />
        </label>
        <label className="grid gap-2">
          Email
          <input name="email" className={input} maxLength={254} required type="email" />
        </label>
        <label className="grid gap-2">
          Password
          <input
            name="password"
            className={input}
            autoComplete="new-password"
            minLength={12}
            maxLength={1024}
            required
            type="password"
          />
        </label>
        <label className="grid gap-2">
          Role
          <RoleSelect role={UserRole.Editor} />
        </label>
        <button
          className={buttonClasses("primary", "justify-self-start")}
          disabled={busy}
          type="submit"
        >
          Create account
        </button>
      </form>
      {error && (
        <p role="alert" className="text-error">
          {error}
        </p>
      )}
      {status && <p role="status">{status}</p>}
      {!users && !error && <p role="status">Loading staff accounts…</p>}
      <div className="grid gap-3">
        {users?.map((user) => (
          <form
            className="grid items-end gap-4 border border-line bg-surface p-4 lg:grid-cols-[minmax(0,1fr)_minmax(12rem,0.65fr)_auto_auto]"
            key={user.id}
            onSubmit={(event) => void save(event, user)}
          >
            <div className="self-center">
              <h2 className="font-semibold">{user.fullName}</h2>
              <p className="break-all text-sm text-ink-muted">{user.email}</p>
            </div>
            {user.id === currentUserId ? (
              <p className="text-sm text-ink-muted">Your account</p>
            ) : (
              <>
                <label className="grid gap-1 text-sm">
                  Role
                  <RoleSelect role={user.role} />
                </label>
                <label className="flex min-h-11 items-center gap-2">
                  <input name="active" defaultChecked={user.isActive} type="checkbox" /> Active
                </label>
                <button className={buttonClasses("secondary")} disabled={busy} type="submit">
                  Save access
                </button>
              </>
            )}
          </form>
        ))}
      </div>
      {users && (offset > 0 || users.length === 50) && (
        <nav aria-label="User pages" className="flex gap-3">
          <button
            className={buttonClasses("secondary")}
            disabled={busy || offset === 0}
            onClick={() => paginate(offset - 50)}
          >
            Previous
          </button>
          <button
            className={buttonClasses("secondary")}
            disabled={busy || users.length < 50}
            onClick={() => paginate(offset + 50)}
          >
            Next
          </button>
        </nav>
      )}
    </div>
  );
}

function RoleSelect({ role }: { role: UserRole }) {
  return (
    <select className={input} defaultValue={role} name="role">
      {roles.map(([value, label]) => (
        <option key={value} value={value}>
          {label}
        </option>
      ))}
    </select>
  );
}
