import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { getRegistrations, approveRegistration, rejectRegistration } from '@/lib/registration';
import { RegistrationData } from '@/types/registration';
import ieeeLogo from '@/assets/ieee-logo.png';
import { 
  Search, Users, CheckCircle, XCircle, Clock, Eye, 
  LogOut, Menu, X, QrCode, Filter
} from 'lucide-react';

const Admin = () => {
  const navigate = useNavigate();
  const [registrations, setRegistrations] = useState<RegistrationData[]>([]);
  const [filteredData, setFilteredData] = useState<RegistrationData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedReg, setSelectedReg] = useState<RegistrationData | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    loadRegistrations();
  }, []);

  useEffect(() => {
    filterData();
  }, [registrations, searchTerm, statusFilter]);

  const loadRegistrations = () => {
    const data = getRegistrations();
    setRegistrations(data);
  };

  const filterData = () => {
    let filtered = [...registrations];
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(r => 
        r.fullNameArabic?.toLowerCase().includes(term) ||
        r.fullNameEnglish?.toLowerCase().includes(term) ||
        r.email?.toLowerCase().includes(term) ||
        r.paymentCode?.toLowerCase().includes(term) ||
        r.governorate?.toLowerCase().includes(term)
      );
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(r => r.status === statusFilter);
    }
    
    setFilteredData(filtered);
  };

  const handleApprove = (reg: RegistrationData) => {
    if (!reg.id) return;
    approveRegistration(reg.id);
    loadRegistrations();
    toast({
      title: "Approved!",
      description: `${reg.fullNameEnglish} has been approved and QR code generated.`,
    });
    setShowDetailsDialog(false);
  };

  const handleReject = () => {
    if (!selectedReg?.id || !rejectionReason) return;
    rejectRegistration(selectedReg.id, rejectionReason);
    loadRegistrations();
    toast({
      title: "Rejected",
      description: "The registration has been rejected.",
      variant: "destructive",
    });
    setShowRejectDialog(false);
    setShowDetailsDialog(false);
    setRejectionReason('');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-success text-success-foreground"><CheckCircle className="w-3 h-3 mr-1" /> Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" /> Rejected</Badge>;
      default:
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>;
    }
  };

  const stats = {
    total: registrations.length,
    pending: registrations.filter(r => r.status === 'pending').length,
    approved: registrations.filter(r => r.status === 'approved').length,
    rejected: registrations.filter(r => r.status === 'rejected').length,
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-sidebar transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:translate-x-0`}>
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-sidebar-border">
            <div className="flex items-center gap-3">
              <img src={ieeeLogo} alt="IEEE" className="h-8" />
              <span className="font-bold text-sidebar-foreground">Admin Panel</span>
            </div>
          </div>
          
          <nav className="flex-1 p-4 space-y-2">
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-sidebar-accent text-sidebar-accent-foreground">
              <Users className="w-5 h-5" />
              Registrations
            </button>
            <button 
              onClick={() => navigate('/checkin')}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
            >
              <QrCode className="w-5 h-5" />
              Check-in Scanner
            </button>
          </nav>
          
          <div className="p-4 border-t border-sidebar-border">
            <button 
              onClick={() => navigate('/')}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
            >
              <LogOut className="w-5 h-5" />
              Exit Admin
            </button>
          </div>
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
        <header className="sticky top-0 z-30 bg-card border-b px-4 py-3 flex items-center gap-4">
          <button 
            className="lg:hidden p-2 hover:bg-muted rounded-lg"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <h1 className="text-xl font-bold">Registrations</h1>
        </header>

        <div className="p-4 md:p-6 space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="card-elevated p-4">
              <div className="text-sm text-muted-foreground">Total</div>
              <div className="text-2xl font-bold">{stats.total}</div>
            </div>
            <div className="card-elevated p-4">
              <div className="text-sm text-muted-foreground">Pending</div>
              <div className="text-2xl font-bold text-secondary">{stats.pending}</div>
            </div>
            <div className="card-elevated p-4">
              <div className="text-sm text-muted-foreground">Approved</div>
              <div className="text-2xl font-bold text-success">{stats.approved}</div>
            </div>
            <div className="card-elevated p-4">
              <div className="text-sm text-muted-foreground">Rejected</div>
              <div className="text-2xl font-bold text-destructive">{stats.rejected}</div>
            </div>
          </div>

          {/* Filters */}
          <div className="card-elevated p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, governorate..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant={statusFilter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter('all')}
                >
                  All
                </Button>
                <Button
                  variant={statusFilter === 'pending' ? 'secondary' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter('pending')}
                >
                  Pending
                </Button>
                <Button
                  variant={statusFilter === 'approved' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter('approved')}
                  className={statusFilter === 'approved' ? 'bg-success hover:bg-success/90' : ''}
                >
                  Approved
                </Button>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="card-elevated overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Name</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground hidden md:table-cell">Email</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground hidden lg:table-cell">Faculty</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredData.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">
                        {registrations.length === 0 ? 'No registrations yet' : 'No results found'}
                      </td>
                    </tr>
                  ) : (
                    filteredData.map((reg) => (
                      <tr key={reg.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3">
                          <div>
                            <div className="font-medium">{reg.fullNameEnglish}</div>
                            <div className="text-sm text-muted-foreground" dir="rtl">{reg.fullNameArabic}</div>
                          </div>
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell text-sm">{reg.email}</td>
                        <td className="px-4 py-3 hidden lg:table-cell text-sm">{reg.faculty}</td>
                        <td className="px-4 py-3">{getStatusBadge(reg.status)}</td>
                        <td className="px-4 py-3">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedReg(reg);
                              setShowDetailsDialog(true);
                            }}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Registration Details</DialogTitle>
          </DialogHeader>
          {selectedReg && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground">Full Name (Arabic)</label>
                  <p className="font-medium" dir="rtl">{selectedReg.fullNameArabic}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Full Name (English)</label>
                  <p className="font-medium">{selectedReg.fullNameEnglish}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Email</label>
                  <p className="font-medium">{selectedReg.email}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Phone</label>
                  <p className="font-medium">{selectedReg.phone}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">National ID</label>
                  <p className="font-medium">{selectedReg.nationalId}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Governorate</label>
                  <p className="font-medium">{selectedReg.governorate}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Faculty</label>
                  <p className="font-medium">{selectedReg.faculty}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Academic Year</label>
                  <p className="font-medium">{selectedReg.academicYear}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Age</label>
                  <p className="font-medium">{selectedReg.age}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Gender</label>
                  <p className="font-medium">{selectedReg.gender === 'male' ? 'Male' : 'Female'}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Payment Code</label>
                  <p className="font-medium">{selectedReg.paymentCode}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Status</label>
                  <div>{getStatusBadge(selectedReg.status)}</div>
                </div>
              </div>

              {selectedReg.status === 'approved' && selectedReg.qrCode && (
                <div className="text-center p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">QR Code</p>
                  <img src={selectedReg.qrCode} alt="QR Code" className="w-48 h-48 mx-auto" />
                </div>
              )}

              {selectedReg.status === 'rejected' && selectedReg.rejectionReason && (
                <div className="p-4 bg-destructive/10 rounded-lg">
                  <p className="text-sm text-destructive font-medium">Rejection Reason:</p>
                  <p className="text-sm">{selectedReg.rejectionReason}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            {selectedReg?.status === 'pending' && (
              <>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowRejectDialog(true);
                  }}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Reject
                </Button>
                <Button
                  variant="gradient"
                  onClick={() => handleApprove(selectedReg)}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Approve
                </Button>
              </>
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
            <label className="text-sm font-medium">Reason for rejection</label>
            <Textarea
              placeholder="Enter the reason for rejection..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="mt-2"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleReject} disabled={!rejectionReason}>
              Confirm Rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Admin;
