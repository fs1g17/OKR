"use server";

import { AxiosError } from "axios";
import { redirect } from "next/navigation";

import { signIn as performSignIn } from "@/api/auth";
import { cookies } from "next/headers";

export async function signIn(prevState: any, formData: FormData) {
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;

  try {
    const { value, expires, httpOnly, secure } = await performSignIn({
      username,
      password,
    });

    cookies().set("jwt", value, {
      expires: expires,
      httpOnly: httpOnly,
      secure: secure,
      sameSite: "lax",
    });
  } catch (error) {
    const e = error as AxiosError;
    return {
      success: false,
      message: (e.response?.data as { message: string; description: string })
        ?.description,
    };
  }

  console.log("successfully signed in");
  redirect("/list");
}
