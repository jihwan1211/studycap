import type {Metadata} from "next";
import type {ReactNode} from "react";
import "./globals.css";
export const metadata: Metadata = {title: "STUDYCAP — 나만의 몰입 공간", description: "스크롤로 들어가고, 직접 조작하는 1인 캡슐 공간 프로토타입"};
export default function RootLayout({children}: {children: ReactNode}) { return <html lang="ko"><body>{children}</body></html>; }
