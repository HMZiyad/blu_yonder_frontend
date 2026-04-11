"use client";

import { useState } from "react";
import Link from "next/link";

export default function DashboardPage() {
    const [activeView, setActiveView] = useState("overview");
    const [identifyState, setIdentifyState] = useState("upload");

    return (
        <div className="flex h-screen overflow-hidden bg-[#f3f4f6] text-[#111827] font-sans">

            {/* Sidebar */}
            <aside className="w-[260px] bg-[#111827] flex flex-col text-[#9ca3af]">
                <div className="py-5 flex justify-center border-b border-white/5">
                    <img src="/logo/logo-aahs-3 1.png" alt="Logo" className="w-[80px]" />
                </div>

                <div className="text-[11px] font-semibold tracking-wide py-5 px-6 pb-2.5 uppercase text-white/40">MAIN MENU</div>
                <nav className="flex flex-col gap-1 px-4 flex-1">
                    <button
                        onClick={() => setActiveView("overview")}
                        className={`flex items-center gap-3 px-4 py-3 text-[14px] rounded-lg transition-colors ${activeView === "overview" ? 'bg-[#3730a3] text-white' : 'hover:bg-[#1f2937] hover:text-white'}`}
                    >
                        <i className="ti ti-layout-dashboard text-[18px]"></i> Overview
                    </button>
                    <button
                        onClick={() => { setActiveView("identify"); setIdentifyState("upload"); }}
                        className={`flex items-center gap-3 px-4 py-3 text-[14px] rounded-lg transition-colors ${activeView === "identify" ? 'bg-[#3730a3] text-white' : 'hover:bg-[#1f2937] hover:text-white'}`}
                    >
                        <i className="ti ti-scan text-[18px]"></i> Identify Aircraft
                    </button>
                    <button
                        onClick={() => setActiveView("database")}
                        className={`flex items-center gap-3 px-4 py-3 text-[14px] rounded-lg transition-colors ${activeView === "database" ? 'bg-[#3730a3] text-white' : 'hover:bg-[#1f2937] hover:text-white'}`}
                    >
                        <i className="ti ti-database text-[18px]"></i> Database
                    </button>
                </nav>

                <div className="p-[20px_16px] border-t border-white/5">
                    <Link href="/" className="flex items-center gap-3 px-4 py-3 text-[14px] rounded-lg text-[#ef4444] transition-colors hover:bg-red-500/10 hover:text-[#ef4444]">
                        <i className="ti ti-logout text-[18px]"></i> Logout
                    </Link>
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
                        <div className="flex items-center gap-3 cursor-pointer">
                            <div className="flex flex-col items-end">
                                <span className="text-[14px] font-medium">Dr. Jon Kabir</span>
                                <span className="text-[12px] text-[#6b7280]">Admin</span>
                            </div>
                            <img src="https://i.pravatar.cc/150?img=11" alt="Avatar" className="w-9 h-9 rounded-full" />
                            <i className="ti ti-chevron-down text-[#111827] text-[16px]"></i>
                        </div>
                    </div>
                </header>

                {/* Workspace */}
                <div className="flex-1 p-10 overflow-y-auto bg-[#f3f4f6]">

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
                                    <h2 className="text-[32px] font-semibold mb-2">26</h2>
                                    <p className="text-[12px] text-[#6b7280]">Total Overall Images Processed</p>
                                </div>

                                <div className="bg-white rounded-xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
                                    <div className="flex justify-between items-center text-[14px] text-[#111827] font-medium mb-4">
                                        <span>To Be Processed</span>
                                        <i className="ti ti-message-circle text-[#10b981] text-[18px]"></i>
                                    </div>
                                    <h2 className="text-[32px] font-semibold mb-2">132</h2>
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
                                        {/* Grid lines */}
                                        <div className="absolute inset-0 h-[calc(100%-24px)] flex flex-col justify-between z-0">
                                            {[1, 2, 3, 4, 5, 6].map((_, i) => (
                                                <div key={i} className="border-t border-black/5 h-0" />
                                            ))}
                                        </div>

                                        {/* Bars */}
                                        <div className="absolute inset-0 h-[calc(100%-24px)] flex justify-around items-end z-10 px-2.5">
                                            {[
                                                { label: 'Mon', h: '55%' },
                                                { label: 'Tue', h: '65%' },
                                                { label: 'Wed', h: '40%' },
                                                { label: 'Thu', h: '60%' },
                                                { label: 'Fri', h: '80%' },
                                                { label: 'Sat', h: '35%' },
                                                { label: 'Sun', h: '65%' }
                                            ].map((item) => (
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
                                    <button className="bg-[#3730a3] text-white border-none py-2.5 px-5 rounded-md text-[14px] font-medium cursor-pointer hover:bg-[#312e81] flex items-center gap-2">
                                        <i className="ti ti-upload"></i> Export File
                                    </button>
                                )}
                            </div>

                            {/* State 1: Upload */}
                            {identifyState === "upload" && (
                                <div className="animate-in fade-in duration-300">
                                    <div className="flex items-center justify-between bg-white rounded-xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.05)] mt-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-lg bg-[#3730a3] text-white flex items-center justify-center text-[24px]">
                                                <i className="ti ti-upload"></i>
                                            </div>
                                            <div>
                                                <div className="font-semibold text-[14px] text-[#111827]">Upload Image</div>
                                                <div className="text-[12px] text-[#6b7280]">Drop aircraft photos</div>
                                            </div>
                                        </div>
                                        <i className="ti ti-chevron-right text-[#6b7280] text-[20px]"></i>
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-lg bg-[#f3f4f6] text-[#111827] flex items-center justify-center text-[24px]">
                                                <i className="ti ti-scan"></i>
                                            </div>
                                            <div>
                                                <div className="font-semibold text-[14px] text-[#111827]">AI Detection</div>
                                                <div className="text-[12px] text-[#6b7280]">OCR & type ID</div>
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

                                    <div
                                        onClick={() => setIdentifyState("result")}
                                        className="border-2 border-dashed border-[#3730A3]/40 bg-white rounded-xl py-14 px-6 flex flex-col items-center text-center cursor-pointer transition-all hover:bg-[#fdfdff] hover:border-[#3730a3] mt-6"
                                    >
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

                            {/* State 2: Result */}
                            {identifyState === "result" && (
                                <div className="flex gap-6 mt-6 animate-in fade-in duration-300">
                                    {/* Queue Sidebar */}
                                    <div className="bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.05)] flex flex-col w-[320px] min-h-[500px]">
                                        <div className="p-[20px_24px] font-semibold text-[14px] border-b border-[#e5e7eb] flex items-center gap-2">
                                            <i className="ti ti-photo text-[#8b5cf6]"></i> Upload Queue
                                        </div>

                                        <div className="flex-1">
                                            {[
                                                { name: "Tramsata.jpg", status: "Completed", icon: "ti-circle-check", color: "text-[#10b981]", active: false },
                                                { name: "AirBusA30.jpg", status: "Completed", icon: "ti-circle-check", color: "text-[#10b981]", active: true },
                                                { name: "Navy 576.jpg", status: "Completed", icon: "ti-circle-check", color: "text-[#10b981]", active: false },
                                                { name: "Air Canada.jpg", status: "Processing", icon: "ti-loader", color: "text-[#8b5cf6]", active: false }
                                            ].map((item, idx) => (
                                                <div key={idx} className={`flex items-center px-6 py-4 gap-4 border-b border-[#e5e7eb] relative ${item.active ? 'bg-[#fcfcff]' : ''}`}>
                                                    <div className="w-12 h-12 rounded-md bg-[#e5e7eb] shrink-0" style={{ backgroundImage: "url('/logo/logo-aahs-3 1.png')", backgroundSize: "contain" }}></div>
                                                    <div className="flex-1">
                                                        <div className="font-medium text-[14px] mb-1">{item.name}</div>
                                                        <div className={`text-[12px] flex items-center gap-1 ${item.color}`}><i className={`ti ${item.icon}`}></i> {item.status}</div>
                                                    </div>
                                                    <i className="ti ti-x absolute right-6 top-1/2 -translate-y-1/2 text-[#6b7280] cursor-pointer"></i>
                                                </div>
                                            ))}
                                        </div>

                                        <button
                                            onClick={() => setIdentifyState("upload")}
                                            className="bg-[#3730a3] text-white p-4 w-full border-none m-0 rounded-b-xl hover:bg-[#312e81] font-medium"
                                        >
                                            Add More
                                        </button>
                                    </div>

                                    {/* Result Details */}
                                    <div className="flex-1 bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.05)] p-6">
                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="bg-[#f3f4f6] min-h-[300px] border-radius-8 bg-[url('/logo/logo-aahs-3 1.png')] bg-contain bg-center bg-no-repeat rounded-lg"></div>

                                            <div>
                                                <div className="inline-flex items-center gap-1.5 text-[#10b981] bg-[#10b981]/10 px-3 py-1.5 rounded-full text-[12px] font-medium">
                                                    <i className="ti ti-circle-check"></i> Identify Completed
                                                </div>
                                                <h2 className="text-[24px] font-semibold mt-4">Airbus A380</h2>

                                                <table className="w-full mt-4 text-[14px]">
                                                    <tbody>
                                                        {[
                                                            { label: "Image File Name :", val: "AirBusA30.jpg" },
                                                            { label: "Manufacturer :", val: "Boeing" },
                                                            { label: "Civil ID :", val: "N778UA" },
                                                            { label: "Common Name :", val: "Triple Seven" },
                                                            { label: "Confidence Factor :", val: "100%" },
                                                            { label: "Operator :", val: "United Airlines" },
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
                                            <p>Notes : Distinctive 6-wheel main landing gear bogies confirm it is a 777. The fuselage length with four main doors per side indicates the -200 variant. Fleet number '2378' is visible on the nose gear doors.</p>
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
                                        <input type="text" placeholder="Search Database..." className="pl-9 pr-3 py-2.5 border border-[#e5e7eb] rounded-md w-[280px] text-[14px] outline-none text-[#111827] focus:border-[#3730a3]" />
                                    </div>
                                    <button className="px-3 py-2 border border-[#e5e7eb] bg-white rounded-md flex items-center text-[#6b7280] text-[18px] cursor-pointer hover:bg-gray-50">
                                        <i className="ti ti-filter"></i>
                                    </button>
                                </div>
                                <button className="bg-[#3730a3] text-white border-none py-2.5 px-5 rounded-md text-[14px] font-medium cursor-pointer hover:bg-[#312e81] flex items-center gap-2">
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
                                        {[
                                            { f: "AAAA.jpg", reg: "N12345", a: "Cessna 172", s: "17263421", o: "SkyHigh Aviation", y: "2018" },
                                            { f: "BBBB.jpg", reg: "N67890", a: "Piper PA-28", s: "28-7625134", o: "Blue Horizon LLC", y: "2015" },
                                            { f: "CCCC.jpg", reg: "N11223", a: "Boeing 737-800", s: "40578", o: "United Airlines", y: "2020" },
                                            { f: "DDDD.jpg", reg: "N44556", a: "Cessna 182T", s: "18281672", o: "Aviation Academy Inc", y: "2012" },
                                            { f: "EEEE.jpg", reg: "N77889", a: "Cirrus SR22", s: "4521", o: "Private Owner", y: "2021" },
                                        ].map((row, idx) => (
                                            <tr key={idx} className="last:border-0">
                                                <td className="px-6 py-5 border-b border-[#e5e7eb] text-[14px] text-[#111827]">{row.f}</td>
                                                <td className="px-6 py-5 border-b border-[#e5e7eb] text-[14px] text-[#111827]">{row.reg}</td>
                                                <td className="px-6 py-5 border-b border-[#e5e7eb] text-[14px] text-[#111827]">{row.a}</td>
                                                <td className="px-6 py-5 border-b border-[#e5e7eb] text-[14px] text-[#111827]">{row.s}</td>
                                                <td className="px-6 py-5 border-b border-[#e5e7eb] text-[14px] text-[#111827]">{row.o}</td>
                                                <td className="px-6 py-5 border-b border-[#e5e7eb] text-[14px] text-[#111827]">{row.y}</td>
                                                <td className="px-6 py-5 border-b border-[#e5e7eb] text-[14px] text-[#111827]">
                                                    <button className="bg-transparent border-none text-[#6b7280] cursor-pointer text-[18px]"><i className="ti ti-dots-vertical"></i></button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                <div className="flex justify-between items-center px-6 py-4 bg-[#fdfdfd] border-t border-[#e5e7eb]">
                                    <span className="text-[13px] text-[#6b7280]">Showing 1 to 5 of 154 Images</span>
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

                </div>
            </main>
        </div>
    );
}
