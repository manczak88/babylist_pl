import { NextRequest, NextResponse } from "next/server";
import {
  updateList,
  deleteGift,
  updateReservation,
  cancelReservation,
  createList,
  ownerList,
  publicList,
  addGift,
  reserve,
  reservation,
  AppError,
} from "@/lib/db";
import { ZodError } from "zod";
export const runtime = "nodejs";
async function handle(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  try {
    if (
      req.method !== "GET" &&
      req.headers.get("origin") &&
      new URL(req.headers.get("origin")!).host !== req.headers.get("host")
    )
      throw new AppError(403, "Ta operacja jest niedozwolona.");
    const p = (await params).path;
    let result: any = { ok: true };
    const body = ["POST", "PATCH"].includes(req.method) ? await req.json() : {};
    if (p[0] === "lists" && req.method === "POST") result = createList(body);
    else if (p[0] === "public" && req.method === "GET")
      result = publicList(p[1]);
    else if (p[0] === "owner") {
      const l = ownerList(p[1]);
      if (p.length === 2) {
        if (req.method === "GET") result = publicList(l.id);
        else if (req.method === "PATCH") {
          updateList(p[1], body);
        } else throw new AppError(405, "Niedozwolona operacja.");
      } else if (p[2] === "gifts") {
        if (req.method === "POST" || req.method === "PATCH")
          addGift(p[1], body, p[3]);
        else if (req.method === "DELETE") {
          deleteGift(p[1], p[3]);
        } else throw new AppError(405, "Niedozwolona operacja.");
      } else throw new AppError(404, "Nie znaleziono strony.");
    } else if (p[0] === "reserve" && req.method === "POST")
      result = reserve(p[1], body.name);
    else if (p[0] === "reservation") {
      reservation(p[1]);
      if (req.method === "GET") result = reservation(p[1]);
      else if (req.method === "DELETE") cancelReservation(p[1]);
      else if (req.method === "PATCH") {
        updateReservation(p[1], body.status);
      } else throw new AppError(405, "Niedozwolona operacja.");
    } else throw new AppError(404, "Nie znaleziono strony.");
    return NextResponse.json(result, {
      headers: {
        "Cache-Control": "no-store",
        "Referrer-Policy": "no-referrer",
      },
    });
  } catch (e) {
    const status =
      e instanceof AppError
        ? e.status
        : e instanceof ZodError || e instanceof SyntaxError
          ? 400
          : 500;
    return NextResponse.json(
      {
        error:
          e instanceof ZodError
            ? e.issues[0].message
            : status === 500
              ? "Coś poszło nie tak. Spróbuj ponownie."
              : (e as Error).message,
      },
      { status },
    );
  }
}
export { handle as GET, handle as POST, handle as PATCH, handle as DELETE };
