export interface RegisterInput {
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  accountType: "personal" | "professional";
  cedula?: string;
}

export interface User {
  // id como number para que sea compatible con el User de "@/lib/api",
  // que es el que usa el resto de la app (mood checkins, journals, dashboard)
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  accountType: "personal" | "professional";
  isOnboarded: boolean;
  cedula?: string;
}

export async function registerUserInDB(data: RegisterInput): Promise<User> {
  const res = await fetch("/api/auth/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result = await res.json();

  // DEBUG: Log what the backend actually returned
  console.log("Backend registration response:", result);

  if (!res.ok || !result.success) {
    throw new Error(result.error || "Failed to register user in database");
  }

  return result.user;
}

/**
 * Calls the local Next.js API endpoint to validate if the professional credential (cédula) is real.
 */
export async function validateCedula(
  cedula: string,
): Promise<{ valid: boolean; simulated?: boolean; message?: string }> {
  try {
    const res = await fetch(
      `/api/validate-cedula?cedula=${encodeURIComponent(cedula)}`,
    );
    if (!res.ok) {
      return { valid: false, message: "Server error validating credential" };
    }
    return await res.json();
  } catch (error) {
    console.error("Error validating Cédula:", error);
    return { valid: false, message: "Network connection error" };
  }
}

/**
 * Simulates updating the onboarding status in a database.
 */
export async function updateOnboardingInDB(userId: number): Promise<boolean> {
  await new Promise((resolve) => setTimeout(resolve, 500));

  console.log(
    `SQL Database query simulation: UPDATE users SET is_onboarded = TRUE WHERE id = '${userId}'`,
  );

  return true;
}
