"use client";

import { useState, useEffect, Suspense } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useSearchParams } from "next/navigation";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, ArrowUpDown, Trash2, Filter, X, Star, Download } from "lucide-react";
import { AddCustomerModal } from "@/components/customers/AddCustomerModal";
import { EditCustomerModal } from "@/components/customers/EditCustomerModal";
import { CustomerDetailsModal } from "@/components/customers/CustomerDetailsModal";
import { toast } from "sonner";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

// Pre-defined options for the UI
const STATUS_OPTIONS = ["active", "prospect", "lead", "inactive", "archive"];
const COMPANY_OPTIONS = ["Acme Corp", "Innovatech", "Globex", "Stark Industries", "Wayne Enterprises"];

function CustomersContent() {
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  // 🚀 Read status from URL to initially filter the table
  const urlStatus = searchParams.get("status");
  const initialStatuses = urlStatus ? [urlStatus] : [];

  // Core State
  const [page, setPage] = useState(1);
  const limit = 10;
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");

  // Selected Customer State for Details Modal
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null); 

  // ADVANCED FILTER STATE
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [activeFilterCount, setActiveFilterCount] = useState(0);

  // DRAG & DROP STATE
  const [isMounted, setIsMounted] = useState(false);
  const [savedFilters, setSavedFilters] = useState([
    { id: "filter-1", name: "Active Customers", special: false },
    { id: "filter-2", name: "Recent Contacts", special: false },
    { id: "filter-3", name: "Inactive Leads", special: false },
    { id: "filter-4", name: "High-value prospects", special: true },
  ]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const onDragEnd = (result: any) => {
    if (!result.destination) return;
    const items = Array.from(savedFilters);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setSavedFilters(items);
  };

  // Draft filters (what the user is currently selecting in the panel)
  const [draftFilters, setDraftFilters] = useState({
    statuses: initialStatuses,
    companies: [] as string[],
    dateFrom: "",
    dateTo: "",
    phone: "",
    email: ""
  });

  // Applied filters (what actually gets sent to the API)
  const [appliedFilters, setAppliedFilters] = useState({
    statuses: initialStatuses,
    companies: [] as string[],
    dateFrom: "",
    dateTo: "",
    phone: "",
    email: ""
  });

  // 🚀 Update filters dynamically if the URL changes (e.g. clicking a dashboard card)
  useEffect(() => {
    const currentUrlStatus = searchParams.get("status");
    if (currentUrlStatus) {
      setAppliedFilters(prev => ({ ...prev, statuses: [currentUrlStatus] }));
      setDraftFilters(prev => ({ ...prev, statuses: [currentUrlStatus] }));
      setPage(1);
    }
  }, [searchParams]);

  useEffect(() => {
    const timer = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  // Calculate active filter count whenever appliedFilters change
  useEffect(() => {
    let count = 0;
    if (appliedFilters.statuses.length > 0) count++;
    if (appliedFilters.companies.length > 0) count++;
    if (appliedFilters.dateFrom || appliedFilters.dateTo) count++;
    if (appliedFilters.phone) count++;
    if (appliedFilters.email) count++;
    setActiveFilterCount(count);
  }, [appliedFilters]);

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field); setSortOrder("asc");
    }
    setPage(1);
  };

  const handleApplyFilters = () => {
    setAppliedFilters(draftFilters);
    setPage(1);
    setIsFilterPanelOpen(false);
    toast.success("Filters applied successfully");
  };

  const handleClearFilters = () => {
    const emptyFilters = { statuses: [], companies: [], dateFrom: "", dateTo: "", phone: "", email: "" };
    setDraftFilters(emptyFilters);
    setAppliedFilters(emptyFilters);
    setPage(1);
  };

  // Pre-built Filter Templates
  const applySavedFilter = (template: string) => {
    let newFilters = { statuses: [], companies: [], dateFrom: "", dateTo: "", phone: "", email: "" };

    if (template === "Active Customers") {
      newFilters.statuses = ["active"];
    } else if (template === "Recent Contacts") {
      const today = new Date();
      const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      newFilters.dateFrom = lastWeek.toISOString().split('T')[0];
    } else if (template === "Inactive Leads") {
      newFilters.statuses = ["lead", "inactive"];
    } else if (template === "High-value prospects") {
      newFilters.statuses = ["prospect"];
      newFilters.companies = ["Acme Corp", "Wayne Enterprises"];
    }

    setDraftFilters(newFilters);
    setAppliedFilters(newFilters);
    setIsFilterPanelOpen(false);
    toast.success(`${template} filter applied`);
  };

  const toggleDraftStatus = (status: string) => {
    setDraftFilters(prev => ({
      ...prev,
      statuses: prev.statuses.includes(status) 
        ? prev.statuses.filter(s => s !== status)
        : [...prev.statuses, status]
    }));
  };

  const toggleDraftCompany = (company: string) => {
    setDraftFilters(prev => ({
      ...prev,
      companies: prev.companies.includes(company)
        ? prev.companies.filter(c => c !== company)
        : [...prev.companies, company]
    }));
  };

  // Fetch data
  const { data: responsePayload, isLoading } = useQuery({
    queryKey: ["customers", page, limit, debouncedSearch, appliedFilters, sortBy, sortOrder],
    queryFn: async () => {
      let url = `/customers?page=${page}&limit=${limit}&sortBy=${sortBy}&sortOrder=${sortOrder}`;
      if (debouncedSearch) url += `&search=${debouncedSearch}`;
      if (appliedFilters.statuses.length > 0) url += `&statuses=${appliedFilters.statuses.join(',')}`;
      if (appliedFilters.companies.length > 0) url += `&companies=${appliedFilters.companies.join(',')}`;
      if (appliedFilters.dateFrom) url += `&dateFrom=${appliedFilters.dateFrom}`;
      if (appliedFilters.dateTo) url += `&dateTo=${appliedFilters.dateTo}`;
      if (appliedFilters.phone) url += `&phone=${appliedFilters.phone}`;
      if (appliedFilters.email) url += `&email=${appliedFilters.email}`;

      const response = await api.get(url);
      return response.data; 
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => { await api.delete(`/customers/${id}`); },
    onSuccess: () => { toast.success("Customer deleted"); queryClient.invalidateQueries({ queryKey: ["customers"] }); },
  });

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this customer?")) {
      deleteMutation.mutate(id);
    }
  };

  const customersList = responsePayload?.data || [];
  const totalPages = responsePayload?.totalPages || responsePayload?.pagination?.totalPages || 1;
  const totalItems = responsePayload?.total || responsePayload?.pagination?.total || (totalPages * limit);
  const startItem = Math.min((page - 1) * limit + 1, totalItems || 1);
  const endItem = Math.min(page * limit, totalItems || 0);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'bg-[#10B981]/10 text-[#10B981] border-[#10B981]/20';
      case 'lead': return 'bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20';
      case 'prospect': return 'bg-[#6366F1]/10 text-[#6366F1] border-[#6366F1]/20';
      case 'archive': return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // CSV EXPORT FUNCTION
  const handleExportCSV = () => {
    if (customersList.length === 0) {
      toast.error("No data to export!");
      return;
    }

    const headers = ["Name", "Email", "Phone", "Company", "Status", "Last Contact"];
    const csvData = customersList.map((c: any) => [
      `"${c.name}"`, 
      `"${c.email}"`, 
      `"${c.phone || 'N/A'}"`, 
      `"${c.company}"`, 
      `"${c.status}"`, 
      `"${formatDate(c.lastContactDate)}"`
    ]);

    const csvContent = [headers.join(","), ...csvData.map(row => row.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `customers_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success("CSV Exported successfully!");
  };

  return (
    <div className="space-y-4">

      {/* HEADER & MAIN CONTROLS */}
      <div className="flex flex-col lg:flex-row items-end justify-end gap-4 w-full">
        {/* Note: Removed the redundant 'Customers' h2 tag here to fix the double heading issue! */}
        
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          <div className="relative w-full sm:w-[300px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search customers..." 
              className="pl-9 bg-[#1a1f2e] border-[#2e364f] text-sm h-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <button 
            onClick={() => setIsFilterPanelOpen(true)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md border text-sm transition-colors h-10 ${
              activeFilterCount > 0 
                ? 'bg-primary/10 border-primary/50 text-primary' 
                : 'bg-[#1a1f2e] border-[#2e364f] text-muted-foreground hover:bg-[#2e364f]'
            }`}
          >
            <Filter className="h-4 w-4" />
            Filters
            {activeFilterCount > 0 && (
              <span className="flex items-center justify-center bg-primary text-white text-[10px] font-bold h-5 w-5 rounded-full ml-1">
                {activeFilterCount}
              </span>
            )}
          </button>

          <button 
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2 rounded-md border border-[#2e364f] bg-[#1a1f2e] text-muted-foreground hover:bg-[#2e364f] hover:text-white transition-colors text-sm h-10"
          >
            <Download className="h-4 w-4"/>
            Export
          </button>

          <AddCustomerModal />
        </div>
      </div>

      {/* DESKTOP DATA TABLE */}
      <div className="hidden md:block rounded-xl border border-[#2e364f] bg-[#131825] overflow-hidden shadow-lg mt-4">
        <div className="overflow-x-auto">
          <Table className="min-w-[900px]">
            <TableHeader className="bg-[#1a1f2e]/50 border-b border-[#2e364f]">
              <TableRow className="hover:bg-transparent border-none">
                <TableHead onClick={() => handleSort("name")} className="cursor-pointer hover:text-white transition-colors py-4">
                  <div className="flex items-center gap-2">Name <ArrowUpDown className="h-3 w-3 opacity-50" /></div>
                </TableHead>
                <TableHead onClick={() => handleSort("email")} className="cursor-pointer hover:text-white transition-colors">
                  <div className="flex items-center gap-2">Email <ArrowUpDown className="h-3 w-3 opacity-50" /></div>
                </TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Status</TableHead>
                <TableHead onClick={() => handleSort("lastContactDate")} className="cursor-pointer hover:text-white transition-colors">
                  <div className="flex items-center gap-2">Last Contact <ArrowUpDown className="h-3 w-3 opacity-50" /></div>
                </TableHead>
                <TableHead className="w-[80px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={7} className="h-32 text-center text-muted-foreground animate-pulse">Loading customers...</TableCell></TableRow>
              ) : customersList.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="h-32 text-center text-muted-foreground">No customers found.</TableCell></TableRow>
              ) : (
                customersList.map((customer: any) => (
                  <TableRow key={customer._id} className="border-b border-[#2e364f]/50 hover:bg-[#1a1f2e]/50 transition-colors">
                    <TableCell className="font-medium py-3">
                      <div 
                        className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => setSelectedCustomer(customer)}
                      >
                        <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold text-white shrink-0 shadow-sm">
                          {customer.name?.charAt(0).toUpperCase() || "U"}
                        </div>
                        <span className="hover:underline">{customer.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{customer.email}</TableCell>
                    <TableCell className="text-muted-foreground">{customer.phone || "N/A"}</TableCell>
                    <TableCell className="text-muted-foreground">{customer.company}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`capitalize px-2.5 py-0.5 rounded-full ${getStatusColor(customer.status)}`}>
                        {customer.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{formatDate(customer.lastContactDate)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-3 text-muted-foreground">
                        <EditCustomerModal customer={customer} />
                        <button onClick={() => handleDelete(customer._id)} className="hover:text-destructive transition-colors p-1">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* MOBILE CARD LAYOUT */}
      <div className="grid grid-cols-1 gap-4 md:hidden mt-4">
        {customersList.map((customer: any) => (
          <div key={customer._id} className="p-5 rounded-xl border border-[#2e364f] bg-[#131825] space-y-4 relative">
            <div className="flex justify-between items-start gap-2">
              <div 
                className="flex items-center gap-3 cursor-pointer"
                onClick={() => setSelectedCustomer(customer)}
              >
                <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center font-bold text-white shrink-0 shadow-sm">
                  {customer.name?.charAt(0).toUpperCase() || "U"}
                </div>
                <div>
                  <p className="font-semibold text-lg text-white leading-tight hover:underline">{customer.name}</p>
                  <p className="text-sm text-muted-foreground mt-0.5">{customer.email}</p>
                </div>
              </div>
            </div>
            <div className="pt-3 border-t border-[#2e364f] grid grid-cols-2 gap-y-3 text-sm">
              <div><p className="text-xs text-muted-foreground mb-0.5">Company</p><p className="font-medium text-white">{customer.company}</p></div>
              <div><p className="text-xs text-muted-foreground mb-0.5">Status</p><Badge variant="outline" className={`capitalize ${getStatusColor(customer.status)}`}>{customer.status}</Badge></div>
              <div className="col-span-2 flex justify-between items-end">
                <div><p className="text-xs text-muted-foreground mb-0.5">Last Contact</p><p className="font-medium text-white">{formatDate(customer.lastContactDate)}</p></div>
                <div className="flex gap-3 text-muted-foreground">
                  <EditCustomerModal customer={customer} />
                  <Trash2 className="h-4 w-4 hover:text-destructive" onClick={() => handleDelete(customer._id)} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* PAGINATION */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-2">
        <p className="text-sm text-muted-foreground">Showing {startItem} to {endItem} of {totalItems} entries</p>
        <div className="flex items-center gap-1.5">
          <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1.5 rounded-md border border-[#2e364f] bg-[#1a1f2e] hover:bg-secondary disabled:opacity-50 text-sm transition-colors text-muted-foreground hover:text-white">Previous</button>
          <button onClick={() => setPage(1)} className={`px-3.5 py-1.5 rounded-md text-sm transition-colors ${page === 1 ? 'bg-primary text-primary-foreground font-medium' : 'border border-[#2e364f] bg-[#1a1f2e] hover:bg-secondary text-muted-foreground'}`}>1</button>
          {totalPages >= 2 && <button onClick={() => setPage(2)} className={`px-3.5 py-1.5 rounded-md text-sm transition-colors ${page === 2 ? 'bg-primary text-primary-foreground font-medium' : 'border border-[#2e364f] bg-[#1a1f2e] hover:bg-secondary text-muted-foreground'}`}>2</button>}
          {totalPages >= 3 && <button onClick={() => setPage(3)} className={`px-3.5 py-1.5 rounded-md text-sm transition-colors ${page === 3 ? 'bg-primary text-primary-foreground font-medium' : 'border border-[#2e364f] bg-[#1a1f2e] hover:bg-secondary text-muted-foreground'}`}>3</button>}
          {totalPages > 4 && <span className="px-2 py-1.5 text-muted-foreground text-sm">...</span>}
          {totalPages > 3 && <button onClick={() => setPage(totalPages)} className={`px-3.5 py-1.5 rounded-md text-sm transition-colors ${page === totalPages ? 'bg-primary text-primary-foreground font-medium' : 'border border-[#2e364f] bg-[#1a1f2e] hover:bg-secondary text-muted-foreground'}`}>{totalPages}</button>}
          <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="px-3 py-1.5 rounded-md border border-[#2e364f] bg-[#1a1f2e] hover:bg-secondary disabled:opacity-50 text-sm transition-colors text-muted-foreground hover:text-white">Next</button>
        </div>
      </div>

      {/* 🚀 ADVANCED SLIDE-OUT FILTER PANEL */}
      {isFilterPanelOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setIsFilterPanelOpen(false)}></div>

          {/* Panel */}
          <div className="relative w-[380px] h-full bg-[#131825] border-l border-[#2e364f] shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">

            <div className="flex items-center justify-between p-6 border-b border-[#2e364f]">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Filter className="h-5 w-5" /> Filters
              </h3>
              <button onClick={() => setIsFilterPanelOpen(false)} className="text-muted-foreground hover:text-white transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8">

              <button onClick={() => toast.info("Save Custom Filter coming soon!")} className="w-full py-2 rounded-md border border-primary/50 text-primary hover:bg-primary/10 transition-colors text-sm font-medium">
                Save Filter
              </button>


              {/* Status Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-white">Status</h4>
                  <button onClick={handleClearFilters} className="text-xs text-muted-foreground hover:text-white">Clear All</button>
                </div>
                <div className="space-y-2">
                  {STATUS_OPTIONS.map(status => (
                    <label 
                      key={status} 
                      className="flex items-center gap-3 cursor-pointer group"
                      onClick={(e) => {
                        e.preventDefault(); 
                        toggleDraftStatus(status);
                      }}
                    >
                      <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${draftFilters.statuses.includes(status) ? 'bg-primary border-primary' : 'border-[#2e364f] group-hover:border-primary/50'}`}>
                        {draftFilters.statuses.includes(status) && <span className="w-2 h-2 bg-white rounded-sm"></span>}
                      </div>
                      <span className="text-sm text-muted-foreground group-hover:text-gray-300 capitalize">{status} Customer</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Company Section */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-white">Company</h4>
                <div className="flex flex-wrap gap-2 p-3 bg-[#1a1f2e] border border-[#2e364f] rounded-md min-h-[50px]">
                  {draftFilters.companies.map(company => (
                    <span key={company} onClick={() => toggleDraftCompany(company)} className="bg-primary/20 text-primary text-xs px-2 py-1 rounded-md cursor-pointer hover:bg-destructive/20 hover:text-destructive transition-colors flex items-center gap-1">
                      {company} <X className="h-3 w-3" />
                    </span>
                  ))}
                  <div className="relative w-full mt-1">
                    <select 
                      onChange={(e) => { if(e.target.value) toggleDraftCompany(e.target.value); e.target.value = ''; }}
                      className="w-full bg-transparent text-sm text-muted-foreground outline-none appearance-none cursor-pointer"
                    >
                      <option value="">Add company...</option>
                      {COMPANY_OPTIONS.filter(c => !draftFilters.companies.includes(c)).map(c => (
                        <option key={c} value={c} className="bg-[#1a1f2e] text-white">{c}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Date Range Section */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-white">Date Range (Last Contact)</h4>
                <div className="flex items-center gap-2">
                  <div className="flex-1 space-y-1">
                    <span className="text-xs text-muted-foreground">From</span>
                    <input type="date" value={draftFilters.dateFrom} onChange={(e) => setDraftFilters({...draftFilters, dateFrom: e.target.value})} className="w-full bg-[#1a1f2e] border border-[#2e364f] rounded-md p-2 text-sm text-white color-scheme-dark focus:outline-none focus:border-primary" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <span className="text-xs text-muted-foreground">To</span>
                    <input type="date" value={draftFilters.dateTo} onChange={(e) => setDraftFilters({...draftFilters, dateTo: e.target.value})} className="w-full bg-[#1a1f2e] border border-[#2e364f] rounded-md p-2 text-sm text-white color-scheme-dark focus:outline-none focus:border-primary" />
                  </div>
                </div>
              </div>

              {/* Phone Section */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-white">Phone Number</h4>
                <Input value={draftFilters.phone} onChange={(e) => setDraftFilters({...draftFilters, phone: e.target.value})} placeholder="Q (555) 123-4567" className="bg-[#1a1f2e] border-[#2e364f]" />
              </div>

              {/* Email Section */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-white">Email Contains</h4>
                <Input value={draftFilters.email} onChange={(e) => setDraftFilters({...draftFilters, email: e.target.value})} placeholder="@ e.g., @gmail.com" className="bg-[#1a1f2e] border-[#2e364f]" />
              </div>

              <button onClick={handleApplyFilters} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2.5 rounded-md transition-colors">
                Apply Filters
              </button>

              {/* Saved Filters Templates (NOW DRAGGABLE!) */}
              <div className="pt-6 border-t border-[#2e364f] space-y-3 pb-8">
                <h4 className="text-sm font-medium text-white">Saved Filters (Drag to reorder)</h4>
                
                {isMounted && (
                  <DragDropContext onDragEnd={onDragEnd}>
                    <Droppable droppableId="saved-filters-list">
                      {(provided) => (
                        <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-1">
                          
                          {savedFilters.map((filter, index) => (
                            <Draggable key={filter.id} draggableId={filter.id} index={index}>
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className={`rounded-md transition-colors ${snapshot.isDragging ? "opacity-70 scale-105 shadow-xl" : ""}`}
                                >
                                  <button 
                                    onClick={() => applySavedFilter(filter.name)} 
                                    className="w-full flex items-center justify-between px-3 py-2 rounded-md text-sm text-muted-foreground hover:bg-[#1a1f2e] hover:text-white transition-colors group cursor-grab active:cursor-grabbing border border-transparent hover:border-[#2e364f]"
                                  >
                                    <div className="flex items-center gap-2">
                                      {/* Small grab handle icon (6 dots) */}
                                      <div className="flex flex-col gap-[2px] opacity-30 group-hover:opacity-100">
                                        <div className="flex gap-[2px]"><div className="w-1 h-1 bg-current rounded-full"/><div className="w-1 h-1 bg-current rounded-full"/></div>
                                        <div className="flex gap-[2px]"><div className="w-1 h-1 bg-current rounded-full"/><div className="w-1 h-1 bg-current rounded-full"/></div>
                                        <div className="flex gap-[2px]"><div className="w-1 h-1 bg-current rounded-full"/><div className="w-1 h-1 bg-current rounded-full"/></div>
                                      </div>
                                      {filter.name}
                                    </div>
                                    {filter.special && <Star className="h-4 w-4 opacity-50 group-hover:opacity-100 group-hover:text-yellow-500" />}
                                  </button>
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                          
                        </div>
                      )}
                    </Droppable>
                  </DragDropContext>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 🚀 DETAILS MODAL */}
      <CustomerDetailsModal 
        isOpen={!!selectedCustomer} 
        onClose={() => setSelectedCustomer(null)} 
        customer={selectedCustomer} 
        onDelete={handleDelete}
      />

    </div>
  );
}

export default function CustomersPage() {
  return (
    <Suspense fallback={<div className="p-6 text-muted-foreground animate-pulse">Loading table...</div>}>
      <CustomersContent />
    </Suspense>
  );
}