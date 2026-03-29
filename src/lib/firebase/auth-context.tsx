"use client";

import { signInAnonymously } from "firebase/auth";
import type { User } from "firebase/auth";
import { createContext, useContext, useEffect, useState } from "react";

import { clientAuth } from "./client";

interface AuthContextValue {
	user: User | null;
	getIdToken: () => Promise<string>;
}

const AuthContext = createContext<AuthContextValue>({
	user: null,
	getIdToken: async () => {
		throw new Error("AuthContext not initialized");
	},
});

export const AuthProvider = ({ children }: React.PropsWithChildren) => {
	const [user, setUser] = useState<User | null>(null);

	useEffect(() => {
		const unsubscribe = clientAuth.onAuthStateChanged(async (currentUser) => {
			if (currentUser) {
				setUser(currentUser);
			} else {
				try {
					const result = await signInAnonymously(clientAuth);
					setUser(result.user);
				} catch (error) {
					console.error("匿名サインインエラー:", error);
				}
			}
		});

		return () => unsubscribe();
	}, []);

	const getIdToken = async (): Promise<string> => {
		if (!user) {
			throw new Error("ユーザーが認証されていません");
		}
		return user.getIdToken();
	};

	return (
		<AuthContext.Provider value={{ user, getIdToken }}>
			{children}
		</AuthContext.Provider>
	);
};

export const useAuth = () => useContext(AuthContext);
