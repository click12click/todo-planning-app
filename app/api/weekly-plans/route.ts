import { NextResponse } from "next/server";
import { listWeeklyPlans } from "@/lib/repo/weekly-plans";

export async function GET() {
  const plans = await listWeeklyPlans();
  return NextResponse.json(plans);
}
