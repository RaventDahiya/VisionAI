import { NextRequest, NextResponse } from "next/server";
import { conToDb } from "@/lib/db";
import { User } from "@/models/User";
import { error } from "console";

export async function POST(required: NextRequest) {
  try {
    const { email, password } = await required.json();
    if (!email || !password) {
      return NextResponse.json(
        { error: "email and password are required" },
        { status: 400 }
      );
    }
    await conToDb();

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: "user already present" },
        { status: 400 }
      );
    }

    const user = await User.create({
      email,
      password,
    });

    return NextResponse.json(
      { message: "user registered succesfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("registration error");
    return NextResponse.json(
      { error: "fail to register user" },
      { status: 400 }
    );
  }
}
