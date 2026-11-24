import type {Metadata} from "next";
import ParkingLookup from "./parking-lookup";

export const metadata: Metadata = {title: "주차 시간 조회 — 스터디 캡슐 옥길", robots: {index: false, follow: false}};

export default function ParkingPage() {
  return <>
    <header><a className="brand" href="/">스터디 캡슐 옥길</a></header>
    <main className="pk-main"><ParkingLookup /></main>
  </>;
}
