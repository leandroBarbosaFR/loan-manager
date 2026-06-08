import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Customer, CustomerDocument } from "@/types/database";
import type { CustomerInput } from "@/lib/validations";

const DOCUMENTS_BUCKET = "customer-documents";

export async function listCustomers(search?: string): Promise<Customer[]> {
  const supabase = await createClient();
  let query = supabase.from("customers").select("*").order("name");

  if (search && search.trim().length > 0) {
    query = query.ilike("name", `%${search.trim()}%`);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function getCustomer(id: string): Promise<Customer | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("customers")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function createCustomer(input: CustomerInput): Promise<Customer> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("customers")
    .insert(input)
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function updateCustomer(
  id: string,
  input: CustomerInput,
): Promise<Customer> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("customers")
    .update(input)
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function deleteCustomer(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("customers").delete().eq("id", id);
  if (error) throw error;
}

// ---------------------------------------------------------------------------
// Documents (proof of address & other uploads)
// ---------------------------------------------------------------------------

/** Uploads PDF files for a customer and records them. Ignores empty inputs. */
export async function addCustomerDocuments(
  customerId: string,
  files: File[],
): Promise<void> {
  const valid = files.filter((f) => f && f.size > 0);
  if (valid.length === 0) return;

  const supabase = await createClient();

  for (const file of valid) {
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const path = `${customerId}/${crypto.randomUUID()}-${safeName}`;

    const { error: uploadError } = await supabase.storage
      .from(DOCUMENTS_BUCKET)
      .upload(path, file, {
        contentType: file.type || "application/pdf",
        upsert: false,
      });
    if (uploadError) throw uploadError;

    const { error: insertError } = await supabase
      .from("customer_documents")
      .insert({ customer_id: customerId, name: file.name, path });
    if (insertError) throw insertError;
  }
}

export async function listCustomerDocuments(
  customerId: string,
): Promise<CustomerDocument[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("customer_documents")
    .select("*")
    .eq("customer_id", customerId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

/** Time-limited URL to view/download a private document. */
export async function getDocumentUrl(path: string): Promise<string | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.storage
    .from(DOCUMENTS_BUCKET)
    .createSignedUrl(path, 60 * 60);
  if (error) return null;
  return data?.signedUrl ?? null;
}

export async function deleteCustomerDocument(documentId: string): Promise<void> {
  const supabase = await createClient();

  const { data: doc, error } = await supabase
    .from("customer_documents")
    .select("path")
    .eq("id", documentId)
    .maybeSingle();
  if (error) throw error;
  if (!doc) return;

  await supabase.storage.from(DOCUMENTS_BUCKET).remove([doc.path]);
  const { error: delError } = await supabase
    .from("customer_documents")
    .delete()
    .eq("id", documentId);
  if (delError) throw delError;
}
