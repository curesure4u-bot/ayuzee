import { z } from "zod";

export type ManufacturerApprovalStatus = "pending" | "approved" | "rejected";

export type DocumentType =
  | "registration_certificate"
  | "drug_license"
  | "gmp_certificate"
  | "gst_certificate"
  | "cancelled_cheque"
  | "fssai_certificate"
  | "manufacturing_license";

export type DocumentVerificationStatus = "pending" | "verified" | "issue_found";

export interface AdminNote {
  id: string;
  author_id: string;
  author_name?: string;
  text: string;
  created_at: string;
  tagged_admins?: string[];
}

export interface Manufacturer {
  id: string;
  user_id: string | null;
  company_name: string;
  logo_url: string | null;
  registration_number: string | null;
  gst_number: string | null;
  manufacturing_license_no: string | null;
  manufacturing_license_expiry: string | null;
  drug_license_no: string | null;
  gmp_certificate_url: string | null;
  who_gmp_certificate_url: string | null;
  fssai_license_no: string | null;
  fssai_certificate_url: string | null;
  registration_certificate_url: string | null;
  drug_license_url: string | null;
  gst_certificate_url: string | null;
  cancelled_cheque_url: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  contact_person_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  bank_account_holder: string | null;
  bank_account_number: string | null;
  bank_ifsc: string | null;
  bank_name: string | null;
  approval_status: ManufacturerApprovalStatus;
  approved_by: string | null;
  approved_at: string | null;
  rejection_reasons: string[] | null;
  rejection_comment: string | null;
  admin_notes: AdminNote[] | null;
  submitted_at: string;
  created_at: string;
  updated_at: string;
}

export interface ManufacturerVerificationLog {
  id: string;
  manufacturer_id: string;
  document_type: DocumentType | string;
  verified_by: string | null;
  status: DocumentVerificationStatus;
  comments: string | null;
  created_at: string;
}

export const REQUIRED_DOCUMENTS: { type: DocumentType; label: string; urlField: keyof Manufacturer }[] = [
  { type: "registration_certificate", label: "Registration Certificate", urlField: "registration_certificate_url" },
  { type: "drug_license", label: "Drug Manufacturing License", urlField: "drug_license_url" },
  { type: "gmp_certificate", label: "GMP Certificate", urlField: "gmp_certificate_url" },
  { type: "gst_certificate", label: "GST Certificate", urlField: "gst_certificate_url" },
  { type: "cancelled_cheque", label: "Cancelled Cheque / Bank Statement", urlField: "cancelled_cheque_url" },
];

export const REJECTION_REASONS = [
  "Invalid license",
  "Expired certificates",
  "Incomplete documents",
  "Suspicious details",
] as const;

export const manufacturerSchema = z.object({
  company_name: z.string().trim().min(2).max(200),
  registration_number: z.string().trim().max(100).optional().nullable(),
  gst_number: z.string().trim().max(50).optional().nullable(),
  manufacturing_license_no: z.string().trim().max(100).optional().nullable(),
  manufacturing_license_expiry: z.string().optional().nullable(),
  drug_license_no: z.string().trim().max(100).optional().nullable(),
  fssai_license_no: z.string().trim().max(100).optional().nullable(),
  contact_email: z.string().email().max(255).optional().nullable(),
  contact_phone: z.string().trim().max(20).optional().nullable(),
  pincode: z.string().trim().max(10).optional().nullable(),
});

export const rejectionSchema = z.object({
  reasons: z.array(z.string()).min(1, "Select at least one reason"),
  comment: z.string().trim().min(5, "Provide a detailed comment (min 5 chars)").max(2000),
});
