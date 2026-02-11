import { NextResponse } from "next/server";
import { put, list, del, head } from "@vercel/blob";

/** GET /api/debug/blob — test Vercel Blob connection (temporary) */
export async function GET() {
  const results: Record<string, unknown> = {
    hasToken: !!process.env.BLOB_READ_WRITE_TOKEN,
    tokenPrefix: process.env.BLOB_READ_WRITE_TOKEN
      ? process.env.BLOB_READ_WRITE_TOKEN.substring(0, 12) + "..."
      : null,
  };

  // Test 1: List existing blobs and try to fetch them
  try {
    const { blobs } = await list();
    results.listOk = true;
    results.blobCount = blobs.length;

    const blobTests: Record<string, unknown>[] = [];
    for (const b of blobs) {
      const test: Record<string, unknown> = {
        pathname: b.pathname,
        size: b.size,
        url: b.url,
        downloadUrl: b.downloadUrl,
      };

      // Try fetching the public URL
      try {
        const res = await fetch(b.url, { cache: "no-store" });
        test.fetchUrlOk = res.ok;
        test.fetchUrlStatus = res.status;
        if (res.ok && b.size < 2000) {
          test.fetchUrlBody = await res.text();
        }
      } catch (error) {
        test.fetchUrlOk = false;
        test.fetchUrlError = error instanceof Error ? error.message : String(error);
      }

      // Try fetching the download URL
      try {
        const res = await fetch(b.downloadUrl, { cache: "no-store" });
        test.fetchDownloadOk = res.ok;
        test.fetchDownloadStatus = res.status;
      } catch (error) {
        test.fetchDownloadOk = false;
        test.fetchDownloadError = error instanceof Error ? error.message : String(error);
      }

      // Try head()
      try {
        const headResult = await head(b.url);
        test.headOk = true;
        test.headSize = headResult.size;
      } catch (error) {
        test.headOk = false;
        test.headError = error instanceof Error ? error.message : String(error);
      }

      blobTests.push(test);
    }
    results.blobTests = blobTests;
  } catch (error) {
    results.listOk = false;
    results.listError = error instanceof Error ? error.message : String(error);
  }

  // Test 2: Write + read cycle with slight delay
  try {
    const testBlob = await put("_test/ping.txt", "ok " + new Date().toISOString(), {
      access: "public",
      addRandomSuffix: false,
      contentType: "text/plain",
    });
    results.writeOk = true;
    results.writeUrl = testBlob.url;

    // Immediate read
    const res1 = await fetch(testBlob.url, { cache: "no-store" });
    results.immediateReadOk = res1.ok;
    results.immediateReadStatus = res1.status;

    // Read with cache buster
    const res2 = await fetch(`${testBlob.url}?t=${Date.now()}`, { cache: "no-store" });
    results.cacheBustReadOk = res2.ok;
    results.cacheBustReadStatus = res2.status;

    // Cleanup
    try { await del(testBlob.url); } catch { /* ignore */ }
  } catch (error) {
    results.writeOk = false;
    results.writeError = error instanceof Error ? error.message : String(error);
  }

  return NextResponse.json(results, { status: 200 });
}
