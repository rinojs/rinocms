#!/usr/bin/env node

/**
 * Smoke test for RinoCMS server.
 * Reads PORT environment variable (default 3333).
 * Requests /health endpoint and validates response shape and status.
 * Exits with code 0 on success, 1 on failure.
 */

import { setTimeout } from 'node:timers/promises';

const PORT = process.env.PORT || 3333;
const HEALTH_URL = `http://localhost:${ PORT }/health`;
const TIMEOUT_MS = 5000; // 5 seconds

async function smokeTest() {
    console.log(`Smoke testing ${HEALTH_URL} ...`);

    try {
        const controller = new AbortController();
        const timeout = setTimeout(TIMEOUT_MS).then(() => {
            controller.abort();
            throw new Error(`Request timed out after ${TIMEOUT_MS}ms`);
        });

        const response = await fetch(HEALTH_URL, {
            signal: controller.signal,
            headers: { 'Accept': 'application/json' }
        });

        clearTimeout(timeout);

        if (!response.ok) {
            console.error(`❌ Health endpoint returned ${response.status} ${response.statusText}`);
            return false;
        }

        const body = await response.json();

        // Validate shape: { ok: true, data: { timestamp: string } }
        if (!body.ok || typeof body.ok !== 'boolean' || body.ok !== true) {
            console.error(`❌ Response missing or invalid 'ok' field:`, body);
            return false;
        }

        if (body.data === undefined || typeof body.data !== 'object' || !body.data.timestamp || typeof body.data.timestamp !== 'string') {
            console.error(`❌ Response missing or invalid 'data.timestamp' field:`, body);
            return false;
        }

        console.log(`✅ Smoke test passed. Timestamp: ${body.data.timestamp}`);
        return true;
    } catch (error) {
        console.error('❌ Smoke test failed:', error.message);
        return false;
    }
}

// Run test
smokeTest().then(success => {
    process.exit(success ? 0 : 1);
});