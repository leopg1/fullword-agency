import { notFound } from "next/navigation";

/** Catch-all: orice rută necunoscută sub [locale] → 404-ul localizat. */
export default function CatchAllPage() {
  notFound();
}
