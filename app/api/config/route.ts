import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    appServiceUrl: process.env.APP_SERVICE_URL
  })
}