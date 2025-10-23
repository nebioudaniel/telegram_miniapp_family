// app/api/register/route.ts (Example Registration API Route)

import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient(); 

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, name } = body;

    // 1. Hash the password
    const hashedPassword = await bcrypt.hash(password, 10); // 10 is the salt rounds

    // 2. Create the user in the database
    const user = await prisma.user.create({
      data: {
        email,
        name,
        hashedPassword,
        // The role will default to 'TEACHER' based on your schema default
      },
    });

    // 3. Respond with success (don't send back the hashed password)
    return NextResponse.json({ 
      id: user.id, 
      email: user.email, 
      name: user.name 
    }, { status: 201 });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'User registration failed' }, { status: 500 });
  }
}