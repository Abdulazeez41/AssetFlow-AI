import { getDashboardSnapshot } from '@/lib/demo';
import { ok, serverError } from '@/lib/http';

export async function GET() {
  try {
    return ok(await getDashboardSnapshot());
  } catch (error) {
    return serverError('Failed to load dashboard snapshot.', error instanceof Error ? error.message : error);
  }
}
