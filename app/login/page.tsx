import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
export default function LoginPage(){ return <main className="flex min-h-screen items-center justify-center bg-slate-50 p-4"><Card className="w-full max-w-md"><h1 className="text-2xl font-bold">Login placeholder</h1><p className="mt-1 text-sm text-slate-500">Ready for Supabase Auth integration.</p><div className="mt-6 space-y-3"><Input placeholder="Email"/><Input placeholder="Password" type="password"/><Button>Continue</Button></div></Card></main>; }
