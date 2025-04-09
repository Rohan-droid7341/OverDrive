// src/app/api/github/profile/route.js
import { NextResponse } from 'next/server';

// Use environment variables securely on the server
const GITHUB_USERNAME = process.env.GITHUB_USERNAME;
const GITHUB_PAT = process.env.GITHUB_PAT;

export async function GET(request) {
  if (!GITHUB_USERNAME || !GITHUB_PAT) {
    return NextResponse.json(
      { error: 'GitHub username or PAT not configured on server.' },
      { status: 500 }
    );
  }

  const GITHUB_API_BASE = 'https://api.github.com';
  const headers = {
    Authorization: `Bearer ${GITHUB_PAT}`,
    Accept: 'application/vnd.github.v3+json',
  };

  try {
    // Fetch user profile data and repository data in parallel
    const [userRes, reposRes] = await Promise.all([
      fetch(`${GITHUB_API_BASE}/users/${GITHUB_USERNAME}`, { headers }),
      //