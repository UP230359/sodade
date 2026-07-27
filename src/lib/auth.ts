export interface RegisterInput {
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  accountType: "personal" | "professional";
  cedula?: string;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  accountType: "personal" | "professional";
  isOnboarded: boolean;
  cedula?: string;
}

/**
 * Simulates registering a user in a database.
 * Ready for future SQL database integration (e.g. PostgreSQL, MySQL, SQLite, etc.)
 */
export async function registerUserInDB(data: RegisterInput): Promise<User> {
  // Simulate network/database latency
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Placeholder indicating the SQL query that will run here:
  /*
  SQL Query representation:
  
  INSERT INTO users (first_name, last_name, email, password_hash, account_type, is_onboarded, cedula)
  VALUES ($1, $2, $3, $4, $5, $6, $7)
  RETURNING id, first_name, last_name, email, account_type, is_onboarded, cedula;
  */
  
  console.log("SQL Database query simulation: INSERT INTO users ... for email:", data.email, "cedula:", data.cedula);

  // Return a mock user object representing the row returned by the database
  return {
    id: `usr_${Math.random().toString(36).substr(2, 9)}`,
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email,
    accountType: data.accountType,
    isOnboarded: false, // Will become true after accepting the onboarding agreement
    cedula: data.cedula,
  };
}

/**
 * Calls the local Next.js API endpoint to validate if the professional credential (cédula) is real.
 */
export async function validateCedula(cedula: string): Promise<{ valid: boolean; simulated?: boolean; message?: string }> {
  try {
    const res = await fetch(`/api/validate-cedula?cedula=${encodeURIComponent(cedula)}`);
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
export async function updateOnboardingInDB(userId: string): Promise<boolean> {
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Placeholder indicating the SQL query that will run here:
  /*
  SQL Query representation:
  
  UPDATE users 
  SET is_onboarded = TRUE 
  WHERE id = $1;
  */
  console.log(`SQL Database query simulation: UPDATE users SET is_onboarded = TRUE WHERE id = '${userId}'`);

  return true;
}
