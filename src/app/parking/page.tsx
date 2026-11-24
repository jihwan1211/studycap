import type {Metadata} from "next";
import ParkingLookup from "./parking-lookup";

export const metadata: Metadata = {title: "주차 시간 조회 — STUDYCAP", robots: {index: false, follow: false}};

export default function ParkingPage() {
  return <>
    <header><a className="brand" href="/">studycap<span>●</span></a></header>
    <main className="pk-main"><ParkingLookup /></main>
  </>;
}
