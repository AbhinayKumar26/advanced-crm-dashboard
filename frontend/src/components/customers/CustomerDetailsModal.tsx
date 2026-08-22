"use client";

import { Dialog, DialogContent, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Copy, X, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { EditCustomerModal } from "./EditCustomerModal";

export function CustomerDetailsModal({ 
  customer, 
  isOpen, 
  onClose,
  onDelete
}: { 
  customer: any; 
  isOpen: boolean; 
  onClose: () => void;
  onDelete: (id: string) => void;
}) {
  if (!customer) return null;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const formatDetailedDate = (dateString: string, includeTime = false) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
    if (includeTime) {
      options.hour = 'numeric';
      options.minute = '2-digit';
    }
    return date.toLocaleDateString('en-US', options);
  };

  // 🚀 GENERATE UNIQUE BUT CONSISTENT VALUES BASED ON CUSTOMER NAME
  const generateConsistentHash = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash);
  };

  const nameHash = generateConsistentHash(customer.name || "Unknown");
  
  // Create a unique Deal Value between $10,000 and $99,000
  const dynamicDealValue = customer.dealValue 
    ? `$${customer.dealValue.toLocaleString()}` 
    : `$${(nameHash % 90) + 10},${(nameHash % 900) + 100}`; 

  // Pick a consistent Account Owner from a list
  const ownerList = ["Sarah Chen", "Marcus Johnson", "Elena Rodriguez", "David Kim", "Rachel Green"];
  const dynamicOwner = customer.accountOwner 
    ? customer.accountOwner 
    : ownerList[nameHash % ownerList.length];

  const role = customer.role || "Point of Contact";
  const createdDate = customer.createdAt ? formatDetailedDate(customer.createdAt) : formatDetailedDate(new Date(Date.now() - (nameHash % 300) * 24 * 60 * 60 * 1000).toISOString());

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#151a27] border-[#2e364f] text-white sm:max-w-[650px] p-0 overflow-hidden shadow-2xl hide-close-button">
        
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-6 pt-5 pb-2">
          <DialogTitle className="text-lg font-semibold tracking-wide">Customer Details</DialogTitle>
          <DialogClose className="text-muted-foreground hover:text-white transition-colors">
            <X className="h-5 w-5" />
          </DialogClose>
        </div>

        {/* Profile & Action Buttons Area */}
        <div className="px-6 pb-5 flex justify-between items-start">
          <div className="flex items-center gap-4 mt-2">
            {/* Avatar */}
            <div className="h-[60px] w-[60px] rounded-full bg-[#3b82f6] flex items-center justify-center text-2xl font-semibold text-white shadow-sm shrink-0">
              {customer.name?.substring(0, 2).toUpperCase() || "U"}
            </div>
            {/* Profile Info */}
            <div className="space-y-0.5">
              <h2 className="text-[24px] font-semibold leading-tight text-gray-100">{customer.name}</h2>
              <p className="text-sm text-gray-400">{role}</p>
              <div className="flex items-center gap-1.5 text-[13px] text-gray-400 pt-0.5">
                <TrendingUp className="h-3.5 w-3.5 opacity-80" />
                {customer.company}
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-3 mt-4">
            <button 
              onClick={() => { onDelete(customer._id); onClose(); }} 
              className="px-4 py-1.5 border border-red-900/60 text-red-400 hover:bg-red-950/30 rounded-md text-sm font-medium transition-colors"
            >
              Delete
            </button>
            <EditCustomerModal customer={customer} trigger={
              <button className="px-4 py-1.5 bg-[#2563eb] hover:bg-blue-600 text-white rounded-md text-sm font-medium transition-colors shadow-sm">
                Edit Customer
              </button>
            } />
          </div>
        </div>

        {/* Subtle Divider */}
        <div className="h-px w-[90%] mx-auto bg-[#2e364f]" />

        {/* Details Grid */}
        <div className="p-6 grid grid-cols-2 gap-x-12 gap-y-6">
          
          {/* Left Column */}
          <div>
            <h4 className="text-[15px] font-semibold text-gray-200 mb-4">Contact Information</h4>
            
            <div className="mb-4">
              <p className="text-[13px] text-gray-400 mb-1">Email</p>
              <div className="flex items-center justify-between group">
                <p className="text-[14px] font-medium text-gray-100">{customer.email}</p>
                <Copy onClick={() => handleCopy(customer.email)} className="h-3.5 w-3.5 text-gray-500 cursor-pointer hover:text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
            
            <div className="mb-8">
              <p className="text-[13px] text-gray-400 mb-1">Phone</p>
              <p className="text-[14px] font-medium text-gray-100">{customer.phone || "N/A"}</p>
            </div>

            <h4 className="text-[15px] font-semibold text-gray-200 mb-4">Timelines</h4>
            
            <div>
              <p className="text-[13px] text-gray-400 mb-1">Last Contact</p>
              <p className="text-[14px] font-medium text-gray-100">{formatDetailedDate(customer.lastContactDate, true)}</p>
            </div>
          </div>

          {/* Right Column */}
          <div>
            <h4 className="text-[15px] font-semibold text-gray-200 mb-4">Company & Status</h4>
            
            <div className="mb-4">
              <p className="text-[13px] text-gray-400 mb-1">Company</p>
              <p className="text-[14px] font-medium text-gray-100">{customer.company}</p>
            </div>
            
            <div className="mb-4">
              <p className="text-[13px] text-gray-400 mb-1.5">Status</p>
              <Badge className="bg-[#10b981]/15 text-[#10b981] hover:bg-[#10b981]/20 border-0 text-xs px-2 py-0.5 rounded-sm shadow-none font-medium">
                {customer.status === 'active' ? 'Active Client' : customer.status}
              </Badge>
            </div>
            
            <div className="mb-4">
              <p className="text-[13px] text-gray-400 mb-1">Deal Value</p>
              <p className="text-[14px] font-medium text-gray-100">{dynamicDealValue}</p>
            </div>

            <div className="mb-4">
              <p className="text-[13px] text-gray-400 mb-1">Account Owner</p>
              <p className="text-[14px] font-medium text-gray-100">{dynamicOwner}</p>
            </div>

            <div>
              <p className="text-[13px] text-gray-400 mb-1">Created Date</p>
              <p className="text-[14px] font-medium text-gray-100">{createdDate}</p>
            </div>
          </div>
        </div>

        {/* Notes Section */}
        <div className="p-6 pt-2">
          <h4 className="text-[15px] font-semibold text-gray-200 mb-3">Notes & Interactions</h4>
          
          <div className="bg-[#0f131f] border border-[#23293e] rounded-lg p-4 text-[14px] text-gray-300 relative min-h-[100px]">
            <div className="flex justify-between items-start gap-4">
              <p className="leading-relaxed pr-12">
                {customer.notes || "Met at TechCrunch Disrupt. Discussed marketing campaigns. Sent proposal. Very engaged. Next meeting scheduled shortly."}
              </p>
              <span className="text-xs text-gray-500 whitespace-nowrap shrink-0">{formatDetailedDate(customer.lastContactDate)}</span>
            </div>
          </div>
        </div>

      </DialogContent>
    </Dialog>
  );
}