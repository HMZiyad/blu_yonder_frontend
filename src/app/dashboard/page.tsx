"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { dashboardService } from "../../services/dashboard.service";
import { aircraftService } from "../../services/aircraft.service";
import { userService } from "../../services/user.service";
import { authService } from "../../services/auth.service";

export default function DashboardPage() {
    const router = useRouter();
    const [activeView, setActiveView] = useState("overview");
    const [identifyState, setIdentifyState] = useState("upload");
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [settingsTab, setSettingsTab] = useState("profile");

    // Loading & Error states
    const [isLoading, setIsLoading] = useState(false);
    const [isIdentifying, setIsIdentifying] = useState(false); // separate from isLoading
    const [error, setError] = useState<string | null>(null);

    // Data states
    const [stats, setStats] = useState<any>(null);
    const [identifyResult, setIdentifyResult] = useState<any>(null);
    const [records, setRecords] = useState<any[]>([]);
    const [profile, setProfile] = useState<any>(null); // initialized after mount to avoid SSR hydration mismatch
    const [previewImage, setPreviewImage] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);
    // Ref to track the in-flight identification promise across tab switches
    const identifyPromiseRef = useRef<Promise<any> | null>(null);

    // Database row actions
    const [openRowMenu, setOpenRowMenu] = useState<number | null>(null); // ikey of row with open menu
    const [detailRecord, setDetailRecord] = useState<any>(null); // record shown in detail modal
    const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null); // ikey pending delete

    // Load cached user from localStorage after mount (avoids SSR hydration mismatch)
    useEffect(() => {
        const cachedUser = authService.getUser();
        if (cachedUser) setProfile(cachedUser);
    }, []);

    useEffect(() => {
        setError(null);
        if (activeView === "overview") fetchStats();
        else if (activeView === "database") fetchRecords();
        else if (activeView === "settings" && settingsTab === "profile") fetchProfile();
    }, [activeView, settingsTab, identifyState]);

    const fetchStats = async () => {
        setIsLoading(true);
        try {
            // Backend returns: { total_images, to_be_processed, weekly_chart: number[] }
            const data: any = await dashboardService.getStats();
            setStats(data);
        } catch (err: any) {
            console.error('Stats error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchRecords = async (search?: string) => {
        setIsLoading(true);
        try {
            // Backend returns: { records: AircraftRecord[] }
            const data: any = await aircraftService.getRecords(search);
            setRecords(data?.records || []);
        } catch (err: any) {
            console.error('Records error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchProfile = async () => {
        setIsLoading(true);
        try {
            const data = await userService.getProfile();
            setProfile(data);
        } catch (err: any) {
            console.error('Profile error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = (e: any) => {
        e.preventDefault();
        authService.logout();
        router.push('/');
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setIsIdentifying(true);
            setIdentifyState('analyzing');
            setError(null);
            
            // Create local preview immediately
            const objectUrl = URL.createObjectURL(file);
            setPreviewImage(objectUrl);

            // Fire the API call and store the promise in a ref so it survives tab switches
            const promise = aircraftService.identify(file);
            identifyPromiseRef.current = promise;

            // Reset the file input immediately so re-uploads work
            e.target.value = '';

            try {
                const result: any = await promise;
                setIdentifyResult(result);
                setIdentifyState('result');
            } catch (err: any) {
                setError(err.message || 'Failed to identify image');
                setIdentifyState('upload');
            } finally {
                setIsIdentifying(false);
                identifyPromiseRef.current = null;
            }
        }
    };

    const handleUpdateProfile = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        const formData = new FormData(e.currentTarget);
        const payload = {
            name: formData.get('name') as string,
            email: formData.get('email') as string,
            phone: formData.get('phone') as string,
            organization: formData.get('organization') as string
        };
        try {
            const res: any = await userService.updateProfile(payload);
            // Update cached user so header reflects changes immediately
            const currentUser = authService.getUser() || {};
            authService.setUser({ ...currentUser, ...payload, ...(res?.user || {}) });
            setProfile((prev: any) => ({ ...prev, ...payload, ...(res?.user || {}) }));
            alert("Profile updated successfully!");
        } catch (err: any) {
            setError(err.message || "Failed to update profile");
        } finally {
            setIsLoading(false);
        }
    };

    const handleChangePassword = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        const formData = new FormData(e.currentTarget);
        const newPassword = formData.get('new_password') as string;
        const confirm = formData.get('confirm_password') as string;

        if (newPassword !== confirm) {
            setError("New passwords do not match");
            setIsLoading(false);
            return;
        }

        try {
            await userService.changePassword({
                current_password: formData.get('current_password') as string,
                new_password: newPassword
            });
            alert("Password changed successfully!");
            (e.target as HTMLFormElement).reset();
        } catch (err: any) {
            setError(err.message || "Failed to change password");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            fetchRecords(e.currentTarget.value);
        }
    };

    const handleDeleteRecord = async (id: number) => {
        try {
            await aircraftService.deleteRecord(id);
            setRecords(prev => prev.filter((r: any) => r.ikey !== id));
            setDeleteConfirmId(null);
            setOpenRowMenu(null);
        } catch (err: any) {
            alert(err.message || 'Failed to delete record');
        }
    };

    // Map actual backend field names to display values
    // Backend stats: { total_images, to_be_processed, weekly_chart: number[] }
    const totalImages = stats?.total_images ?? 0;
    const toBeProcessed = stats?.to_be_processed ?? 0;
    const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const MAX_CHART = 40;
    const weekData = (stats?.weekly_chart as number[] | undefined)
        ? (stats.weekly_chart as number[]).map((v: number, i: number) => ({ label: DAY_LABELS[i] || `D${i}`, h: `${Math.round((v / MAX_CHART) * 100)}%` }))
        : DAY_LABELS.map(l => ({ label: l, h: '0%' }));
    const displayRecords = records;

    return (
        <div className="flex h-screen overflow-hidden bg-[#f3f4f6] text-[#111827] font-sans">
            {/* Sidebar */}
            <aside className="w-[260px] bg-[#111827] flex flex-col text-[#9ca3af]">
                <div className="py-5 flex justify-center border-b border-white/5">
                    <img src="/logo/logo-aahs-3 1.png" alt="Logo" className="w-[80px]" />
                </div>

                <div className="text-[11px] font-semibold tracking-wide py-5 px-6 pb-2.5 uppercase text-white/40">MAIN MENU</div>
                <nav className="flex flex-col gap-1 px-4 flex-1">
                    <button onClick={() => setActiveView("overview")} className={`flex items-center gap-3 px-4 py-3 text-[14px] rounded-lg transition-colors ${activeView === "overview" ? 'bg-[#3730a3] text-white' : 'hover:bg-[#1f2937] hover:text-white'}`}>
                        <i className="ti ti-layout-dashboard text-[18px]"></i> Overview
                    </button>
                    <button onClick={() => setActiveView("identify")} className={`flex items-center gap-3 px-4 py-3 text-[14px] rounded-lg transition-colors ${activeView === "identify" ? 'bg-[#3730a3] text-white' : 'hover:bg-[#1f2937] hover:text-white'}`}>
                        <i className="ti ti-scan text-[18px]"></i> Identify Aircraft
                    </button>
                    <button onClick={() => setActiveView("database")} className={`flex items-center gap-3 px-4 py-3 text-[14px] rounded-lg transition-colors ${activeView === "database" ? 'bg-[#3730a3] text-white' : 'hover:bg-[#1f2937] hover:text-white'}`}>
                        <i className="ti ti-database text-[18px]"></i> Database
                    </button>
                </nav>

                <div className="p-[20px_16px] border-t border-white/5">
                    <a href="#" onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 text-[14px] rounded-lg text-[#ef4444] transition-colors hover:bg-red-500/10 hover:text-[#ef4444]">
                        <i className="ti ti-logout text-[18px]"></i> Logout
                    </a>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-hidden">
                {/* Topbar */}
                <header className="h-[70px] bg-white border-b border-[#e5e7eb] flex justify-end items-center px-8 shrink-0">
                    <div className="flex items-center gap-6">
                        <button className="bg-transparent border-none text-[#6b7280] text-[20px] cursor-pointer hover:text-[#111827]">
                            <i className="ti ti-bell"></i>
                        </button>
                        <div className="relative">
                            <div className="flex items-center gap-3 cursor-pointer" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
                                <div className="flex flex-col items-end">
                                    <span className="text-[14px] font-medium">{profile?.name || "User"}</span>
                                    <span className="text-[12px] text-[#6b7280]">Admin</span>
                                </div>
                                <img src="https://i.pravatar.cc/150?img=11" alt="Avatar" className="w-9 h-9 rounded-full" />
                                <i className="ti ti-chevron-down text-[#111827] text-[16px]"></i>
                            </div>

                            {isDropdownOpen && (
                                <div className="absolute top-[calc(100%+10px)] right-0 w-[280px] bg-white rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.1)] border border-[#e5e7eb] z-50 p-4 animate-in fade-in zoom-in-95 duration-200">
                                    <div className="flex items-center justify-between pb-4 border-b border-[#e5e7eb]">
                                        <div className="flex items-center gap-3">
                                            <img src="https://i.pravatar.cc/150?img=11" alt="Avatar" className="w-10 h-10 rounded-full" />
                                            <div>
                                                <div className="text-[14px] font-semibold text-[#111827]">{profile?.name || "User"}</div>
                                                <div className="text-[11px] font-medium text-[#6b7280] bg-[#f3f4f6] px-2 py-0.5 rounded-full inline-block mt-1">Admin</div>
                                            </div>
                                        </div>
                                        <button className="text-[#6b7280] hover:text-[#111827] bg-transparent border-none cursor-pointer" onClick={() => setIsDropdownOpen(false)}>
                                            <i className="ti ti-x text-[18px]"></i>
                                        </button>
                                    </div>
                                    <div className="py-2">
                                        <button className="w-full text-left px-2 py-2.5 text-[14px] text-[#111827] bg-transparent border-none cursor-pointer hover:bg-[#f9fafb] rounded-md transition-colors" onClick={() => { setActiveView("settings"); setSettingsTab("profile"); setIsDropdownOpen(false); }}>
                                            Profile
                                        </button>
                                        <button className="w-full flex items-center justify-between bg-transparent border-none cursor-pointer px-2 py-2.5 text-[14px] text-[#111827] hover:bg-[#f9fafb] rounded-md transition-colors" onClick={() => { setActiveView("settings"); setSettingsTab("profile"); setIsDropdownOpen(false); }}>
                                            Settings
                                            <i className="ti ti-chevron-right text-[#6b7280]"></i>
                                        </button>
                                    </div>
                                    <div className="pt-2">
                                        <button onClick={handleLogout} className="w-full bg-[#3730a3] border-none border-none cursor-pointer text-white py-2.5 rounded-md text-[14px] font-medium hover:bg-[#312e81] transition-colors">
                                            Log out
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {/* Workspace */}
                <div className="flex-1 p-10 overflow-y-auto bg-[#f3f4f6]">

                    {error && activeView !== "settings" && (
                        <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-600 text-[14px]">
                            {error}
                        </div>
                    )}

                    {/* VIEW: OVERVIEW */}
                    {activeView === "overview" && (
                        <div className="animate-in fade-in duration-300">
                            <h1 className="text-[24px] font-semibold mb-2">Dashboard Overview</h1>
                            <p className="text-[14px] text-[#6b7280]">Welcome back, here's your fleet overview.</p>

                            <div className="grid grid-cols-3 gap-6 mt-6">
                                <div className="bg-white rounded-xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
                                    <div className="flex justify-between items-center text-[14px] text-[#111827] font-medium mb-4">
                                        <span>Total Images Identified</span>
                                        <i className="ti ti-plane text-[#8b5cf6] text-[18px]"></i>
                                    </div>
                                    <h2 className="text-[32px] font-semibold mb-2">{totalImages}</h2>
                                    <p className="text-[12px] text-[#6b7280]">Total Overall Images Processed</p>
                                </div>

                                <div className="bg-white rounded-xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
                                    <div className="flex justify-between items-center text-[14px] text-[#111827] font-medium mb-4">
                                        <span>To Be Processed</span>
                                        <i className="ti ti-message-circle text-[#10b981] text-[18px]"></i>
                                    </div>
                                    <h2 className="text-[32px] font-semibold mb-2">{toBeProcessed}</h2>
                                    <p className="text-[12px] text-[#6b7280]">Currently ongoing</p>
                                </div>

                                <div className="bg-[#e5e7eb] rounded-xl p-6"></div>
                            </div>

                            <div className="bg-[#eaeaf1] rounded-xl p-6 mt-6">
                                <h3 className="text-[16px] font-semibold text-[#4338ca]">Total Images Identified (Weekly)</h3>

                                <div className="flex h-[250px] gap-4 relative mt-6">
                                    <div className="flex flex-col justify-between text-[#6b7280] text-[12px] pb-6">
                                        <span>40</span><span>32</span><span>24</span><span>16</span><span>8</span><span>0</span>
                                    </div>

                                    <div className="flex-1 relative">
                                        <div className="absolute inset-0 h-[calc(100%-24px)] flex flex-col justify-between z-0">
                                            {[1, 2, 3, 4, 5, 6].map((_, i) => (
                                                <div key={i} className="border-t border-black/5 h-0" />
                                            ))}
                                        </div>

                                        <div className="absolute inset-0 h-[calc(100%-24px)] flex justify-around items-end z-10 px-2.5">
                                            {weekData.map((item: any) => (
                                                <div key={item.label} className="flex flex-col items-center justify-end h-full relative w-10 text-center">
                                                    <div className="w-6 bg-[#3730a3] rounded-t-sm transition-all duration-300" style={{ height: item.h }} />
                                                    <span className="absolute -bottom-6 text-[12px] text-[#6b7280]">{item.label}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-center mt-4">
                                    <div className="flex items-center gap-2 text-[12px] text-[#111827]">
                                        <span className="w-3 h-3 rounded-full bg-[#3730a3]"></span> Identified Images
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* VIEW: IDENTIFY AIRCRAFT */}
                    {activeView === "identify" && (
                        <div className="animate-in fade-in duration-300">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h1 className="text-[24px] font-semibold mb-2">Identify Aircraft</h1>
                                    <p className="text-[14px] text-[#6b7280]">Upload aircraft images for AI-powered analysis and registration detection.</p>
                                </div>
                                {identifyState === "result" && (
                                    <button 
                                        onClick={() => {
                                            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(identifyResult, null, 2));
                                            const downloadAnchorNode = document.createElement('a');
                                            downloadAnchorNode.setAttribute("href", dataStr);
                                            downloadAnchorNode.setAttribute("download", `identified_${identifyResult?.model_name || 'aircraft'}.json`);
                                            document.body.appendChild(downloadAnchorNode);
                                            downloadAnchorNode.click();
                                            downloadAnchorNode.remove();
                                        }} 
                                        className="bg-[#3730a3] text-white border-none py-2.5 px-5 rounded-md text-[14px] font-medium cursor-pointer hover:bg-[#312e81] flex items-center gap-2"
                                    >
                                        <i className="ti ti-upload"></i> Export JSON
                                    </button>
                                )}
                            </div>

                            {/* Steps indicator bar — shared across upload/analyzing states */}
                            {(identifyState === "upload" || identifyState === "analyzing") && (
                                <div className="flex items-center justify-between bg-white rounded-xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.05)] mt-6">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-[24px] ${identifyState === 'upload' ? 'bg-[#3730a3] text-white' : 'bg-[#10b981] text-white'}`}>
                                            <i className={identifyState === 'upload' ? 'ti ti-upload' : 'ti ti-circle-check'}></i>
                                        </div>
                                        <div>
                                            <div className="font-semibold text-[14px] text-[#111827]">Upload Image</div>
                                            <div className="text-[12px] text-[#6b7280]">{identifyState === 'upload' ? 'Drop aircraft photos' : 'Image uploaded'}</div>
                                        </div>
                                    </div>
                                    <i className="ti ti-chevron-right text-[#6b7280] text-[20px]"></i>
                                    <div className="flex items-center gap-3">
                                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-[24px] ${identifyState === 'analyzing' ? 'bg-[#3730a3] text-white animate-pulse' : 'bg-[#f3f4f6] text-[#111827]'}`}>
                                            <i className="ti ti-scan"></i>
                                        </div>
                                        <div>
                                            <div className="font-semibold text-[14px] text-[#111827]">AI Detection</div>
                                            <div className="text-[12px] text-[#6b7280]">{identifyState === 'analyzing' ? 'Processing...' : 'OCR & type ID'}</div>
                                        </div>
                                    </div>
                                    <i className="ti ti-chevron-right text-[#6b7280] text-[20px]"></i>
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-lg bg-[#f3f4f6] text-[#111827] flex items-center justify-center text-[24px]">
                                            <i className="ti ti-database"></i>
                                        </div>
                                        <div>
                                            <div className="font-semibold text-[14px] text-[#111827]">Database Lookup</div>
                                            <div className="text-[12px] text-[#6b7280]">Check the existing database</div>
                                        </div>
                                    </div>
                                    <i className="ti ti-chevron-right text-[#6b7280] text-[20px]"></i>
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-lg bg-[#f3f4f6] text-[#111827] flex items-center justify-center text-[24px]">
                                            <i className="ti ti-file-description"></i>
                                        </div>
                                        <div>
                                            <div className="font-semibold text-[14px] text-[#111827]">Aircraft Result</div>
                                            <div className="text-[12px] text-[#6b7280]">Get all craft details</div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {identifyState === "upload" && (
                                <div className="animate-in fade-in duration-300">
                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        className="border-2 border-dashed border-[#3730A3]/40 bg-white hover:bg-[#fdfdff] hover:border-[#3730a3] rounded-xl py-14 px-6 flex flex-col items-center text-center cursor-pointer transition-all mt-6"
                                    >
                                        <input 
                                            type="file" 
                                            ref={fileInputRef} 
                                            onChange={handleImageUpload} 
                                            className="hidden" 
                                            accept="image/*"
                                        />
                                        <i className="ti ti-camera text-[#3730a3] text-[32px] mb-4"></i>
                                        <h3 className="font-semibold text-[16px] mb-2">Upload Aircraft Images</h3>
                                        <p className="text-[13px] text-[#6b7280] max-w-[500px] leading-relaxed">
                                            Drop aircraft photos here or click to upload. Our AI will detect<br />the registration number, identify the aircraft type, and fetch FAA<br />data automatically.
                                        </p>
                                        <button className="bg-[#3730a3] text-white border-none py-2.5 px-5 rounded-md text-[14px] font-medium cursor-pointer hover:bg-[#312e81] mt-6 mx-auto">
                                            Select Image
                                        </button>
                                    </div>
                                </div>
                            )}

                            {identifyState === "analyzing" && (
                                <div className="animate-in fade-in duration-300">
                                    <div className="border-2 border-dashed border-[#e5e7eb] bg-[#f9fafb] rounded-xl py-14 px-6 flex flex-col items-center text-center mt-6">
                                        <i className="ti ti-loader text-[#3730a3] text-[32px] mb-4 animate-spin"></i>
                                        <h3 className="font-semibold text-[16px] mb-2">Analyzing Image...</h3>
                                        <p className="text-[13px] text-[#6b7280] max-w-[500px]">Please wait while our AI processes the aircraft data. You can switch tabs — this will continue in the background.</p>
                                    </div>
                                </div>
                            )}

                            {identifyState === "result" && (
                                <div className="flex gap-6 mt-6 animate-in fade-in duration-300">
                                    {/* Identified Image Sidebar */}
                                    <div className="bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.05)] flex flex-col w-[320px] min-h-[500px]">
                                        <div className="p-[20px_24px] font-semibold text-[14px] border-b border-[#e5e7eb] flex items-center gap-2">
                                            <i className="ti ti-photo text-[#8b5cf6]"></i> Identified Image
                                        </div>

                                        <div className="flex-1">
                                            {identifyResult && (
                                                <div className="flex items-center px-6 py-4 gap-4 border-b border-[#e5e7eb] bg-[#fcfcff]">
                                                    <div className="w-12 h-12 rounded-md bg-[#e5e7eb] shrink-0 flex items-center justify-center text-[#3730a3] text-[22px]">
                                                        <i className="ti ti-plane"></i>
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="font-medium text-[14px] mb-1">{identifyResult.image_filename || 'Uploaded Image'}</div>
                                                        <div className="text-[12px] flex items-center gap-1 text-[#10b981]">
                                                            <i className="ti ti-circle-check"></i> Completed
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <button
                                            onClick={() => setIdentifyState("upload")}
                                            className="bg-[#3730a3] text-white p-4 w-full border-none m-0 rounded-b-xl hover:bg-[#312e81] font-medium cursor-pointer"
                                        >
                                            Add More
                                        </button>
                                    </div>

                                    {/* Result Details */}
                                    <div className="flex-1 bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.05)] p-6">
                                        <div className="grid grid-cols-2 gap-6">
                                            {previewImage ? (
                                                <div 
                                                    className="bg-[#f3f4f6] min-h-[300px] border-radius-8 bg-contain bg-center bg-no-repeat rounded-lg"
                                                    style={{ backgroundImage: `url(${previewImage})` }}
                                                ></div>
                                            ) : (
                                                <div className="bg-[#f3f4f6] min-h-[300px] border-radius-8 bg-[url('/logo/logo-aahs-3 1.png')] bg-contain bg-center bg-no-repeat rounded-lg"></div>
                                            )}

                                            <div>
                                                <div className="inline-flex items-center gap-1.5 text-[#10b981] bg-[#10b981]/10 px-3 py-1.5 rounded-full text-[12px] font-medium">
                                                    <i className="ti ti-circle-check"></i> Identify Completed
                                                </div>
                                                <h2 className="text-[24px] font-semibold mt-4">{identifyResult?.model_name || 'Unknown Aircraft'}</h2>

                                                <table className="w-full mt-4 text-[14px]">
                                                    <tbody>
                                                        {[
                                                            { label: "Image File Name :", val: identifyResult?.image_filename || '—' },
                                                            { label: "Manufacturer :", val: identifyResult?.manufacturer || '—' },
                                                            { label: "Civil ID :", val: identifyResult?.image_metadata?.['Civil ID'] || '—' },
                                                            { label: "Common Name :", val: identifyResult?.image_metadata?.['Common Name'] || '—' },
                                                            { label: "Confidence Factor :", val: identifyResult?.image_metadata?.['Confidence Factor'] || '—' },
                                                            { label: "Operator :", val: identifyResult?.image_metadata?.['Operator'] || '—' },
                                                        ].map((spec) => (
                                                            <tr key={spec.label}>
                                                                <td className="py-2 text-[#6b7280] w-[140px]">{spec.label}</td>
                                                                <td className="py-2 font-medium text-[#111827]">{spec.val}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>

                                        <div className="mt-6 pt-6 border-t border-[#e5e7eb] text-[13px] leading-[1.6] text-[#6b7280]">
                                            <p>Notes : {identifyResult?.image_metadata?.['Notes'] || '—'}</p>
                                            {identifyResult?.historical_context && (
                                                <p className="mt-3">{identifyResult.historical_context.slice(0, 400)}{identifyResult.historical_context.length > 400 ? '...' : ''}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* VIEW: DATABASE */}
                    {activeView === "database" && (
                        <div className="animate-in fade-in duration-300">
                            <h1 className="text-[24px] font-semibold mb-2">Database</h1>
                            <p className="text-[14px] text-[#6b7280]">Verified aircraft records from FAA database lookups.</p>

                            <div className="flex justify-between items-center mt-6">
                                <div className="flex gap-3">
                                    <div className="relative">
                                        <i className="ti ti-search absolute left-3 top-1/2 -translate-y-1/2 text-[#6b7280]"></i>
                                        <input type="text" placeholder="Search Database..." onKeyDown={handleSearch} className="pl-9 pr-3 py-2.5 border border-[#e5e7eb] rounded-md w-[280px] text-[14px] outline-none text-[#111827] focus:border-[#3730a3]" />
                                    </div>
                                    <button className="px-3 py-2 border border-[#e5e7eb] bg-white rounded-md flex items-center text-[#6b7280] text-[18px] cursor-pointer hover:bg-gray-50">
                                        <i className="ti ti-filter"></i>
                                    </button>
                                </div>
                                <button onClick={() => aircraftService.exportAll()} className="bg-[#3730a3] text-white border-none py-2.5 px-5 rounded-md text-[14px] font-medium cursor-pointer hover:bg-[#312e81] flex items-center gap-2">
                                    <i className="ti ti-upload"></i> Export Database
                                </button>
                            </div>

                            <div className="bg-white rounded-xl border border-[#e5e7eb] overflow-hidden mt-6">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr>
                                            {["File Name", "Registration", "Aircraft Name", "Serial No.", "Owner", "Year", ""].map(h => (
                                                <th key={h} className="px-6 py-4 bg-white text-[#6b7280] font-medium text-[13px] border-b border-[#e5e7eb]">{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {displayRecords.map((row: any, idx: number) => (
                                            <tr key={row.ikey || idx} className="last:border-0 hover:bg-[#f9fafb] transition-colors">
                                                {/* Backend DB columns: filename, civilid, model, serno, owner, manf */}
                                                <td className="px-6 py-5 border-b border-[#e5e7eb] text-[14px] text-[#111827]">{row.filename || '—'}</td>
                                                <td className="px-6 py-5 border-b border-[#e5e7eb] text-[14px] text-[#111827]">{row.civilid || row.milid || '—'}</td>
                                                <td className="px-6 py-5 border-b border-[#e5e7eb] text-[14px] text-[#111827]">{row.model || '—'}</td>
                                                <td className="px-6 py-5 border-b border-[#e5e7eb] text-[14px] text-[#111827]">{row.serno || '—'}</td>
                                                <td className="px-6 py-5 border-b border-[#e5e7eb] text-[14px] text-[#111827]">{row.owner || '—'}</td>
                                                <td className="px-6 py-5 border-b border-[#e5e7eb] text-[14px] text-[#111827]">{row.manf || '—'}</td>
                                                <td className="px-6 py-5 border-b border-[#e5e7eb] text-[14px] text-[#111827]">
                                                    <div className="relative">
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); setOpenRowMenu(openRowMenu === row.ikey ? null : row.ikey); }}
                                                            className="bg-transparent border-none text-[#6b7280] cursor-pointer text-[18px] hover:text-[#3730a3]"
                                                        >
                                                            <i className="ti ti-dots-vertical"></i>
                                                        </button>
                                                        {openRowMenu === row.ikey && (
                                                            <div className="absolute right-0 top-[calc(100%+4px)] w-[160px] bg-white rounded-lg shadow-[0_4px_16px_rgba(0,0,0,0.12)] border border-[#e5e7eb] z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                                                                <button
                                                                    onClick={() => { setDetailRecord(row); setOpenRowMenu(null); }}
                                                                    className="w-full flex items-center gap-2.5 px-4 py-3 text-[13px] text-[#111827] bg-transparent border-none cursor-pointer hover:bg-[#f3f4f6] transition-colors text-left"
                                                                >
                                                                    <i className="ti ti-eye text-[16px] text-[#3730a3]"></i> View Details
                                                                </button>
                                                                <button
                                                                    onClick={() => { setDeleteConfirmId(row.ikey); setOpenRowMenu(null); }}
                                                                    className="w-full flex items-center gap-2.5 px-4 py-3 text-[13px] text-[#ef4444] bg-transparent border-none cursor-pointer hover:bg-red-50 transition-colors text-left"
                                                                >
                                                                    <i className="ti ti-trash text-[16px]"></i> Delete
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {displayRecords.length === 0 && !isLoading && (
                                    <div className="p-8 text-center text-[#6b7280] text-[14px]">No records found.</div>
                                )}
                                {isLoading && (
                                    <div className="p-8 text-center text-[#3730a3] text-[14px] flex justify-center"><i className="ti ti-loader animate-spin text-[24px]"></i></div>
                                )}
                                <div className="flex justify-between items-center px-6 py-4 bg-[#fdfdfd] border-t border-[#e5e7eb]">
                                    <span className="text-[13px] text-[#6b7280]">Showing 1 to {displayRecords.length} Images</span>
                                    <div className="flex gap-2">
                                        <a href="#" className="w-8 h-8 flex justify-center items-center rounded-lg text-[13px] text-[#111827] bg-transparent hover:bg-[#f3f4f6]" onClick={(e) => e.preventDefault()}><i className="ti ti-chevron-left"></i></a>
                                        <a href="#" className="w-8 h-8 flex justify-center items-center rounded-lg text-[13px] text-white bg-[#3730a3]" onClick={(e) => e.preventDefault()}>1</a>
                                        <a href="#" className="w-8 h-8 flex justify-center items-center rounded-lg text-[13px] text-[#111827] bg-transparent hover:bg-[#f3f4f6]" onClick={(e) => e.preventDefault()}>2</a>
                                        <a href="#" className="w-8 h-8 flex justify-center items-center rounded-lg text-[13px] text-[#111827] bg-transparent hover:bg-[#f3f4f6]" onClick={(e) => e.preventDefault()}>3</a>
                                        <a href="#" className="w-8 h-8 flex justify-center items-center rounded-lg text-[13px] text-[#111827] bg-transparent hover:bg-[#f3f4f6]" onClick={(e) => e.preventDefault()}><i className="ti ti-chevron-right"></i></a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* DETAIL MODAL */}
                    {detailRecord && (
                        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-6" onClick={() => setDetailRecord(null)}>
                            <div className="bg-white rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.15)] w-full max-w-[700px] max-h-[85vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
                                {/* Modal Header */}
                                <div className="flex items-center justify-between px-8 py-5 border-b border-[#e5e7eb] bg-gradient-to-r from-[#3730a3] to-[#5b51d8]">
                                    <div>
                                        <h2 className="text-[18px] font-semibold text-white">{detailRecord.model || 'Unknown Aircraft'}</h2>
                                        <p className="text-[13px] text-white/70 mt-0.5">{detailRecord.manf || 'Unknown Manufacturer'}</p>
                                    </div>
                                    <button onClick={() => setDetailRecord(null)} className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center text-white border-none cursor-pointer hover:bg-white/25 transition-colors">
                                        <i className="ti ti-x text-[16px]"></i>
                                    </button>
                                </div>

                                {/* Modal Body */}
                                <div className="overflow-y-auto max-h-[calc(85vh-72px)] p-8">
                                    {/* Status badge */}
                                    <div className="mb-6">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium ${detailRecord.rights === 'Identified' ? 'text-[#10b981] bg-[#10b981]/10' : detailRecord.rights === 'Processing' ? 'text-[#f59e0b] bg-[#f59e0b]/10' : 'text-[#6b7280] bg-[#f3f4f6]'}`}>
                                            <i className={`ti ${detailRecord.rights === 'Identified' ? 'ti-circle-check' : detailRecord.rights === 'Processing' ? 'ti-loader animate-spin' : 'ti-clock'}`}></i>
                                            {detailRecord.rights || 'Unknown'}
                                        </span>
                                    </div>

                                    {/* Details grid */}
                                    <div className="grid grid-cols-2 gap-x-8 gap-y-5">
                                        {[
                                            { label: 'File Name', value: detailRecord.filename, icon: 'ti-file' },
                                            { label: 'Manufacturer', value: detailRecord.manf, icon: 'ti-building-factory' },
                                            { label: 'Aircraft Model', value: detailRecord.model, icon: 'ti-plane' },
                                            { label: 'Category', value: detailRecord.category, icon: 'ti-category' },
                                            { label: 'Civil ID', value: detailRecord.civilid, icon: 'ti-id' },
                                            { label: 'Military ID', value: detailRecord.milid, icon: 'ti-shield' },
                                            { label: 'Serial / C/N', value: detailRecord.serno, icon: 'ti-hash' },
                                            { label: 'Owner / Operator', value: detailRecord.owner, icon: 'ti-user' },
                                            { label: 'Type', value: detailRecord.type, icon: 'ti-tag' },
                                            { label: 'Folder', value: detailRecord.folder, icon: 'ti-folder' },
                                            { label: 'Neg No.', value: detailRecord.negno, icon: 'ti-photo' },
                                            { label: 'Image Quality', value: detailRecord.imgqual ? `${detailRecord.imgqual}/5` : null, icon: 'ti-star' },
                                            { label: 'Photo Date', value: detailRecord.photodate, icon: 'ti-calendar' },
                                            { label: 'Location', value: detailRecord.location, icon: 'ti-map-pin' },
                                            { label: 'View', value: detailRecord.view, icon: 'ti-eye' },
                                            { label: 'Photographer', value: detailRecord.photog, icon: 'ti-camera' },
                                            { label: 'Collection', value: detailRecord.collection, icon: 'ti-archive' },
                                            { label: 'Record ID', value: detailRecord.ikey, icon: 'ti-key' },
                                        ].map(item => (
                                            <div key={item.label} className="flex items-start gap-3">
                                                <div className="w-8 h-8 rounded-md bg-[#f3f4f6] flex items-center justify-center text-[#6b7280] text-[14px] shrink-0 mt-0.5">
                                                    <i className={`ti ${item.icon}`}></i>
                                                </div>
                                                <div>
                                                    <div className="text-[12px] text-[#6b7280] font-medium">{item.label}</div>
                                                    <div className="text-[14px] text-[#111827] mt-0.5">{item.value || '—'}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Notes section */}
                                    {detailRecord.notes && (
                                        <div className="mt-6 pt-5 border-t border-[#e5e7eb]">
                                            <div className="flex items-center gap-2 text-[13px] font-medium text-[#6b7280] mb-2">
                                                <i className="ti ti-notes text-[16px]"></i> Notes
                                            </div>
                                            <p className="text-[14px] text-[#111827] leading-relaxed bg-[#f9fafb] rounded-lg p-4">{detailRecord.notes}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* DELETE CONFIRMATION */}
                    {deleteConfirmId !== null && (
                        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-6" onClick={() => setDeleteConfirmId(null)}>
                            <div className="bg-white rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.15)] w-full max-w-[400px] p-8 animate-in fade-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
                                <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-5">
                                    <i className="ti ti-alert-triangle text-[#ef4444] text-[28px]"></i>
                                </div>
                                <h3 className="text-[18px] font-semibold text-center text-[#111827]">Delete Record</h3>
                                <p className="text-[14px] text-[#6b7280] text-center mt-2 mb-6">Are you sure you want to delete this record? This action cannot be undone.</p>
                                <div className="flex gap-3">
                                    <button onClick={() => setDeleteConfirmId(null)} className="flex-1 py-2.5 bg-[#f3f4f6] text-[#111827] rounded-lg text-[14px] font-medium border-none cursor-pointer hover:bg-[#e5e7eb] transition-colors">
                                        Cancel
                                    </button>
                                    <button onClick={() => handleDeleteRecord(deleteConfirmId)} className="flex-1 py-2.5 bg-[#ef4444] text-white rounded-lg text-[14px] font-medium border-none cursor-pointer hover:bg-[#dc2626] transition-colors">
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* VIEW: SETTINGS */}
                    {activeView === "settings" && (
                        <div className="animate-in fade-in duration-300">
                            <h1 className="text-[24px] font-semibold mb-2">Settings</h1>
                            <p className="text-[14px] text-[#6b7280]">Manage your account and application preferences</p>

                            {error && (
                                <div className="mt-4 mb-2 p-3 rounded bg-red-50 border border-red-200 text-red-600 text-[14px]">
                                    {error}
                                </div>
                            )}

                            <div className="flex gap-6 mt-6">
                                {/* Settings Sidebar */}
                                <div className="w-[240px] shrink-0">
                                    <div className="bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.05)] overflow-hidden">
                                        <div className="p-2 flex flex-col gap-1">
                                            <button onClick={() => { setSettingsTab("profile"); setError(null); }} className={`flex items-center gap-3 px-4 py-3 text-[14px] border-none cursor-pointer rounded-lg transition-colors text-left ${settingsTab === "profile" ? 'bg-[#f3f4f6] text-[#111827] font-medium' : 'bg-transparent text-[#6b7280] hover:bg-gray-50'}`}>
                                                <i className="ti ti-user text-[18px]"></i> Profile
                                            </button>
                                            <button onClick={() => { setSettingsTab("security"); setError(null); }} className={`flex items-center gap-3 px-4 py-3 text-[14px] border-none cursor-pointer rounded-lg transition-colors text-left ${settingsTab === "security" ? 'bg-[#f3f4f6] text-[#111827] font-medium' : 'bg-transparent text-[#6b7280] hover:bg-gray-50'}`}>
                                                <i className="ti ti-shield-check text-[18px]"></i> Security
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Settings Content */}
                                <div className="flex-1">
                                    {settingsTab === "profile" && (
                                        <div className="bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.05)] p-8 animate-in fade-in duration-300">
                                            <h2 className="text-[16px] font-semibold text-[#111827] mb-1">Profile Settings</h2>
                                            <p className="text-[13px] text-[#6b7280] mb-8 pb-6 border-b border-[#e5e7eb]">Update your personal information and credentials</p>
                                            
                                            <div className="mb-8">
                                                <div className="text-[14px] font-medium text-[#111827] mb-4">Profile Picture</div>
                                                <div className="relative inline-block">
                                                    <div className="w-20 h-20 rounded-full bg-[#5b51d8] flex items-center justify-center text-white text-[28px]">
                                                        <i className="ti ti-user"></i>
                                                    </div>
                                                    <button className="absolute bottom-[2px] right-[2px] w-[22px] h-[22px] rounded-full bg-[#10b981] flex items-center justify-center text-white text-[12px] border-[2px] border-white cursor-pointer hover:bg-[#059669]">
                                                        <i className="ti ti-camera"></i>
                                                    </button>
                                                </div>
                                            </div>

                                            <form onSubmit={handleUpdateProfile}>
                                                <div className="grid grid-cols-1 gap-5 max-w-[600px]">
                                                    <div>
                                                        <label className="block text-[13px] text-[#374151] mb-1.5">Full Name</label>
                                                        <input type="text" name="name" defaultValue={profile?.name || ""} required className="w-full border border-[#e5e7eb] rounded-lg px-4 py-2.5 text-[14px] text-[#111827] outline-none focus:border-[#5b51d8] focus:ring-1 focus:ring-[#5b51d8]" />
                                                    </div>
                                                    <div>
                                                        <label className="block text-[13px] text-[#374151] mb-1.5">Email Address</label>
                                                        <input type="email" name="email" defaultValue={profile?.email || ""} required className="w-full border border-[#e5e7eb] rounded-lg px-4 py-2.5 text-[14px] text-[#111827] outline-none focus:border-[#5b51d8] focus:ring-1 focus:ring-[#5b51d8]" />
                                                    </div>
                                                    <div>
                                                        <label className="block text-[13px] text-[#374151] mb-1.5">Phone Number</label>
                                                        <input type="tel" name="phone" defaultValue={profile?.phone || ""} className="w-full border border-[#e5e7eb] rounded-lg px-4 py-2.5 text-[14px] text-[#111827] outline-none focus:border-[#5b51d8] focus:ring-1 focus:ring-[#5b51d8]" />
                                                    </div>
                                                    <div>
                                                        <label className="block text-[13px] text-[#374151] mb-1.5">Organization</label>
                                                        <input type="text" name="organization" defaultValue={profile?.organization || ""} className="w-full border border-[#e5e7eb] rounded-lg px-4 py-2.5 text-[14px] text-[#111827] outline-none focus:border-[#5b51d8] focus:ring-1 focus:ring-[#5b51d8]" />
                                                    </div>
                                                </div>

                                                <div className="mt-8">
                                                    <button type="submit" disabled={isLoading} className="bg-[#4338ca] border-none cursor-pointer hover:bg-[#3730a3] text-white text-[14px] font-medium py-2.5 px-5 rounded-md transition-colors flex items-center gap-2 disabled:opacity-50">
                                                        {isLoading ? <i className="ti ti-loader animate-spin text-[18px]"></i> : <i className="ti ti-device-floppy text-[18px]"></i>}
                                                        Save Changes
                                                    </button>
                                                </div>
                                            </form>
                                        </div>
                                    )}

                                    {settingsTab === "security" && (
                                        <div className="bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.05)] p-8 animate-in fade-in duration-300">
                                            <h2 className="text-[16px] font-semibold text-[#111827] mb-1">Change Password</h2>
                                            <p className="text-[13px] text-[#6b7280] mb-8 pb-6 border-b border-[#e5e7eb]">Ensure your account uses a strong, unique password</p>
                                            
                                            <form onSubmit={handleChangePassword}>
                                                <div className="grid grid-cols-1 gap-5 max-w-[600px]">
                                                    <div>
                                                        <label className="block text-[13px] text-[#374151] mb-1.5">Current Password</label>
                                                        <input type="password" name="current_password" required placeholder="Enter your current password" className="w-full border border-[#e5e7eb] rounded-lg px-4 py-2.5 text-[14px] text-[#111827] outline-none focus:border-[#5b51d8] focus:ring-1 focus:ring-[#5b51d8]" />
                                                    </div>
                                                    <div>
                                                        <label className="block text-[13px] text-[#374151] mb-1.5">New Password</label>
                                                        <input type="password" name="new_password" required placeholder="Enter your new password" className="w-full border border-[#e5e7eb] rounded-lg px-4 py-2.5 text-[14px] text-[#111827] outline-none focus:border-[#5b51d8] focus:ring-1 focus:ring-[#5b51d8]" />
                                                    </div>
                                                    <div>
                                                        <label className="block text-[13px] text-[#374151] mb-1.5">Confirm New Password</label>
                                                        <input type="password" name="confirm_password" required placeholder="Enter new password" className="w-full border border-[#e5e7eb] rounded-lg px-4 py-2.5 text-[14px] text-[#111827] outline-none focus:border-[#5b51d8] focus:ring-1 focus:ring-[#5b51d8]" />
                                                    </div>
                                                </div>

                                                <div className="mt-8">
                                                    <button type="submit" disabled={isLoading} className="bg-[#4338ca] border-none cursor-pointer hover:bg-[#3730a3] text-white text-[14px] font-medium py-2.5 px-5 rounded-md transition-colors flex items-center gap-2 disabled:opacity-50">
                                                        {isLoading ? <i className="ti ti-loader animate-spin text-[18px]"></i> : <i className="ti ti-device-floppy text-[18px]"></i>}
                                                        Update Password
                                                    </button>
                                                </div>
                                            </form>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
