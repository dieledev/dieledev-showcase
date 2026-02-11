import { NextResponse } from "next/server";
import { put, list, del } from "@vercel/blob";

/** GET /api/debug/blob — test Vercel Blob connection (temporary debug endpoint) */
export async function GET() {

  const results: Record<string, unknown> = {
    hasToken: !!process.env.BLOB_READ_WRITE_TOKEN,
    tokenPrefix: process.env.BLOB_READ_WRITE_TOKEN
      ? process.env.BLOB_READ_WRITE_TOKEN.substring(0, 12) + "..."
      : null,
  };

  // Test 1: List blobs
  try {
    const { blobs } = await list();
    results.listOk = true;
    results.blobCount = blobs.length;
    results.blobs = blobs.map((b) => ({
      pathname: b.pathname,
      size: b.size,
      uploadedAt: b.uploadedAt,
    }));
  } catch (error) {
    results.listOk = false;
    results.listError = error instanceof Error ? error.message : String(error);
  }

  // Test 2: Write a test blob
  try {
    const testBlob = await put("_test/ping.txt", "ok " + new Date().toISOString(), {
      access: "public",
      addRandomSuffix: false,
      contentType: "text/plain",
    });
    results.writeOk = true;
    results.writeUrl = testBlob.url;
    results.writePathname = testBlob.pathname;

    // Test 3: Read it back
    try {
      const res = await fetch(testBlob.url, { cache: "no-store" });
      results.readOk = res.ok;
      results.readStatus = res.status;
      results.readBody = await res.text();
    } catch (error) {
      results.readOk = false;
      results.readError = error instanceof Error ? error.message : String(error);
    }

    // Cleanup test blob
    try {
      await del(testBlob.url);
      results.deleteOk = true;
    } catch {
      results.deleteOk = false;
    }
  } catch (error) {
    results.writeOk = false;
    results.writeError = error instanceof Error ? error.message : String(error);
  }

  return NextResponse.json(results, { status: 200 });
}
