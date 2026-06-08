import { Outlet, Link } from "react-router-dom";

export default function Layout() {
    return (
        <div className="min-h-screen bg-slate-50 text-slate-900">
            <nav className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center shadow-sm">
                <div className="text-xl font-bold text-blue-600">
                    Agency Platform
                </div>
                <div className="space-x-6">
                    <Link to="/" className="text-slate-600 hover:text-blue-600 font-medium">Dashboard</Link>
                    <Link to="/apply" className="text-slate-600 hover:text-blue-600 font-medium">Apply</Link>
                </div>
            </nav>

            <main className="p-8 max-w-6xl mx-auto">
                <Outlet />
            </main>
        </div>
    );
}