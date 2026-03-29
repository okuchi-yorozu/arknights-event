"use client";

import "@ant-design/v5-patch-for-react-19";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { GoogleLoginForm } from "../google-login";

export default function LoginPage() {
	const router = useRouter();
	const [isChecking, setIsChecking] = useState(true);

	useEffect(() => {
		const checkAuth = async () => {
			try {
				const response = await fetch("/api/admin/auth/check");
				if (response.ok) {
					router.push("/admin");
					return;
				}
			} catch (error) {
				console.error("Auth check error:", error);
			}
			setIsChecking(false);
		};

		checkAuth();
	}, [router]);

	if (isChecking) {
		return null;
	}

	return <GoogleLoginForm onSuccess={() => router.push("/admin")} />;
}
