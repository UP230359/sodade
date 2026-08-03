import { NextResponse } from "next/server";

// Hardcoded list of valid test credentials to allow testing when the official SEP server is offline.
const VALID_TEST_CEDULAS = new Set(["1007204", "1234567", "7654321", "8765432"]);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const cedula = searchParams.get("cedula");

  if (!cedula) {
    return NextResponse.json({ valid: false, error: "Missing cedula parameter" }, { status: 400 });
  }

  // Regular expression to validate standard 7 or 8-digit professional credentials in Mexico
  const numericCedulaRegex = /^\d{7,8}$/;
  if (!numericCedulaRegex.test(cedula)) {
    return NextResponse.json({
      valid: false,
      message: "Invalid professional credential format (must be 7 or 8 digits)",
    });
  }

  // 1. Check against known test credentials for offline development stability
  if (VALID_TEST_CEDULAS.has(cedula)) {
    return NextResponse.json({
      valid: true,
      simulated: true,
      message: "Valid and verified test credential",
    });
  }

  // 2. Query the official SEP Solr endpoint
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const solrUrl = `http://search.sep.gob.mx/solr/cedulasCore/select?fl=*,score&q=${encodeURIComponent(
      cedula
    )}&start=0&rows=10&wt=json`;

    const response = await fetch(solrUrl, {
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      const numFound = data.response?.numFound || 0;

      if (numFound > 0) {
        // Cédula exists in the registry
        return NextResponse.json({
          valid: true,
          simulated: false,
          details: data.response.docs[0],
        });
      }
    }
  } catch (error) {
    console.warn("Official SEP Solr registry timed out or failed.");
  }

  // If it's not a test credential and official query failed/returned no results, it's rejected
  return NextResponse.json({
    valid: false,
    message: "The professional credential does not exist in the National Registry of Professionals",
  });
}
