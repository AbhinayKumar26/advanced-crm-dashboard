"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

// 🚀 1. Define Zod Validation Schema
const customerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Please enter a valid email address."),
  phone: z.string().min(10, "Phone number is required."),
  company: z.string().min(1, "Company is required."),
  status: z.string(),
  lastContactDate: z.string().min(1, "Date is required."),
  notes: z.string().optional(),
});

type CustomerFormValues = z.infer<typeof customerSchema>;

export function AddCustomerModal() {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();

  // 🚀 2. Initialize React Hook Form
  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      status: "lead",
      lastContactDate: new Date().toISOString().split('T')[0],
      notes: ""
    }
  });

  // 🚀 3. TanStack Query Mutation
  const mutation = useMutation({
    mutationFn: async (data: CustomerFormValues) => {
      const response = await api.post("/customers", data);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Customer added successfully!");
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      setIsOpen(false);
      reset(); // Clear form
    },
    onError: () => {
      toast.error("Failed to add customer.");
    },
  });

  const onSubmit = (data: CustomerFormValues) => {
    mutation.mutate(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium text-sm transition-colors">
        Add Customer
      </DialogTrigger>
      <DialogContent className="bg-[#1a1f2e] border-[#2e364f] text-white sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Customer</DialogTitle>
        </DialogHeader>

        {/* 🚀 4. Use form submission */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
          
          <div className="space-y-1">
            <Label htmlFor="name">Name <span className="text-xs text-muted-foreground">*required</span></Label>
            <Input id="name" {...register("name")} className={`bg-[#131825] border-[#2e364f] ${errors.name ? "border-red-500" : ""}`} />
            {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
          </div>

          <div className="space-y-1">
            <Label htmlFor="email">Email <span className="text-xs text-muted-foreground">*required</span></Label>
            <Input id="email" type="email" {...register("email")} className={`bg-[#131825] border-[#2e364f] ${errors.email ? "border-red-500" : ""}`} />
            {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="phone">Phone *</Label>
              <Input id="phone" {...register("phone")} className={`bg-[#131825] border-[#2e364f] ${errors.phone ? "border-red-500" : ""}`} />
              {errors.phone && <p className="text-xs text-red-500">{errors.phone.message}</p>}
            </div>
            <div className="space-y-1">
              <Label htmlFor="company">Company</Label>
              <Input id="company" {...register("company")} className={`bg-[#131825] border-[#2e364f] ${errors.company ? "border-red-500" : ""}`} />
              {errors.company && <p className="text-xs text-red-500">{errors.company.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>Status</Label>
              <Select value={watch("status")} onValueChange={(val) => setValue("status", val)}>
                <SelectTrigger className="bg-[#131825] border-[#2e364f]">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active Customer</SelectItem>
                  <SelectItem value="lead">Lead</SelectItem>
                  <SelectItem value="prospect">Prospect</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Last Contact Date</Label>
              <Input type="date" {...register("lastContactDate")} className="bg-[#131825] border-[#2e364f] color-scheme-dark" />
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="notes">Notes</Label>
            <Textarea 
              id="notes" 
              {...register("notes")} 
              placeholder="Meeting notes and follow-up items..." 
              className="bg-[#131825] border-[#2e364f] resize-none h-20" 
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[#2e364f]">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)} className="border-[#2e364f] text-black hover:bg-secondary">
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending} className="bg-blue-600 hover:bg-blue-700">
              {mutation.isPending ? "Adding..." : "Add Customer"}
            </Button>
          </div>
        </form>

      </DialogContent>
    </Dialog>
  );
}