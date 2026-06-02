import { apiClient } from "./api";
import { ENDPOINTS } from "@/constants/api";
import { LoginRequest, LoginResponse, RegisterRequest } from "@/types/auth.types";
import { ApiResponse } from "@/types/api.types";
import auth from "@react-native-firebase/auth";

function getFirebaseAuthMessage(error: unknown): string {
  const code =
    typeof error === "object" && error !== null && "code" in error
      ? String((error as { code?: unknown }).code)
      : "";

  if (
    code === "auth/invalid-credential" ||
    code === "auth/invalid-email" ||
    code === "auth/user-not-found" ||
    code === "auth/wrong-password"
  ) {
    return "Invalid email or password";
  }

  if (code === "auth/email-already-in-use") {
    return "An account with this email already exists.";
  }

  if (code === "auth/weak-password") {
    return "Password is too weak.";
  }

  if (code === "auth/network-request-failed") {
    return "Network error. Check your connection and try again.";
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Authentication failed. Please try again.";
}

export const authService = {
  async login(data: LoginRequest): Promise<LoginResponse> {
    const credential = await auth()
      .signInWithEmailAndPassword(data.email, data.password)
      .catch((error) => {
        throw new Error(getFirebaseAuthMessage(error));
      });
    const idToken = await credential.user.getIdToken();

    const response = await apiClient.post<ApiResponse<LoginResponse>>(
      ENDPOINTS.LOGIN,
      { idToken }
    );
    return response.data.data;
  },

  async register(data: RegisterRequest): Promise<void> {
    let firebaseUser = null;

    try {
      const credential = await auth().createUserWithEmailAndPassword(
        data.email,
        data.password
      );
      firebaseUser = credential.user;

      await firebaseUser.updateProfile({ displayName: data.name });
      const idToken = await firebaseUser.getIdToken();

      await apiClient.post<ApiResponse<void>>(ENDPOINTS.REGISTER, {
        name: data.name,
        email: data.email,
        mobile: data.mobile,
        idToken,
      });
    } catch (error) {
      if (firebaseUser) {
        await firebaseUser.delete().catch(() => undefined);
      }

      throw new Error(getFirebaseAuthMessage(error));
    }
  },

  async googleLogin(idToken: string): Promise<LoginResponse> {
    const response = await apiClient.post<ApiResponse<LoginResponse>>(
      ENDPOINTS.GOOGLE_LOGIN,
      { idToken }
    );
    return response.data.data;
  },

  async deleteAccount(): Promise<void> {
    await apiClient.delete<ApiResponse<null>>(ENDPOINTS.DELETE_ACCOUNT);
    await auth().signOut().catch(() => undefined);
  },
};
