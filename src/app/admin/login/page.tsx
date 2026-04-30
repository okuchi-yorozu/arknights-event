"use client";

import "@ant-design/v5-patch-for-react-19";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { GoogleLoginForm } from "../google-login";

export default function LoginPage() {
	const router = useRouter();
	const [isChecking, setIsChecking] = useState(true);
	const [authError, setAuthError] = useState<string | null>(null);
	// Strict Mode の二重実行を防ぐフラグ
	const initialized = useRef(false);

	useEffect(() => {
		if (initialized.current) return;
		initialized.current = true;

		const checkExistingSession = async () => {
			try {
				const res = await fetch("/api/admin/auth/check");
				if (res.ok) {
					router.push("/admin");
					return;
				}
			} catch {}
			setIsChecking(false);
		};

		checkExistingSession();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	if (isChecking) {
		return null;
	}

	return <GoogleLoginForm error={authError} />;
}
