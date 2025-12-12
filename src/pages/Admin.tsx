import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import {
    getAllRegistrations,
    approveRegistration,
    rejectRegistration,
} from "@/services/api";
import { RegistrationData } from "@/types/registration";
import { useAuthStore } from "@/store/authStore";
import { Pagination } from "@/components/Pagination";
import { getArabicError } from "@/lib/utils";
import ieeeLogo from "@/assets/ieee-logo.png";
import {
    Search,
    Users,
    CheckCircle,
    XCircle,
    Clock,
    Eye,
    LogOut,
    Menu,
    X,
    QrCode,
    Filter,
    Loader2,
} from "lucide-react";

const Admin = () => {
    const navigate = useNavigate();
    const logout = useAuthStore((state) => state.logout);
    const [registrations, setRegistrations] = useState<RegistrationData[]>([]);
    const [filteredData, setFilteredData] = useState<RegistrationData[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [selectedReg, setSelectedReg] = useState<RegistrationData | null>(
        null
    );
    const [showDetailsDialog, setShowDetailsDialog] = useState(false);
    const [showRejectDialog, setShowRejectDialog] = useState(false);
    const [rejectionReason, setRejectionReason] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(25);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editedReg, setEditedReg] = useState<RegistrationData | null>(null);

    useEffect(() => {
        loadRegistrations();
    }, []);

    useEffect(() => {
        filterData();
    }, [registrations, searchTerm, statusFilter]);

    const normalizeStatus = (status?: string) => (status || "").toLowerCase();

    const loadRegistrations = async () => {
        try {
            setIsLoading(true);
            const data = await getAllRegistrations();
            // Normalize status casing once
            const normalized = data.map((reg) => ({
                ...reg,
                status: normalizeStatus(
                    reg.status
                ) as RegistrationData["status"],
            }));
            setRegistrations(normalized);
        } catch (error) {
            toast({
                title: "خطأ",
                description: getArabicError(error as Error),
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const filterData = () => {
        let filtered = [...registrations];

        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(
                (r) =>
                    r.fullNameArabic?.toLowerCase().includes(term) ||
                    r.fullNameEnglish?.toLowerCase().includes(term) ||
                    r.email?.toLowerCase().includes(term) ||
                    r.paymentCode?.toLowerCase().includes(term) ||
                    r.governorate?.toLowerCase().includes(term)
            );
        }

        if (statusFilter !== "all") {
            const desired = statusFilter.toLowerCase();
            filtered = filtered.filter(
                (r) => normalizeStatus(r.status) === desired
            );
        }

        setFilteredData(filtered);
    };

    const handleApprove = async (reg: RegistrationData) => {
        if (!reg.id) return;

        console.log("Attempting approve for:", { id: reg.id, name: reg.fullNameEnglish });

        // Optimistic update
        const previousRegistrations = [...registrations];
        setRegistrations((prev) =>
            prev.map((r) =>
                r.id === reg.id ? { ...r, status: "Approved" as const } : r
            )
        );
        setShowDetailsDialog(false);

        try {
            await approveRegistration(reg.id);

            // Backend will send approval email automatically

            toast({
                title: "تمت الموافقة!",
                description: `تمت الموافقة على ${reg.fullNameEnglish} وتم إرسال بريد إلكتروني`,
            });
            await loadRegistrations(); // Refresh to get latest data
        } catch (error) {
            console.error("Approve error:", error);
            // Revert optimistic update on error
            setRegistrations(previousRegistrations);
            toast({
                title: "خطأ",
                description: `فشل: ${error instanceof Error ? error.message : getArabicError(error as Error)}`,
                variant: "destructive",
            });
        }
    };

    const handleReject = async () => {
        if (!selectedReg?.id || !rejectionReason) return;

        // Optimistic update
        const previousRegistrations = [...registrations];
        setRegistrations((prev) =>
            prev.map((r) =>
                r.id === selectedReg.id
                    ? { ...r, status: "Rejected" as const, rejectionReason }
                    : r
            )
        );
        setShowRejectDialog(false);
        setShowDetailsDialog(false);
        setRejectionReason("");

        try {
            await rejectRegistration(selectedReg.id, rejectionReason);

            // Backend will send rejection email automatically

            toast({
                title: "تم الرفض",
                description: "تم رفض التسجيل وإرسال بريد إلكتروني للمتقدم",
                variant: "destructive",
            });
            await loadRegistrations(); // Refresh to get latest data
        } catch (error) {
            // Revert optimistic update on error
            setRegistrations(previousRegistrations);
            toast({
                title: "خطأ",
                description: getArabicError(error as Error),
                variant: "destructive",
            });
        }
    };

    const getStatusBadge = (status: string) => {
        const normalizedStatus = (status || "").toLowerCase();
        switch (normalizedStatus) {
            case "approved":
                return (
                    <Badge className="bg-success text-success-foreground">
                        <CheckCircle className="w-3 h-3 mr-1" /> Approved
                    </Badge>
                );
            case "rejected":
                return (
                    <Badge variant="destructive">
                        <XCircle className="w-3 h-3 mr-1" /> Rejected
                    </Badge>
                );
            default:
                return (
                    <Badge variant="secondary">
                        <Clock className="w-3 h-3 mr-1" /> Pending
                    </Badge>
                );
        }
    };

    const stats = {
        total: registrations.length,
        pending: registrations.filter(
            (r) => normalizeStatus(r.status) === "pending"
        ).length,
        approved: registrations.filter(
            (r) => normalizeStatus(r.status) === "approved"
        ).length,
        rejected: registrations.filter(
            (r) => normalizeStatus(r.status) === "rejected"
        ).length,
    };

    return (
        <div className="min-h-screen bg-background flex">
            {/* Sidebar */}
            <aside
                className={`${
                    sidebarOpen ? "translate-x-0" : "-translate-x-full"
                } md:translate-x-0 fixed md:sticky top-0 left-0 h-screen w-64 bg-sidebar text-sidebar-foreground transition-transform duration-300 ease-in-out z-40 md:z-auto flex flex-col`}
            >
                {/* Header */}
                <div className="p-6 border-b border-sidebar-border">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <img
                                src={ieeeLogo}
                                alt="IEEE"
                                className="h-8 w-auto"
                            />
                            <h2 className="text-xl font-bold">Admin Panel</h2>
                        </div>
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="md:hidden p-1 hover:bg-sidebar-accent rounded"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* Navigation - Scrollable */}
                <nav className="flex-1 overflow-y-auto p-4 space-y-2">
                    <button
                        onClick={() => navigate("/admin")}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-sidebar-accent transition-colors text-left"
                    >
                        <Users className="w-5 h-5" />
                        <span>Registrations</span>
                    </button>
                    <button
                        onClick={() => navigate("/checkin")}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-sidebar-accent transition-colors text-left"
                    >
                        <QrCode className="w-5 h-5" />
                        <span>Check-in Scanner</span>
                    </button>
                </nav>

                {/* Logout Button - Fixed at bottom */}
                <div className="p-4 border-t border-sidebar-border bg-sidebar">
                    <button
                        onClick={() => {
                            logout();
                            navigate("/login");
                        }}
                        className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg bg-red-500 hover:bg-red-600 transition-colors text-white font-medium"
                    >
                        <LogOut className="w-5 h-5" />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* Mobile overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-foreground/20 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Main content */}
            <main className="flex-1 min-h-screen">
                {/* Top bar */}
                <header className="sticky top-0 z-30 bg-card border-b px-4 py-3 flex items-center gap-3">
                    <button
                        className="lg:hidden p-2 hover:bg-sidebar-accent rounded-lg"
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        aria-label="Toggle sidebar">
                        {sidebarOpen ? (
                            <X className="w-5 h-5" />
                        ) : (
                            <Menu className="w-5 h-5" />
                        )}
                    </button>

                    {/* Mobile brand bar */}
                    <div className="flex items-center gap-2 lg:hidden">
                        <img src={ieeeLogo} alt="IEEE" className="h-7" />
                        <div className="flex flex-col leading-tight">
                            <span className="text-sm text-muted-foreground">
                                Admin Panel
                            </span>
                            <span className="text-lg font-semibold">
                                Registrations
                            </span>
                        </div>
                    </div>

                    {/* Desktop title */}
                    <h1 className="hidden lg:block text-xl font-bold">
                        Registrations
                    </h1>
                </header>

                <div className="p-4 md:p-6 space-y-6">
                    {/* Stats Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="card-elevated p-4">
                            <div className="text-sm text-muted-foreground">
                                Total
                            </div>
                            <div className="text-2xl font-bold">
                                {stats.total}
                            </div>
                        </div>
                        <div className="card-elevated p-4">
                            <div className="text-sm text-muted-foreground">
                                Pending
                            </div>
                            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-500">
                                {stats.pending}
                            </div>
                        </div>
                        <div className="card-elevated p-4">
                            <div className="text-sm text-muted-foreground">
                                Approved
                            </div>
                            <div className="text-2xl font-bold text-success">
                                {stats.approved}
                            </div>
                        </div>
                        <div className="card-elevated p-4">
                            <div className="text-sm text-muted-foreground">
                                Rejected
                            </div>
                            <div className="text-2xl font-bold text-destructive">
                                {stats.rejected}
                            </div>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="card-elevated p-4">
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search"
                                    value={searchTerm}
                                    onChange={(e) =>
                                        setSearchTerm(e.target.value)
                                    }
                                    className="pl-10"
                                />
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant={
                                        statusFilter === "all"
                                            ? "default"
                                            : "outline"
                                    }
                                    size="sm"
                                    onClick={() => setStatusFilter("all")}>
                                    All
                                </Button>
                                <Button
                                    variant={
                                        statusFilter === "pending"
                                            ? "default"
                                            : "outline"
                                    }
                                    size="sm"
                                    onClick={() => setStatusFilter("pending")}
                                    className={
                                        statusFilter === "pending"
                                            ? "bg-yellow-600 hover:bg-yellow-600/90 text-white"
                                            : ""
                                    }>
                                    Pending
                                </Button>
                                <Button
                                    variant={
                                        statusFilter === "approved"
                                            ? "default"
                                            : "outline"
                                    }
                                    size="sm"
                                    onClick={() => setStatusFilter("approved")}
                                    className={
                                        statusFilter === "approved"
                                            ? "bg-success hover:bg-success/90"
                                            : ""
                                    }>
                                    Approved
                                </Button>
                                <Button
                                    variant={
                                        statusFilter === "rejected"
                                            ? "destructive"
                                            : "outline"
                                    }
                                    size="sm"
                                    onClick={() => setStatusFilter("rejected")}>
                                    Rejected
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="card-elevated overflow-hidden">
                        {isLoading ? (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="w-8 h-8 animate-spin text-accent" />
                                <span className="mr-3 text-muted-foreground">
                                    جاري التحميل...
                                </span>
                            </div>
                        ) : (
                            <>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-muted/50">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                                                    Name
                                                </th>
                                                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground hidden md:table-cell">
                                                    Email
                                                </th>
                                                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground hidden lg:table-cell">
                                                    Faculty
                                                </th>
                                                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                                                    Status
                                                </th>
                                                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border">
                                            {filteredData.length === 0 ? (
                                                <tr>
                                                    <td
                                                        colSpan={5}
                                                        className="px-4 py-12 text-center text-muted-foreground">
                                                        {registrations.length ===
                                                        0
                                                            ? "No registrations yet"
                                                            : "No results found"}
                                                    </td>
                                                </tr>
                                            ) : (
                                                (() => {
                                                    // Calculate pagination
                                                    const startIndex =
                                                        (currentPage - 1) *
                                                        itemsPerPage;
                                                    const endIndex =
                                                        startIndex +
                                                        itemsPerPage;
                                                    const paginatedData =
                                                        filteredData.slice(
                                                            startIndex,
                                                            endIndex
                                                        );

                                                    return paginatedData.map(
                                                        (reg) => (
                                                            <tr
                                                                key={reg.id}
                                                                className="hover:bg-muted/30 transition-colors">
                                                                <td className="px-4 py-3">
                                                                    <div>
                                                                        <div className="font-medium">
                                                                            {
                                                                                reg.fullNameEnglish
                                                                            }
                                                                        </div>
                                                                        <div
                                                                            className="text-sm text-muted-foreground"
                                                                            dir="rtl">
                                                                            {
                                                                                reg.fullNameArabic
                                                                            }
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                                <td className="px-4 py-3 hidden md:table-cell text-sm">
                                                                    {reg.email}
                                                                </td>
                                                                <td className="px-4 py-3 hidden lg:table-cell text-sm">
                                                                    {
                                                                        reg.faculty
                                                                    }
                                                                </td>
                                                                <td className="px-4 py-3">
                                                                    {getStatusBadge(
                                                                        reg.status
                                                                    )}
                                                                </td>
                                                                <td className="px-4 py-3">
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        onClick={() => {
                                                                            setSelectedReg(
                                                                                reg
                                                                            );
                                                                            setShowDetailsDialog(
                                                                                true
                                                                            );
                                                                        }}>
                                                                        <Eye className="w-4 h-4 mr-1" />
                                                                        View
                                                                    </Button>
                                                                </td>
                                                            </tr>
                                                        )
                                                    );
                                                })()
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Pagination */}
                                {filteredData.length > 0 && (
                                    <Pagination
                                        currentPage={currentPage}
                                        totalPages={Math.ceil(
                                            filteredData.length / itemsPerPage
                                        )}
                                        totalItems={filteredData.length}
                                        itemsPerPage={itemsPerPage}
                                        onPageChange={setCurrentPage}
                                        onItemsPerPageChange={(newSize) => {
                                            setItemsPerPage(newSize);
                                            setCurrentPage(1); // Reset to first page when changing items per page
                                        }}
                                    />
                                )}
                            </>
                        )}
                    </div>
                </div>
            </main>

            {/* Details Dialog */}
            <Dialog
                open={showDetailsDialog}
                onOpenChange={setShowDetailsDialog}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Registration Details</DialogTitle>
                    </DialogHeader>
                    {selectedReg && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                                {/* Arabic Name - RTL */}
                                <div className="space-y-1">
                                    <label className="text-xs text-muted-foreground">
                                        الاسم بالعربي
                                    </label>
                                    <p className="font-medium text-right" dir="rtl">
                                        {selectedReg.fullNameArabic}
                                    </p>
                                </div>
                                
                                {/* English Name - LTR */}
                                <div className="space-y-1">
                                    <label className="text-xs text-muted-foreground">
                                        Full Name (English)
                                    </label>
                                    <p className="font-medium text-left" dir="ltr">
                                        {selectedReg.fullNameEnglish}
                                    </p>
                                </div>
                                
                                {/* Email - LTR, handle overflow */}
                                <div className="space-y-1">
                                    <label className="text-xs text-muted-foreground">
                                        Email
                                    </label>
                                    <p className="font-medium text-left break-all" dir="ltr">
                                        {selectedReg.email}
                                    </p>
                                </div>
                                
                                {/* Phone - LTR */}
                                <div className="space-y-1">
                                    <label className="text-xs text-muted-foreground">
                                        Phone
                                    </label>
                                    <p className="font-medium text-left" dir="ltr">
                                        {selectedReg.phone}
                                    </p>
                                </div>
                                
                                {/* National ID - LTR */}
                                <div className="space-y-1">
                                    <label className="text-xs text-muted-foreground">
                                        National ID
                                    </label>
                                    <p className="font-medium text-left" dir="ltr">
                                        {selectedReg.nationalId}
                                    </p>
                                </div>
                                
                                {/* Governorate - RTL */}
                                <div className="space-y-1">
                                    <label className="text-xs text-muted-foreground">
                                        المحافظة
                                    </label>
                                    <p className="font-medium text-right" dir="rtl">
                                        {selectedReg.governorate}
                                    </p>
                                </div>
                                
                                {/* Faculty - RTL */}
                                <div className="space-y-1">
                                    <label className="text-xs text-muted-foreground">
                                        الكلية
                                    </label>
                                    <p className="font-medium text-right" dir="rtl">
                                        {selectedReg.faculty}
                                    </p>
                                </div>
                                
                                {/* Academic Year - RTL */}
                                <div className="space-y-1">
                                    <label className="text-xs text-muted-foreground">
                                        السنة الدراسية
                                    </label>
                                    <p className="font-medium text-right" dir="rtl">
                                        {selectedReg.academicYear}
                                    </p>
                                </div>
                                
                                {/* Age - LTR */}
                                <div className="space-y-1">
                                    <label className="text-xs text-muted-foreground">
                                        Age
                                    </label>
                                    <p className="font-medium text-left" dir="ltr">
                                        {selectedReg.age}
                                    </p>
                                </div>
                                
                                {/* Gender - LTR */}
                                <div className="space-y-1">
                                    <label className="text-xs text-muted-foreground">
                                        Gender
                                    </label>
                                    <p className="font-medium text-left" dir="ltr">
                                        {selectedReg.gender === "male" ? "Male" : "Female"}
                                    </p>
                                </div>
                                
                                {/* Payment Code - LTR */}
                                <div className="space-y-1">
                                    <label className="text-xs text-muted-foreground">
                                        Payment Code
                                    </label>
                                    <p className="font-medium text-left font-mono" dir="ltr">
                                        {selectedReg.paymentCode}
                                    </p>
                                </div>
                                
                                {/* Status */}
                                <div className="space-y-1">
                                    <label className="text-xs text-muted-foreground">
                                        Status
                                    </label>
                                    <div>
                                        {getStatusBadge(selectedReg.status)}
                                    </div>
                                </div>
                            </div>

                            {/* Payment Screenshot */}
                            {selectedReg.paymentScreenshot && (
                                <div className="p-4 bg-muted rounded-lg">
                                    <p className="text-sm text-muted-foreground mb-2 font-medium">
                                        Payment Screenshot
                                    </p>
                                    <div className="relative group">
                                        <img
                                            src={
                                                typeof selectedReg.paymentScreenshot ===
                                                "string"
                                                    ? selectedReg.paymentScreenshot
                                                    : URL.createObjectURL(
                                                          selectedReg.paymentScreenshot
                                                      )
                                            }
                                            alt="Payment Receipt"
                                            className="w-full max-w-md mx-auto rounded-lg border-2 border-border shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                                            onClick={() => {
                                                const url =
                                                    typeof selectedReg.paymentScreenshot ===
                                                    "string"
                                                        ? selectedReg.paymentScreenshot
                                                        : URL.createObjectURL(
                                                              selectedReg.paymentScreenshot as File
                                                          );
                                                window.open(url, "_blank");
                                            }}
                                        />
                                        <p className="text-xs text-center text-muted-foreground mt-2">
                                            Click to view full size
                                        </p>
                                    </div>
                                </div>
                            )}

                            {(selectedReg.status || "").toLowerCase() === "approved" &&
                                selectedReg.qrCode && (
                                    <div className="text-center p-4 bg-muted rounded-lg">
                                        <p className="text-sm text-muted-foreground mb-2">
                                            QR Code
                                        </p>
                                        <img
                                            src={selectedReg.qrCode}
                                            alt="QR Code"
                                            className="w-48 h-48 mx-auto"
                                        />
                                    </div>
                                )}

                            {(selectedReg.status || "").toLowerCase() === "rejected" &&
                                selectedReg.rejectionReason && (
                                    <div className="p-4 bg-destructive/10 rounded-lg">
                                        <p className="text-sm text-destructive font-medium">
                                            Rejection Reason:
                                        </p>
                                        ```
                                        <p className="text-sm">
                                            {selectedReg.rejectionReason}
                                        </p>
                                    </div>
                                )}
                        </div>
                    )}
                    <DialogFooter className="flex-col sm:flex-row gap-2">
                        {/* Edit Mode Toggle */}
                        <Button
                            variant="outline"
                            onClick={() => {
                                if (isEditMode) {
                                    // Save changes (you can implement API call here)
                                    toast({
                                        title: "Saved",
                                        description:
                                            "Changes will be saved when edit API is connected",
                                    });
                                    setIsEditMode(false);
                                } else {
                                    setIsEditMode(true);
                                    setEditedReg(selectedReg);
                                }
                            }}>
                            {isEditMode ? "Save Changes" : "Edit Data"}
                        </Button>

                        {/* Status Management Buttons */}
                        {(selectedReg?.status || "").toLowerCase() === "pending" && (
                            <>
                                <Button
                                    variant="outline"
                                    onClick={() => setShowRejectDialog(true)}>
                                    <XCircle className="w-4 h-4 mr-2" />
                                    Reject
                                </Button>
                                <Button
                                    variant="default"
                                    className="bg-success hover:bg-success/90"
                                    onClick={() => handleApprove(selectedReg)}>
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Approve
                                </Button>
                            </>
                        )}

                        {/* Revert to Pending for Approved/Rejected */}
                        {((selectedReg?.status || "").toLowerCase() === "approved" ||
                            (selectedReg?.status || "").toLowerCase() === "rejected") && (
                            <Button
                                variant="outline"
                                onClick={async () => {
                                    if (!selectedReg?.id) return;

                                    // Optimistic update
                                    const previousRegistrations = [
                                        ...registrations,
                                    ];
                                    setRegistrations((prev) =>
                                        prev.map((r) =>
                                            r.id === selectedReg.id
                                                ? {
                                                      ...r,
                                                      status: "Pending" as const,
                                                  }
                                                : r
                                        )
                                    );

                                    try {
                                        // TODO: Add API endpoint for reverting status
                                        // await revertToPending(selectedReg.id);
                                        toast({
                                            title: "Reverted",
                                            description:
                                                "Status changed back to pending",
                                        });
                                        await loadRegistrations();
                                    } catch (error) {
                                        setRegistrations(previousRegistrations);
                                        toast({
                                            title: "Error",
                                            description: getArabicError(
                                                error as Error
                                            ),
                                            variant: "destructive",
                                        });
                                    }
                                }}>
                                <Clock className="w-4 h-4 mr-2" />
                                Revert to Pending
                            </Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Reject Dialog */}
            <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Reject Registration</DialogTitle>
                    </DialogHeader>
                    <div>
                        <label className="text-sm font-medium">
                            Reason for rejection
                        </label>
                        <Textarea
                            placeholder="Enter the reason for rejection..."
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            className="mt-2"
                        />
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setShowRejectDialog(false)}>
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleReject}
                            disabled={!rejectionReason}>
                            Confirm Rejection
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default Admin;
