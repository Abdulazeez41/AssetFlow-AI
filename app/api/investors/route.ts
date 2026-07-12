import { getInvestors } from '@/lib/db';
import { ok, serverError } from '@/lib/http';

export async function GET() {
  try {
    return ok({ investors: await getInvestors() });
  } catch (error) {
    return serverError('Failed to load investors.', error instanceof Error ? error.message : error);
  }
}
